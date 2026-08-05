const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };

const threshold = (process.env.LOG_LEVEL || 'info').toLowerCase();
const levelRank = (name) => LEVELS[name] ?? LEVELS.info;

function write(level, args) {
  if (levelRank(level) < levelRank(threshold)) return;

  const prefix = `[analyze-url:${level.toUpperCase()}]`;
  const message = args.map((arg) => (arg instanceof Error ? arg.stack || arg.message : arg));
  const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;

  fn(prefix, ...message);
}

export const logger = {
  debug: (...args) => write('debug', args),
  info: (...args) => write('info', args),
  warn: (...args) => write('warn', args),
  error: (...args) => write('error', args),
};
