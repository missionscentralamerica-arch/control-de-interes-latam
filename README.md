# Iglesia Registro

Aplicación web ligera para registrar personas interesadas en iglesias y darles seguimiento desde un panel interno. Incluye estados de seguimiento, notas e historial completo por persona.

## Requisitos

- Node.js 18+
- MySQL 8+

## Instalación

```bash
npm install
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales de MySQL, un `JWT_SECRET` fuerte y las variables de Resend para habilitar recuperación de contraseña:

```env
RESEND_API_KEY=re_xxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev
FRONTEND_URL=https://tu-dominio.com
```

En producción, configura estas variables en el proveedor de hosting. No las subas a GitHub.

## Base de datos

Puedes crear las tablas desde el proyecto con:

```bash
npm run db:init
```

Y sembrar datos de prueba mínimos con:

```bash
npm run db:seed
```

O importar el esquema y el seed manualmente:

```bash
mysql -u TU_USUARIO -p iglesia_registro < server/db/schema.sql
mysql -u TU_USUARIO -p iglesia_registro < server/db/seed.sql
```

Si la base de datos ya existía, ejecuta `server/db/schema.sql` manualmente para añadir la columna `personas.estado_actual` y la tabla `estado_historial`. `npm run db:init` omite la inicialización cuando la tabla `personas` ya existe.

## Funcionalidades

### Registro público

En `/registro.html` cualquier persona puede enviar sus datos de contacto, código postal, edad, iglesia, voluntario, evento y decisión espiritual. El enlace público se puede copiar desde la página o compartir mediante un código QR disponible en `/qr.html`.

### Panel interno

El panel de `/dashboard.html` requiere iniciar sesión y permite:

- Consultar los registros recibidos.
- Ver los registros paginados de 10 en 10 mediante botones de navegación.
- Filtrar por fechas, código postal, iglesia, voluntario, decisiones y estado.
- Actualizar el estado actual de cada persona.
- Añadir una nota cada vez que cambia el estado.
- Consultar la línea de tiempo completa de estados, del más reciente al más antiguo.
- Exportar los registros filtrados a PDF, incluyendo el estado actual.
- Copiar el enlace público y consultar el código QR.

### Estados de seguimiento

Los estados se definen en `server/config/estados.js` y se muestran en este orden.

Estados progresivos:

1. Profesión de fe registrada
2. Consejería inicial completada
3. Asignada a voluntario
4. Primer contacto realizado
5. Encuentro de confirmación realizado
6. Contactada con iglesia local
7. Visitó la iglesia
8. Reunión pastoral realizada
9. Integrada a grupo o clase
10. En discipulado
11. En preparación para bautismo
12. Bautizada

Categorías especiales:

- No responde
- Información incorrecta
- Se mudó
- Prefiere otra iglesia
- Ya pertenece a una iglesia
- Necesita seguimiento adicional
- No desea continuar el proceso

Cada cambio actualiza `personas.estado_actual` y crea un registro en `estado_historial` con estado, nota opcional y fecha.

## API principal

### Rutas públicas

```text
POST /api/registro
GET  /api/qr
GET  /config.js
```

### Autenticación

```text
POST /api/auth/login
POST /api/auth/solicitar-reset
POST /api/auth/reset-password
```

El login devuelve un JWT válido durante 8 horas. Las rutas internas requieren el encabezado `Authorization: Bearer <token>`.

### Personas y seguimiento

```text
GET   /api/personas
GET   /api/personas/export
PATCH /api/personas/:id/estado
GET   /api/personas/:id/historial
```

`GET /api/personas` acepta filtros como `desde`, `hasta`, `codigo_postal`, `iglesia`, `voluntario`, `reconciliacion`, `aceptar_cristo` y `estado`. También acepta `page` para consultar una página de 10 registros. La respuesta incluye `data` y `pagination` con la página actual, el total y el número de páginas.

## Generar hash de contraseña para un usuario de prueba

```bash
node -e "const bcrypt=require('bcryptjs'); const password='Admin123!'; bcrypt.hash(password, 10).then(hash => console.log(hash));"
```

Luego reemplaza el valor del hash en `server/db/seed.sql` si deseas usar otra contraseña.

## Ejecutar la app

```bash
npm start
```

La app servirá:

- `http://localhost:3000/registro.html` para el formulario público
- `http://localhost:3000/login.html` para autenticación
- `http://localhost:3000/dashboard.html` para el panel interno

## Recuperación de contraseña

Para habilitar el envío de enlaces de recuperación configura `RESEND_API_KEY`, `RESEND_FROM_EMAIL` y `FRONTEND_URL`. Las contraseñas se almacenan usando hashes de `bcryptjs`; nunca guardes contraseñas en texto plano ni subas el archivo `.env` al repositorio.
