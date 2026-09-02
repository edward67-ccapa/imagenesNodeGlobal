import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'db_imagenes',
    dialect: process.env.DB_DIALECT || 'mysql',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  apiSecretKey: process.env.API_SECRET_KEY || 'mi_token_privado_secreto_12345',
  maxFileSizeMb: process.env.MAX_FILE_SIZE_MB ? Number(process.env.MAX_FILE_SIZE_MB) : 5,
};

export default config;
