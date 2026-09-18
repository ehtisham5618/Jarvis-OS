import { afterEach, describe, expect, it, vi } from "vitest";
import { OllamaService } from "../src/services/ollama/OllamaService";
import { MockModelService } from "../src/services/mock/MockModelService";
import { initializeJarvis } from "../src/core/init";
import { serviceRegistry, ServiceToken } from "../src/core/service-registry";
import { useSystemStore } from "../src/stores/system.store";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
const thread = { id: "test", messages: [], createdAt: "", updatedAt: "" };

describe("startup and local AI", () => {
  it("registers once without waiting for Ollama", async () => {
    const fetch = vi.fn(() => new Promise(() => {}));
    vi.stubGlobal("fetch", fetch);
    await Promise.all([initializeJarvis(), initializeJarvis()]);
    expect(fetch).not.toHaveBeenCalled();
    expect(serviceRegistry.resolve<OllamaService>(ServiceToken.AI).providerName).toBe("Ollama");
  });
  it("reports an unavailable provider without mock success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const service = new OllamaService();
    expect(await service.isAvailable()).toBe(false);
    await expect(
      service.chat(thread, { model: "local" })[Symbol.asyncIterator]().next(),
    ).rejects.toThrow();
  });
  it("handles split stream chunks and a final line without a newline", async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('{"message":{"content":"Hel'));
        controller.enqueue(
          encoder.encode(
            'lo"},"done":false}\n{"message":{"content":"!"},"done":true,"eval_count":2}',
          ),
        );
        controller.close();
      },
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(new Response("ok")).mockResolvedValueOnce(new Response(stream)),
    );
    const tokens = [];
    for await (const token of new OllamaService().chat(thread, { model: "local" }))
      tokens.push(token);
    expect(tokens.map((t) => t.token).join("")).toBe("Hello!");
    expect(tokens.at(-1)?.isFinal).toBe(true);
  });
  it("propagates cancellation to the HTTP request", async () => {
    const controller = new AbortController();
    controller.abort();
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    await expect(
      new OllamaService()
        .chat(thread, { model: "local", signal: controller.signal })
        [Symbol.asyncIterator]()
        .next(),
    ).rejects.toThrow();
    expect(fetch).not.toHaveBeenCalled();
  });
  it("discovers custom models without falsely installing other sizes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            models: [
              {
                name: "qwen2.5-coder:3b",
                size: 1900000000,
                details: { parameter_size: "3B", quantization_level: "Q4_K_M", family: "qwen2" },
              },
            ],
          }),
        ),
      ),
    );
    const models = await new MockModelService().getModels();
    expect(models.filter((m) => m.installed).map((m) => m.id)).toEqual(["qwen2.5-coder:3b"]);
  });
  it("does not overlap slow hardware polls or stop another subscriber", async () => {
    vi.useFakeTimers();
    serviceRegistry.clear();
    let finish: (value: unknown) => void = () => {};
    const getMetrics = vi.fn(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    serviceRegistry.register(ServiceToken.System, { getMetrics, getProcesses: async () => [] });
    const store = useSystemStore.getState();
    store.startPolling(1);
    store.startPolling(1);
    await vi.advanceTimersByTimeAsync(20000);
    expect(getMetrics).toHaveBeenCalledTimes(1);
    store.stopPolling();
    expect(useSystemStore.getState().isPolling).toBe(true);
    finish({});
    await vi.advanceTimersByTimeAsync(3000);
    expect(getMetrics).toHaveBeenCalledTimes(2);
    store.stopPolling();
    finish({});
    await vi.advanceTimersByTimeAsync(10000);
    expect(getMetrics).toHaveBeenCalledTimes(2);
  });
});
