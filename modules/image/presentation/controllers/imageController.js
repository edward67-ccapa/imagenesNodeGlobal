import path from 'path';
import Image from '../../../../models/Image.js';
import config from '../../../../config/env.js';
import { successResponse, errorResponse } from '../../../../utils/responseHandler.js';
import { removeImageFile } from '../../../../middlewares/upload.middleware.js';

// Subir una nueva imagen con FormData (empresa, descripcion, imagen)
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'Debes enviar un archivo de imagen en la key "imagen"', 400);
    }

    const { empresa = 'general', descripcion = '' } = req.body;
    const relativeDir = req.uploadRelativeDir || 'uploads';
    const relativeFilePath = path.join(relativeDir, req.file.filename).replace(/\\/g, '/');
    const publicUrl = `${config.appUrl}/${relativeFilePath}`;

    const newImage = await Image.create({
      empresa: empresa.trim(),
      descripcion: descripcion.trim(),
      filename: req.file.filename,
      path: relativeFilePath,
      url: publicUrl,
      mimeType: req.file.mimetype,
      size: req.file.size,
    });

    return successResponse(
      res,
      newImage,
      'Imagen subida y organizada exitosamente',
      201
    );
  } catch (error) {
    if (req.file) {
      const relativeDir = req.uploadRelativeDir || 'uploads';
      removeImageFile(path.join(relativeDir, req.file.filename));
    }
    return errorResponse(res, error.message, 500);
  }
};

// Listar todas las imágenes registradas
export const getAllImages = async (req, res) => {
  try {
    const images = await Image.findAll({
      order: [['createdAt', 'DESC']],
    });
    return successResponse(res, images, 'Lista de imágenes obtenida correctamente');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Controlador flexible para buscar por ID (si es número) o por Empresa (si es texto)
export const getByParam = async (req, res) => {
  try {
    const { param } = req.params;

    // Si es un número entero, buscar por ID
    if (/^\d+$/.test(param)) {
      const image = await Image.findByPk(param);
      if (!image) {
        return errorResponse(res, 'Imagen no encontrada', 404);
      }
      return successResponse(res, image, 'Detalle de la imagen obtenido correctamente');
    }

    // Si es texto, buscar por Empresa
    const images = await Image.findAll({
      where: { empresa: param },
      order: [['createdAt', 'DESC']],
    });

    return successResponse(
      res,
      images,
      `Imágenes para la empresa "${param}" obtenidas correctamente`
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Listar imágenes filtradas por Empresa y Descripción/Subcarpeta
export const getImagesByFilter = async (req, res) => {
  try {
    const { empresa, descripcion } = req.params;
    const whereClause = { empresa };

    if (descripcion) {
      whereClause.descripcion = descripcion;
    }

    const images = await Image.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
    });

    return successResponse(
      res,
      images,
      'Imágenes filtradas obtenidas correctamente'
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Eliminar una imagen del disco y de la base de datos
export const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await Image.findByPk(id);

    if (!image) {
      return errorResponse(res, 'Imagen no encontrada', 404);
    }

    removeImageFile(image.path);
    await image.destroy();

    return successResponse(res, null, 'Imagen eliminada físicamente y de la base de datos');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
