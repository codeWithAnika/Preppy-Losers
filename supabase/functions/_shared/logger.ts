type LogLevel = "info" | "warn" | "error";

interface LogPayload {
  [key: string]: unknown;
}

export function logPayment(
  scope: string,
  message: string,
  payload?: LogPayload,
  level: LogLevel = "info"
): void {
  const entry = {
    ts: new Date().toISOString(),
    scope,
    message,
    ...payload,
  };

  if (level === "error") {
    console.error(JSON.stringify(entry));
    return;
  }

  if (level === "warn") {
    console.warn(JSON.stringify(entry));
    return;
  }

  console.log(JSON.stringify(entry));
}

export function logPaymentError(
  scope: string,
  message: string,
  error: unknown,
  payload?: LogPayload
): void {
  logPayment(
    scope,
    message,
    {
      ...payload,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
    },
    "error"
  );
}
