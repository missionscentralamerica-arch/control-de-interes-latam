const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token requerido para acceder a esta ruta.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = String(process.env.JWT_SECRET || '').trim();
    if (!secret) {
      return res.status(503).json({ message: 'La autenticación no está configurada.' });
    }

    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido o expirado.' });
  }
}

module.exports = {
  authenticateToken
};
