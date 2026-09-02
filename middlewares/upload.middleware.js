import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Sanitiza partes de rutas para evitar vulnerabilidades de Path Traversal
const sanitizePathSegment = (segment) => {
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

// Configuración de almacenamiento en disco dinámico
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const empresaFolder = sanitizePathSegment(req.body.empresa) || 'general';
    const descripcionFolder = sanitizePathSegment(req.body.descripcion) || '';

    // Ruta física: /opt/lampp/htdocs/imagenes/uploads/[empresa]/[descripcion]
    const relativePath = path.join('uploads', empresaFolder, descripcionFolder);
    const fullPath = path.join(process.cwd(), relativePath);

    // Crear la estructura de carpetas automáticamente si no existe
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }

    req.uploadRelativeDir = relativePath;
    cb(null, fullPath);
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_');

    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

export const uploadImageMiddleware = multer({
  storage: storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // Límite de 15MB por imagen
  },
});

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
