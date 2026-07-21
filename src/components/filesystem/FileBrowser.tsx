/**
 * FileBrowser
 *
 * Full-featured file system browser using the jarvisOS IPC fs bridge.
 * Features: breadcrumb nav, file icons by extension, keyboard nav,
 * double-click to open, right-click context menu.
 */

import { useState, useEffect, useCallback, useRef, type KeyboardEvent } from "react";
import {
  Folder,
  FolderOpen,
  File,
  FileText,
  FileCode,
  FileImage,
  FileVideo,
  FileAudio,
  ArrowLeft,
  ChevronRight,
  MoreHorizontal,
  Copy,
  Trash2,
  ExternalLink,
  Home,
  Download,
  FileArchive,
  RefreshCcw,
} from "lucide-react";
import { serviceRegistry, ServiceToken } from "@/core/service-registry";
import type { IWindowsService } from "@/services/interfaces/IWindowsService";

interface FsEntry {
  name: string;
  isDir: boolean;
  size?: number;
  modified?: string;
}

function getFileIcon(name: string, isDir: boolean) {
  if (isDir) return Folder;
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const codeExts = [
    "ts",
    "tsx",
    "js",
    "jsx",
    "py",
    "rs",
    "go",
    "cpp",
    "c",
    "h",
    "java",
    "cs",
    "json",
    "yaml",
    "toml",
    "html",
    "css",
  ];
  const imgExts = ["png", "jpg", "jpeg", "gif", "svg", "webp", "ico", "bmp"];
  const vidExts = ["mp4", "mov", "avi", "mkv", "webm"];
  const audExts = ["mp3", "wav", "flac", "ogg", "m4a"];
  const arcExts = ["zip", "rar", "7z", "tar", "gz"];
  const txtExts = ["txt", "md", "mdx", "log", "csv"];
  if (codeExts.includes(ext)) return FileCode;
  if (imgExts.includes(ext)) return FileImage;
  if (vidExts.includes(ext)) return FileVideo;
  if (audExts.includes(ext)) return FileAudio;
  if (arcExts.includes(ext)) return FileArchive;
  if (txtExts.includes(ext)) return FileText;
  return File;
}

