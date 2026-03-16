import cors from 'cors';

export const corsMiddleware = cors({
  // 1. Origen exacto del frontend
  origin: 'http://localhost:5173', 
  
  // 2. CRUCIAL: Permite el envío de cookies y headers de autenticación
  credentials: true, 
  
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  
  // 3. Añade 'Authorization' para que el frontend pueda enviar el Access Token
  allowedHeaders: ['Content-Type', 'Authorization'] 
});