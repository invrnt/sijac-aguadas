type Context = Record<string, unknown>;

function redact(context: Context) {
  return Object.fromEntries(
    Object.entries(context).filter(
      ([key]) =>
        !/password|secret|token|documentNumber|serviceRole/i.test(key),
    ),
  );
}

function write(level: "info" | "warn" | "error", message: string, context: Context) {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...redact(context),
  };
  const output = JSON.stringify(payload);
  if (level === "error") console.error(output);
  else if (level === "warn") console.warn(output);
  else console.info(output);
}

export const logger = {
  info: (message: string, context: Context = {}) =>
    write("info", message, context),
  warn: (message: string, context: Context = {}) =>
    write("warn", message, context),
  error: (message: string, context: Context = {}) =>
    write("error", message, context),
};
