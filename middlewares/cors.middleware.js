import cors from 'cors';
import corsOptions from '../config/cors.js';

export const corsMiddleware = cors(corsOptions);

export default corsMiddleware;
