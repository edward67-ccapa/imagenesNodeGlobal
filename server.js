import express from 'express';
import path from 'path';
import config from './config/env.js';
import { sequelize, connectDB } from './config/database.js';
import corsMiddleware from './middlewares/cors.middleware.js';
import verifyPrivateAccess from './middlewares/privateAccess.middleware.js';
import mainRouter from './routes/index.js';
import './models/index.js'; // Cargar definición del modelo Image

const app = express();

// 1. Middlewares globales
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Servidor de archivos estáticos privado para acceso a imágenes (requiere token de acceso)
app.use('/uploads', verifyPrivateAccess, express.static(path.join(process.cwd(), 'uploads')));

// 3. Montar rutas principales de la API REST protegidas por token de acceso privado
app.use('/api/v1', verifyPrivateAccess, mainRouter);

// 4. Ruta de comprobación de salud (Health Check)
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API REST de Gestión de Imágenes funcionando correctamente',
    version: '1.0.0',
    endpoints: {
      upload: 'POST /api/v1/images/upload',
      getAll: 'GET /api/v1/images',
      getByEmpresa: 'GET /api/v1/images/empresa/:empresa',
      getByFilter: 'GET /api/v1/images/empresa/:empresa/:descripcion',
      getById: 'GET /api/v1/images/id/:id',
      delete: 'DELETE /api/v1/images/:id',
    },
  });
});

// 5. Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error no capturado:', err.message);
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
  });
});

// 6. Iniciar base de datos y servidor HTTP
export const startServer = async () => {
  await connectDB();

  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Tablas sincronizadas con Sequelize.');
  } catch (error) {
    console.error('⚠️ Advertencia en sincronización Sequelize:', error.message);
  }

  const PORT = config.port;
  const server = app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en: ${config.appUrl}`);
    console.log(`📂 Carpeta de uploads estática: ${config.appUrl}/uploads`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ El puerto ${PORT} ya está en uso por otro proceso.`);
      console.error(`👉 Ejecuta 'fuser -k -9 ${PORT}/tcp' o cierra la otra consola.`);
    } else {
      console.error('❌ Error en el servidor HTTP:', error.message);
    }
  });

  return server;
};

// Arrancar si se ejecuta directamente con `node server.js`
if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  startServer();
}

export default app;
