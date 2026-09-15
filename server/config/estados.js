const estadosProgresivos = [
  'Profesión de fe registrada',
  'Consejería inicial completada',
  'Asignada a voluntario',
  'Primer contacto realizado',
  'Encuentro de confirmación realizado',
  'Contactada con iglesia local',
  'Visitó la iglesia',
  'Reunión pastoral realizada',
  'Integrada a grupo o clase',
  'En discipulado',
  'En preparación para bautismo',
  'Bautizada'
];

const estadosEspeciales = [
  'No responde',
  'Información incorrecta',
  'Se mudó',
  'Prefiere otra iglesia',
  'Ya pertenece a una iglesia',
  'Necesita seguimiento adicional',
  'No desea continuar el proceso'
];

const estadosPermitidos = [...estadosProgresivos, ...estadosEspeciales];

module.exports = {
  estadosProgresivos,
  estadosEspeciales,
  estadosPermitidos
};