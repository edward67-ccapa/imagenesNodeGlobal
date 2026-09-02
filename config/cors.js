import config from './env.js';

const origins = config.cors.origin === '*'
  ? '*'
  : config.cors.origin.split(',').map((o) => o.trim());

export const corsOptions = {
  origin: origins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200,
};

export default corsOptions;
