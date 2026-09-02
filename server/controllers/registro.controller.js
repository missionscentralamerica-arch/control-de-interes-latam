const { body, validationResult } = require('express-validator');
const pool = require('../config/db');

function validateRegistro(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  return next();
}

const registroRules = [
  body('nombre_completo').trim().notEmpty().withMessage('El nombre completo es obligatorio.'),
  body('correo').isEmail().withMessage('El correo no tiene un formato válido.'),
  body('telefono')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 20 })
    .withMessage('El teléfono no puede superar los 20 caracteres.')
    .matches(/^\+?[0-9\s().-]+$/)
    .withMessage('El teléfono no tiene un formato válido.'),
  body('codigo_postal').trim().notEmpty().withMessage('El código postal es obligatorio.'),
  body('edad').isInt({ min: 1, max: 120 }).withMessage('La edad debe estar entre 1 y 120 años.'),
  body('reconciliacion').optional().isBoolean().withMessage('El valor de reconciliación debe ser verdadero o falso.'),
  body('aceptar_cristo').optional().isBoolean().withMessage('El valor de aceptar a Cristo debe ser verdadero o falso.')
];

async function registrarPersona(req, res) {
  const { nombre_completo, correo, telefono, codigo_postal, edad, evento_descripcion, reconciliacion, aceptar_cristo } = req.body;

  const nombre = String(nombre_completo || '').trim();
  const correoNormalizado = String(correo || '').trim().toLowerCase();
  const telefonoNormalizado = String(telefono || '').trim() || null;
  const codigoPostal = String(codigo_postal || '').trim();
  const edadNumerica = Number(edad);
  const descripcion = String(evento_descripcion || '').trim();
  const reconciliacionBool = String(reconciliacion) === 'true' || reconciliacion === true;
  const aceptarCristoBool = String(aceptar_cristo) === 'true' || aceptar_cristo === true;

  if (!nombre) {
    return res.status(400).json({ message: 'El nombre completo es obligatorio.' });
  }

  const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoNormalizado);
  if (!correoValido) {
    return res.status(400).json({ message: 'El correo no tiene un formato válido.' });
  }

  if (!codigoPostal) {
    return res.status(400).json({ message: 'El código postal es obligatorio.' });
  }

  if (!Number.isInteger(edadNumerica) || edadNumerica < 1 || edadNumerica > 120) {
    return res.status(400).json({ message: 'La edad debe estar entre 1 y 120 años.' });
  }

  try {
    await pool.execute(
      `INSERT INTO personas (nombre_completo, correo, telefono, codigo_postal, edad, evento_descripcion, reconciliacion, aceptar_cristo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, correoNormalizado, telefonoNormalizado, codigoPostal, edadNumerica, descripcion || null, reconciliacionBool, aceptarCristoBool]
    );

    return res.status(201).json({ message: '¡Gracias, tu información fue registrada!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'No se pudo guardar el registro.' });
  }
}

module.exports = {
  registroRules,
  validateRegistro,
  registrarPersona
};
