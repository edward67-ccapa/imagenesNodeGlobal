# API REST de Gestión e Imágenes Organizadas por Empresa y Proyecto

API REST construida con **Node.js**, **Express**, **Sequelize (MySQL)** y **Multer**, diseñada específicamente para la carga, almacenamiento, organización en carpetas físicas dinámicas y despliegue en **cPanel**.

---

## 🚀 Características Principales

- **Carga Dinámica de Imágenes**: Organiza automáticamente las imágenes en el servidor creando estructuras de carpetas a partir de los datos recibidos en el `FormData`:
  - `empresa`: Nombre de la empresa o carpeta principal (ej. `fombiopol`).
  - `descripcion`: Subcarpeta o categoría (ej. `productos/almacen1`).
  - `imagen`: Archivo físico (`.jpg`, `.png`, `.webp`, `.gif`).
- **Base de Datos MySQL**: Registro de metadatos (`id`, `empresa`, `descripcion`, `filename`, `path`, `url`, `size`, `mimeType`) utilizando **Sequelize ORM**.
- **Servidor Estático Integrado**: Acceso público instantáneo a las imágenes vía HTTP/HTTPS.
- **Preparado para cPanel**: Compatible con **Phusion Passenger** y **Node.js Selector** mediante `app.js` y `.htaccess`.

---

## 📁 Estructura del Proyecto

```text
imagenes/
├── .env                            # Variables de entorno (DB, puerto, URL)
├── .env.example
├── .gitignore
├── .htaccess                       # Configuración Phusion Passenger / Apache cPanel
├── app.js                          # Punto de entrada para cPanel
├── server.js                       # Servidor Express y Sequelize
├── package.json
├── config/
│   ├── env.js                      # Carga de variables de entorno
│   ├── database.js                 # Conexión Sequelize MySQL
│   └── cors.js                     # Configuración de CORS
├── middlewares/
│   ├── cors.middleware.js          # Middleware CORS
│   └── upload.middleware.js        # Multer con creación de carpetas dinámicas
├── models/
│   ├── Image.js                    # Modelo Sequelize para la tabla 'images'
│   └── index.js
├── modules/
│   └── image/
│       └── presentation/
│           ├── controllers/
│           │   └── imageController.js  # Lógica de subir, listar y eliminar imágenes
│           └── routes/
│               └── imageRoutes.js     # Rutas de la API de imágenes
├── routes/
│   └── index.js                    # Router principal
├── uploads/                        # Carpeta física donde se guardan las imágenes
└── utils/
    └── responseHandler.js          # Respuestas JSON estandarizadas
```

---

## 🛠️ Guía de Despliegue en cPanel

### Paso 1: Crear la Base de Datos en cPanel
1. Inicia sesión en tu cPanel.
2. Dirígete a **Bases de datos MySQL®** o **Asistente para bases de datos MySQL®**.
3. Crea una nueva base de datos (ejemplo: `usuario_db_imagenes`).
4. Crea un usuario MySQL y asígnale una contraseña segura.
5. Otorga **TODOS LOS PERMISOS** al usuario sobre la base de datos creada.

### Paso 2: Subir el Proyecto a cPanel
1. Sube los archivos de este proyecto al directorio de tu hosting (ejemplo: `/home/tu_usuario/api_imagenes`).
2. Asegúrate de incluir la carpeta `uploads/`.

### Paso 3: Configurar Node.js Selector en cPanel
1. En cPanel, busca y abre **Setup Node.js App** (Configurar aplicación Node.js).
2. Haz clic en **Create Application** (Crear Aplicación).
3. Rellena los campos:
   - **Node.js Version**: Selecciona Node.js **18.x** o **20.x**.
   - **Application mode**: `Production`.
   - **Application root**: `api_imagenes` (o la carpeta donde subiste el código).
   - **Application URL**: `midominio.com` o `api.midominio.com`.
   - **Application startup file**: `app.js`.
4. Haz clic en **Create**.

### Paso 4: Configurar Variables de Entorno en `.env`
Edita el archivo `.env` en cPanel o en la sección **Environment variables** de Node.js Selector:

```env
PORT=3000
NODE_ENV=production
APP_URL=https://midominio.com

DB_HOST=localhost
DB_PORT=3306
DB_USER=tu_usuario_cpanel_mysql
DB_PASSWORD=tu_password_mysql
DB_NAME=tu_base_de_datos_mysql
DB_DIALECT=mysql

CORS_ORIGIN=*
```

### Paso 5: Instalar Dependencias y Reiniciar
1. En Node.js Selector de cPanel, haz clic en el botón **Run JS script** -> `NPM Install` o ejecuta desde la terminal de cPanel:
   ```bash
   npm install
   ```
2. Haz clic en **Restart Application**.
3. Sequelize creará automáticamente la tabla `images` en tu base de datos MySQL al arrancar.

---

## 📡 Documentación de la REST API

### 1. Subir Imagen
- **Método**: `POST`
- **URL**: `/api/v1/images/upload`
- **Body**: `FormData` (`multipart/form-data`)

| Key | Tipo | Requerido | Ejemplo |
| :--- | :--- | :--- | :--- |
| `empresa` | Text | Sí | `fombiopol` |
| `descripcion` | Text | No | `productos/almacen1` o `paracetamol` |
| `imagen` | File | Sí | *(Archivo de imagen .jpg, .png, .webp)* |

#### Ejemplo de Respuesta `201 Created`:
```json
{
  "success": true,
  "message": "Imagen subida y organizada exitosamente",
  "data": {
    "id": 1,
    "empresa": "fombiopol",
    "descripcion": "productos/almacen1",
    "filename": "paracetamol-1724784920123.jpg",
    "path": "uploads/fombiopol/productos/almacen1/paracetamol-1724784920123.jpg",
    "url": "https://midominio.com/uploads/fombiopol/productos/almacen1/paracetamol-1724784920123.jpg",
    "mimeType": "image/jpeg",
    "size": 245890,
    "updatedAt": "2026-08-27T20:50:00.000Z",
    "createdAt": "2026-08-27T20:50:00.000Z"
  }
}
```

---

### 2. Listar Todas las Imágenes
- **Método**: `GET`
- **URL**: `/api/v1/images`

---

### 3. Listar Imágenes por Empresa
- **Método**: `GET`
- **URL**: `/api/v1/images/empresa/:empresa`
- **Ejemplo**: `/api/v1/images/empresa/fombiopol`

---

### 4. Listar Imágenes por Empresa y Descripción
- **Método**: `GET`
- **URL**: `/api/v1/images/empresa/:empresa/:descripcion`
- **Ejemplo**: `/api/v1/images/empresa/fombiopol/productos/almacen1`

---

### 5. Obtener Detalle de Imagen por ID
- **Método**: `GET`
- **URL**: `/api/v1/images/id/:id`

---

### 6. Eliminar Imagen
- **Método**: `DELETE`
- **URL**: `/api/v1/images/:id`
- *(Elimina el archivo físico de la carpeta en el disco y remueve el registro en MySQL)*.

---

## 🧪 Desarrollo Local

Para ejecutar localmente con `nodemon`:

```bash
npm run dev
```

El servidor iniciará en `http://localhost:3000`.
