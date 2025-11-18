export interface ILogger {
  error(message: string, data?: unknown): void;
  info(message: string, data?: unknown): void;
  warning(message: string, data?: unknown): void;
}

export class Logger implements ILogger {
  error(message: string, data?: unknown): void {
    console.error(`ERROR: ${message}`, data);
  }

  info(message: string, data?: unknown): void {
    console.info(`INFO: ${message}`, data);
  }

  warning(message: string, data?: unknown): void {
    console.warn(`WARNING: ${message}`, data);
  }
}