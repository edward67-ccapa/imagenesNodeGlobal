import { Router } from 'express';
import imageRoutes from '../modules/image/presentation/routes/imageRoutes.js';

const router = Router();

// Rutas de módulos para la API REST de imágenes
router.use('/images', imageRoutes);

export default router;
