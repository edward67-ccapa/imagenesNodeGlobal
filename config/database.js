import { Sequelize } from 'sequelize';
import mysql from 'mysql2/promise';
import config from './env.js';

// Auto-crear la base de datos MySQL si no existe antes de conectar Sequelize
const ensureDatabaseExists = async () => {
  try {
    const connection = await mysql.createConnection({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.db.name}\`;`);
    await connection.end();
    console.log(`✅ Base de datos "${config.db.name}" verificada/creada en MySQL.`);
  } catch (error) {
    console.error('⚠️ No se pudo verificar la base de datos automáticamente en MySQL:', error.message);
  }
};

export const sequelize = new Sequelize(
  config.db.name,
  config.db.user,
  config.db.password,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: config.db.dialect,
    logging: config.nodeEnv === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
    },
  }
);

export const connectDB = async () => {
  await ensureDatabaseExists();
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión con la base de datos MySQL establecida correctamente.');
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos MySQL:', error.message);
  }
};

export default sequelize;
