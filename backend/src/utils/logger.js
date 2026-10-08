const write = (level, message, meta) => {
  const line = `${new Date().toISOString()} [${level}] ${message}`;
  const output = level === "ERROR" ? console.error : level === "WARN" ? console.warn : console.info;
  if (meta === undefined) output(line);
  else output(line, meta);
};

export const logger = {
  info: (message, meta) => write("INFO", message, meta),
  warn: (message, meta) => write("WARN", message, meta),
  error: (message, meta) => write("ERROR", message, meta),
};
