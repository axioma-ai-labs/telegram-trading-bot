import { Logtail } from '@logtail/node';
import { LogtailTransport } from '@logtail/winston';
import winston from 'winston';

import { config } from '@/config/config';

const logtail = new Logtail(config.betterstack.sourceToken, {
  endpoint: config.betterstack.endpoint,
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new LogtailTransport(logtail),
  ],
});

export default logger;
