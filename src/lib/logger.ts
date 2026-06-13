type LogLevel = "info" | "warn" | "error";

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "***";
  return `***${digits.slice(-4)}`;
}

function sanitizeMeta(meta?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!meta) return undefined;
  const out = { ...meta };
  if (typeof out.phone === "string") out.phone = maskPhone(out.phone);
  return out;
}

function write(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  if (process.env.NODE_ENV === "production" && level === "info" && !process.env.LOG_LEVEL) {
    return;
  }
  const payload = meta ? ` ${JSON.stringify(sanitizeMeta(meta))}` : "";
  const line = `[${level}] ${message}${payload}\n`;
  if (level === "error") process.stderr.write(line);
  else process.stdout.write(line);
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => write("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => write("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => write("error", message, meta),
};
