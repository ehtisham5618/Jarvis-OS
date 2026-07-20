/**
 * IWindowsService — Windows OS Integration Contract
 *
 * Abstracts all native OS interactions so the renderer layer
 * never directly calls Electron APIs or Node.js built-ins.
 */

export interface ShellResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface FilePickerOptions {
  title?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
  multiSelections?: boolean;
}

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
}

export interface IWindowsService {
  /**
   * Execute a shell command from the allowlist.
   * Returns stdout/stderr/exitCode.
   */
  exec(command: string, args?: string[]): Promise<ShellResult>;

  /**
   * Open a file path or URL with the default OS application.
   */
  openPath(path: string): Promise<void>;

  /**
   * Read the current text from the OS clipboard.
   */
  readClipboard(): Promise<string>;

  /**
   * Write text to the OS clipboard.
   */
  writeClipboard(text: string): Promise<void>;

  /**
   * Show a native OS notification.
   */
  showNotification(opts: NotificationOptions): Promise<void>;

  /**
   * Open a native file picker dialog.
   * Returns selected file paths, or null if cancelled.
   */
  pickFile(opts?: FilePickerOptions): Promise<string[] | null>;

  /**
   * Open a native folder picker dialog.
   * Returns the selected path, or null if cancelled.
   */
  pickDir(opts?: { title?: string }): Promise<string | null>;

  /**
   * Open a native save dialog.
   * Returns the chosen path, or null if cancelled.
   */
  saveFile(opts?: { title?: string; defaultPath?: string; filters?: Array<{ name: string; extensions: string[] }> }): Promise<string | null>;

  /**
   * Kill a process by PID. Protected system PIDs are rejected in the main process.
   */
  killProcess(pid: number): Promise<void>;

  /**
   * Read an environment variable from the allowlist.
   */
  getEnv(key: string): Promise<string | null>;
}
