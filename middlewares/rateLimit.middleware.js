import rateLimit from 'express-rate-limit';

// Limitador de peticiones general para las rutas de la API (100 peticiones por 15 min por IP)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 peticiones por IP por ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiadas peticiones desde esta IP. Por favor intenta de nuevo en 15 minutos.',
  },
});

// Limitador estricto para subida de imágenes (20 subidas por 15 min por IP)
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // Límite de 20 subidas de imágenes por IP por ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Límite de subidas de imágenes alcanzado para esta IP. Máximo 20 imágenes cada 15 minutos.',
  },
});