function formatSize(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

interface ContextMenuState {
  x: number;
  y: number;
  entry: FsEntry;
}

export function FileBrowser({ startPath }: { startPath?: string }) {
  const [currentPath, setCurrentPath] = useState(startPath ?? "C:\\Users");
  const [entries, setEntries] = useState<FsEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const windowsService = serviceRegistry.resolve<IWindowsService>(ServiceToken.Windows);

  const loadDir = useCallback(async (path: string) => {
    setLoading(true);
    setError(null);
    setSelectedIdx(-1);
    try {
      // Use the IPC fs.listDir bridge
      const api = (window as any).jarvisOS?.fs;
      let items: FsEntry[];
      if (api) {
        items = await api.listDir(path);
      } else {
        // Mock fallback in browser
        items = [
          { name: "Documents", isDir: true },
          { name: "Downloads", isDir: true },
          { name: "Desktop", isDir: true },
          { name: "README.md", isDir: false, size: 2048 },
          { name: "notes.txt", isDir: false, size: 512 },
        ];
      }
      // Sort: dirs first, then files, each alphabetically
      items.sort((a, b) => {
        if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
      setEntries(items);
      setCurrentPath(path);
    } catch (err: any) {
      setError(err.message ?? "Failed to load directory");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDir(currentPath); }, []);  // eslint-disable-line

  // Breadcrumb segments
  const pathSegments = currentPath.replace(/\\/g, "/").split("/").filter(Boolean);

  const navigateTo = (path: string) => loadDir(path);

  const goUp = () => {
    const parts = currentPath.replace(/\\/g, "\\").split("\\");
    if (parts.length > 1) {
      parts.pop();
      navigateTo(parts.join("\\") || "C:\\");
    }
  };

  const openEntry = async (entry: FsEntry, path: string) => {
    if (entry.isDir) {
      navigateTo(path);
    } else {
      await windowsService.openPath(path);
    }
  };

  const fullPath = (name: string) => `${currentPath.replace(/[\\/]+$/, "")}\\${name}`;

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowDown") {
      setSelectedIdx((i) => Math.min(i + 1, entries.length - 1));
    } else if (e.key === "ArrowUp") {
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && selectedIdx >= 0) {
      const entry = entries[selectedIdx];
      openEntry(entry, fullPath(entry.name));
    } else if (e.key === "Backspace") {
      goUp();
    }
  };

  const handleContextMenu = (e: React.MouseEvent, entry: FsEntry) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, entry });
  };

  const closeContext = () => setContextMenu(null);

  return (
    <div
      className="flex h-full flex-col focus:outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={closeContext}
      ref={listRef}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-white/[0.04] px-4 py-2.5">
        <button
          onClick={goUp}
          className="grid size-7 place-items-center rounded-lg text-white/40 transition hover:bg-white/[0.06] hover:text-white/80"
        >
          <ArrowLeft className="size-4" />
        </button>
        <button
          onClick={() => loadDir(currentPath)}
          className="grid size-7 place-items-center rounded-lg text-white/40 transition hover:bg-white/[0.06] hover:text-white/80"
        >
          <RefreshCcw className="size-3.5" />
        </button>

        {/* Breadcrumbs */}
        <div className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto">
          {pathSegments.map((seg, i) => {
            const segPath = pathSegments.slice(0, i + 1).join("\\");
            return (
              <div key={i} className="flex items-center gap-0.5">
                {i > 0 && <ChevronRight className="size-3 shrink-0 text-white/20" />}
                <button
                  onClick={() => navigateTo(segPath.includes(":") ? segPath : segPath)}
                  className="rounded px-2 py-0.5 text-xs text-white/60 transition hover:bg-white/[0.05] hover:text-white/90 whitespace-nowrap"
                >
                  {seg}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* File list */}
      <div
        className="flex-1 overflow-y-auto p-2"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.08) transparent" }}
      >
        {loading && (
          <div className="flex h-32 items-center justify-center">
            <div className="size-5 animate-spin rounded-full border-2 border-[#61c7ff] border-t-transparent" />
          </div>
        )}
        {error && (
          <div className="m-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
            {error}
          </div>
        )}
        {!loading && !error && entries.length === 0 && (
          <div className="flex h-32 items-center justify-center text-sm text-white/30">
            Empty folder
          </div>
        )}
        {!loading && !error && (
          <div className="space-y-0.5">
            {entries.map((entry, idx) => {
              const Icon = getFileIcon(entry.name, entry.isDir);
              const isSelected = idx === selectedIdx;
              return (
                <div
                  key={entry.name}
                  onDoubleClick={() => openEntry(entry, fullPath(entry.name))}
                  onClick={() => setSelectedIdx(idx)}
                  onContextMenu={(e) => handleContextMenu(e, entry)}
                  className={[
                    "group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition",
                    isSelected
                      ? "bg-[#4f7dff]/15 text-white"
                      : "text-white/70 hover:bg-white/[0.04] hover:text-white/90",
                  ].join(" ")}
                >
                  <Icon
                    className={`size-4 shrink-0 ${entry.isDir ? "text-[#61c7ff]" : "text-white/40"}`}
                    strokeWidth={1.75}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm">{entry.name}</span>
                  {!entry.isDir && entry.size && (
                    <span className="shrink-0 font-mono text-[10px] text-white/25">
                      {formatSize(entry.size)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between border-t border-white/[0.04] px-4 py-1.5">
        <span className="font-mono text-[10px] text-white/25">{entries.length} items</span>
        <span className="max-w-xs truncate font-mono text-[10px] text-white/20">{currentPath}</span>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={closeContext} />
          <div
            className="fixed z-50 min-w-[180px] rounded-xl border border-white/10 bg-[#0d0f12]/95 p-1.5 shadow-2xl backdrop-blur-xl animate-fade-in-scale"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            {[
              {
                icon: ExternalLink,
                label: "Open",
                action: () => openEntry(contextMenu.entry, fullPath(contextMenu.entry.name)),
              },
              {
                icon: Copy,
                label: "Copy Path",
                action: () => {
                  windowsService.writeClipboard(fullPath(contextMenu.entry.name));
                  closeContext();
                },
              },
            ].map(({ icon: Icon, label, action }) => (
              <button
                key={label}
                onClick={() => {
                  action();
                  closeContext();
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
              >
                <Icon className="size-3.5" />
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
