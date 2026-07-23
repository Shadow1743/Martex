// Middleware de autenticación simple para rutas admin
// Usa un token en memoria (sessionStorage del lado del cliente)

function authMiddleware(req, res, next) {
  const token = req.headers['authorization'];
  const secretKey = process.env.SECRET_KEY || 'martex_secret_key_2024';
  
  if (!token || token !== `Bearer ${secretKey}`) {
    return res.status(401).json({ error: 'No autorizado. Inicie sesión como administrador.' });
  }
  
  next();
}

module.exports = authMiddleware;

