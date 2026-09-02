import { Router } from 'express';
import {
  uploadImage,
  getAllImages,
  getByParam,
  getImagesByFilter,
  deleteImage,
} from '../controllers/imageController.js';
import { uploadImageMiddleware } from '../../../../middlewares/upload.middleware.js';
import { uploadLimiter } from '../../../../middlewares/rateLimit.middleware.js';

const router = Router();

// 1. Subir imagen (FormData: empresa, descripcion, imagen) protegida por rate limiter de subidas por IP
router.post('/upload', uploadLimiter, uploadImageMiddleware.single('imagen'), uploadImage);

// 2. Listar TODAS las imágenes: GET /api/v1/images
router.get('/', getAllImages);

// 3. Listar por Empresa Y Descripción: GET /api/v1/images/empresa/:empresa/:descripcion(*) O GET /api/v1/images/:empresa/:descripcion(*)
router.get('/empresa/:empresa/:descripcion(*)', getImagesByFilter);
router.get('/:empresa/:descripcion(*)', getImagesByFilter);

// 4. Listar por ID (numérico) O por Empresa (texto): GET /api/v1/images/4 O GET /api/v1/images/general O GET /api/v1/images/empresa/general
router.get('/empresa/:param', getByParam);
router.get('/id/:param', getByParam);
router.get('/:param', getByParam);

// 5. Eliminar imagen por ID: DELETE /api/v1/images/:id
router.delete('/:id', deleteImage);

export default router;
