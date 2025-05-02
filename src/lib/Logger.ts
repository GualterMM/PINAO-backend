import winston from 'winston';

const logFormat = winston.format.printf(({ level, message, timestamp, stack }) => {
	return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
});

export class Logger {
	private static logger: winston.Logger;

	public static CreateLogger() {
		if (this.logger) {
			return;
		}

		this.logger = winston.createLogger({
			level: 'debug',
			format: winston.format.combine(
				winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
				winston.format.errors({ stack: true }),
				logFormat),
			transports: [
				new winston.transports.Console(
					{ format: winston.format.colorize({ all: true }) }),
			]
		});

		winston.addColors({
      error : 'red',
      warn : 'yellow',
      info : 'cyan',
      http : 'white',
      debug : 'green'
    })
	}

	static error(...args: any[]) { this.logger.error([...args]); }
	static warn(...args: any[]) { this.logger.warn([...args]); }
	static info(...args: any[]) { this.logger.info([...args]); }
	static verbose(...args: any[]) { this.logger.verbose([...args]); }
	static http(...args: any[]) { this.logger.http([...args]); }
	static debug(...args: any[]) { this.logger.debug([...args]); }
	static silly(...args: any[]) { this.logger.silly([...args]); }
	
};

export function SetupLogger() {
	Logger.CreateLogger();
}

