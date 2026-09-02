import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import config from '../config/env.js';

// Sanitiza partes de rutas para evitar vulnerabilidades de Path Traversal
export const sanitizePathSegment = (segment) => {
  if (!segment) return '';
  return segment
    .trim()
    .replace(/\\/g, '/')
    .split('/')
    .map((part) => part.replace(/[^a-zA-Z0-9_-]/g, '_'))
    .filter(Boolean)
    .join('/');
};

// Filtro de tipos MIME para permitir solo imágenes
const imageFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error('Formato no permitido. Solo se aceptan imágenes (.jpg, .jpeg, .png, .webp, .gif)'),
      false
    );
  }
};

// Almacenamiento temporal en memoria para procesar la imagen con sharp antes de guardar
const storage = multer.memoryStorage();

export const uploadImageMiddleware = multer({
  storage: storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: (config.maxFileSizeMb || 5) * 1024 * 1024, // Límite configurable en MB
  },
});

/**
 * Procesa la imagen recibida en memoria, la convierte a formato WebP y la guarda en la carpeta física.
 */
export const convertAndSaveWebp = async (fileBuffer, originalName, empresa, descripcion) => {
  const empresaFolder = sanitizePathSegment(empresa) || 'general';
  const descripcionFolder = sanitizePathSegment(descripcion) || '';

  const relativeDir = path.join('uploads', empresaFolder, descripcionFolder);
  const fullDir = path.join(process.cwd(), relativeDir);

  // Crear la estructura de carpetas automáticamente si no existe
  if (!fs.existsSync(fullDir)) {
    fs.mkdirSync(fullDir, { recursive: true });
  }

  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const ext = path.extname(originalName).toLowerCase();
  const baseName = path
    .basename(originalName, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_');

  const filename = `${baseName}-${uniqueSuffix}.webp`;
  const fullFilePath = path.join(fullDir, filename);

  // Convertir a WebP optimizado con calidad 80 (soporta gifs animados)
  await sharp(fileBuffer, { animated: true })
    .webp({ quality: 80 })
    .toFile(fullFilePath);

  const stats = fs.statSync(fullFilePath);
  const relativeFilePath = path.join(relativeDir, filename).replace(/\\/g, '/');

  return {
    filename,
    relativeFilePath,
    fullFilePath,
    size: stats.size,
  };
};

// Función auxiliar para eliminar archivos físicos de imagen
export const removeImageFile = (relativePath) => {
  if (!relativePath) return;
  try {
    const fullPath = path.isAbsolute(relativePath)
      ? relativePath
      : path.join(process.cwd(), relativePath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    console.error('Error eliminando archivo físico de imagen:', error.message);
  }
};
