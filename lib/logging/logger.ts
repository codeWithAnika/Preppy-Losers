type LogLevel = "debug" | "info" | "warn" | "error";

export type LogCategory =
  | "api"
  | "auth"
  | "payment"
  | "order"
  | "security"
  | "system";

export interface StructuredLogEntry {
  ts: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  requestId?: string;
  userId?: string;
  path?: string;
  method?: string;
  statusCode?: number;
  durationMs?: number;
  ip?: string;
  errorMessage?: string;
  errorStack?: string;
  meta?: Record<string, unknown>;
}

function emit(entry: StructuredLogEntry): void {
  const line = JSON.stringify(entry);

  switch (entry.level) {
    case "error":
      console.error(line);
      break;
    case "warn":
      console.warn(line);
      break;
    case "debug":
      if (process.env.LOG_LEVEL === "debug") {
        console.debug(line);
      }
      break;
    default:
      console.log(line);
  }
}

function baseEntry(
  level: LogLevel,
  category: LogCategory,
  message: string,
  fields?: Partial<StructuredLogEntry>
): StructuredLogEntry {
  return {
    ts: new Date().toISOString(),
    level,
    category,
    message,
    ...fields,
  };
}

export const logger = {
  debug(
    category: LogCategory,
    message: string,
    fields?: Partial<StructuredLogEntry>
  ) {
    emit(baseEntry("debug", category, message, fields));
  },

  info(
    category: LogCategory,
    message: string,
    fields?: Partial<StructuredLogEntry>
  ) {
    emit(baseEntry("info", category, message, fields));
  },

  warn(
    category: LogCategory,
    message: string,
    fields?: Partial<StructuredLogEntry>
  ) {
    emit(baseEntry("warn", category, message, fields));
  },

  error(
    category: LogCategory,
    message: string,
    error?: unknown,
    fields?: Partial<StructuredLogEntry>
  ) {
    emit(
      baseEntry("error", category, message, {
        ...fields,
        errorMessage:
          error instanceof Error ? error.message : error ? String(error) : undefined,
        errorStack: error instanceof Error ? error.stack : undefined,
      })
    );
  },

  apiRequest(fields: {
    method: string;
    path: string;
    statusCode: number;
    durationMs: number;
    ip?: string;
    userId?: string;
    requestId?: string;
  }) {
    const level: LogLevel = fields.statusCode >= 500 ? "error" : "info";
    emit(
      baseEntry(level, "api", `${fields.method} ${fields.path}`, {
        ...fields,
      })
    );
  },
};
