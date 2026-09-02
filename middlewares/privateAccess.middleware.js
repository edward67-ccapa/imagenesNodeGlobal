import crypto from 'crypto';
import config from '../config/env.js';
import { errorResponse } from '../utils/responseHandler.js';

/**
 * Desencripta un texto cifrado en formato hex usando AES-256-CBC con la clave secreta configurada.
 * Formato esperado: iv_hex:ciphertext_hex
 */
const decryptToken = (encryptedText, secretKey) => {
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 2) return null;

    const iv = Buffer.from(parts[0], 'hex');
    const encryptedTextBuffer = Buffer.from(parts[1], 'hex');

    // Crear clave de 32 bytes usando SHA-256 de la secretKey
    const key = crypto.createHash('sha256').update(secretKey).digest();

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedTextBuffer);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
  } catch (error) {
    return null;
  }
};

/**
 * Middleware para validar el token de acceso privado (Frontend <-> Backend)
 */
export const verifyPrivateAccess = (req, res, next) => {
  const secretKey = config.apiSecretKey;

  // 1. Extraer token de encabezados HTTP (x-api-token o Authorization: Bearer <token>)
  const headerToken = req.headers['x-api-token'];
  const authHeader = req.headers['authorization'];
  let bearerToken = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    bearerToken = authHeader.split(' ')[1];
  }

  // 2. Extraer token de parámetros de consulta (?token=... o ?x-api-token=...)
  const queryToken = req.query.token || req.query['x-api-token'];

  // 3. Extraer token encriptado si se envió (x-api-token-encrypted o ?token_enc=...)
  const encryptedHeaderToken = req.headers['x-api-token-encrypted'];
  const encryptedQueryToken = req.query.token_enc;
  const encryptedToken = encryptedHeaderToken || encryptedQueryToken;

  // --- VALIDACIÓN 1: Comparación directa de Token Secreto ---
  const tokenProvided = headerToken || bearerToken || queryToken;

  if (tokenProvided && tokenProvided === secretKey) {
    return next();
  }

  // --- VALIDACIÓN 2: Desencriptación de Token (si viene cifrado) ---
  if (encryptedToken) {
    const decryptedValue = decryptToken(encryptedToken, secretKey);
    if (decryptedValue && (decryptedValue === secretKey || decryptedValue.includes('valid_session'))) {
      return next();
    }
  }

  // --- DENEGADO SI NINGÚN MÉTODO COINCIDE ---
  return errorResponse(
    res,
    'Acceso denegado: Token de API privado no válido o no proporcionado.',
    401
  );
};

export default verifyPrivateAccess;
