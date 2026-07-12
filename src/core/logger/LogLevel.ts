/**
 * Jarvis Logger — Log Level Definitions
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
}

export const LogLevelName: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: "DEBUG",
  [LogLevel.INFO]: "INFO",
  [LogLevel.WARN]: "WARN",
  [LogLevel.ERROR]: "ERROR",
  [LogLevel.SILENT]: "SILENT",
};

export const LogLevelColor: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: "#7e8794",
  [LogLevel.INFO]: "#61c7ff",
  [LogLevel.WARN]: "#fbbf24",
  [LogLevel.ERROR]: "#f87171",
  [LogLevel.SILENT]: "transparent",
};
