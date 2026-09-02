import app, { startServer } from './server.js';

// Inicializar el servidor y la base de datos para cPanel (Phusion Passenger)
startServer();

export default app;
