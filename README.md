# Atlas Austral

Cartografía interactiva con Vite, React, TypeScript y un servidor Node local. Los mapas se guardan como JSON y archivos multimedia; no requiere SQL ni servicios externos.

## Ejecutar

Requiere Node.js 24 y npm. Desde la raíz:

```sh
npm install
npm run dev
```

Abrir **http://localhost:5173**. El comando inicia Vite y el servidor de archivos/autenticación en una sola terminal. Si Windows bloquea `npm.ps1`, usar `npm.cmd install` y `npm.cmd run dev`, sin cambiar la política de PowerShell.

En esta instalación ya se creó la cuenta Editor solicitada. Para configurar una cuenta en un clon nuevo:

```sh
npm run editor:create
```

El comando pide usuario y contraseña sin mostrar esta última. Guarda sólo un hash con sal en `config-private/admin.json`, excluido de Git y del frontend. Se niega a sobrescribir una cuenta existente. No hay credenciales predeterminadas en el código.

## Crear y editar mapas

1. Abrir el engranaje e ingresar con la cuenta Editor.
2. Elegir **Agregar mapa**, escribir el título y cargar la primera imagen.
3. Agregar capas desde el panel: imágenes alternativas o superposiciones independientes. Se aceptan distintas proporciones; **Ajustar imagen** permite escala y desplazamientos sin deformarla.
4. Elegir un icono/color y colocar un marcador; su formulario se abre inmediatamente. También puede colocarse por coordenadas. Cancelar descarta el marcador provisional.
5. Aplicar los cambios de formularios y pulsar **Guardar cambios** en el panel. El estado distingue cambios pendientes, guardando, guardado y error. Aplicar un formulario no equivale a guardar el mapa en disco.
6. Completar ES/PT/EN y pulsar **Publicar**. El visitante sólo ve la copia publicada. Cambios posteriores permanecen en el borrador hasta publicar nuevamente.

El catálogo empieza vacío, sin mapas de demostración. No es una versión de prueba en memoria: crear mapas, cargar archivos y guardar cambios escribe en las carpetas reales. Al recargar se leen sus JSON. Los cambios aún no guardados en el panel sí se pierden al recargar; se muestra la advertencia del navegador.

Los borradores pueden comenzar con título en español. Antes de publicar se exigen los títulos y textos alternativos en los tres idiomas; las descripciones ingresadas también deben tener sus tres versiones. El menú de cuenta permite despublicar y cerrar sesión. Las sesiones duran hasta ocho horas y se cierran al reiniciar el servidor.

## Almacenamiento portable

```text
maps-data/
  nombre-del-mapa/
    draft.json          mapa editable y revisión de guardado
    published.json      copia pública, si fue publicada
    assets.json         registro privado de archivos, MIME y miniaturas
maps-multimedia/
  nombre-del-mapa/
    layers/
    icons/
    markers/
    thumbnails/
config-private/
  admin.json            credenciales verificadoras del Editor
```

Las referencias son relativas a `maps-multimedia`, con `/` como separador, sin direcciones de máquina ni puertos. La carpeta deriva del título al crear el mapa y permanece estable si se cambia el título. Nombres repetidos reciben un sufijo. Los archivos tienen IDs opacos; el nombre original se conserva en el registro privado.

Para respaldar o trasladar el contenido: **detener la app**, copiar juntas `maps-data` y `maps-multimedia` y conservar su estructura. Para restaurar, usar esas carpetas en una instalación compatible y reiniciar. Las credenciales se configuran por separado o se copia deliberadamente `config-private`. No compartir las mismas carpetas entre dos servidores activos: el guardado está diseñado para una sola instancia.

Estas dos carpetas se versionan para que el equipo pueda compartir los mapas. Después de publicar, hay que agregar, confirmar y subir a Git los cambios de `maps-data` y `maps-multimedia`; las demás personas los reciben con el siguiente pull. Publicar en la aplicación no ejecuta Git automáticamente. `config-private` continúa excluida.

No editar JSON ni renombrar archivos mientras se ejecuta la app. El servidor valida contratos/referencias y serializa las escrituras con revisión; un conflicto devuelve 409 en lugar de sobrescribir silenciosamente. Los JSON se reemplazan mediante archivo temporal y rename. Los uploads se registran y sólo quedan públicamente accesibles si son referenciados por una publicación. No hay borrado automático de archivos: los recursos cargados y aún no incorporados a un mapa permanecen registrados para no romper referencias.

## Configuración

No es obligatorio crear `.env` para localhost. [.env.example](.env.example) documenta estos valores opcionales:

| Variable | Default | Uso |
|---|---|---|
| `API_PORT` | `5174` | Puerto del servidor local |
| `MAPS_DATA_DIR` | `maps-data` | Raíz de JSON |
| `MAPS_MULTIMEDIA_DIR` | `maps-multimedia` | Raíz de archivos |
| `PRIVATE_CONFIG_DIR` | `config-private` | Credenciales privadas |
| `APP_ORIGINS` | localhost:5173 y localhost:4173, con esquema HTTP | Orígenes admitidos para escrituras |

Las rutas relativas parten de la raíz del proyecto. Vite usa proxy hacia el backend; todas las operaciones del navegador se hacen al mismo origen. La API escucha en loopback. Las variables privadas no llevan prefijo `VITE_`.

## Comandos

| Comando | Función |
|---|---|
| `npm run dev` | Iniciar Vite y API; detener ambos con Ctrl+C |
| `npm run build` | Chequear TypeScript y compilar frontend y servidor |
| `npm run preview` | Servir el build en localhost:4173 junto con la API; requiere build previo |
| `npm run editor:create` | Configurar una cuenta Editor en una instalación nueva |
| `npm run lint` | Análisis estático, sin tolerar advertencias |
| `npm run test` | Pruebas unitarias existentes |
| `npm run test:e2e:install` | Instalar Chromium para la comprobación de navegador |
| `npm run test:e2e` | Un recorrido principal de acceso, carga, guardado y publicación en carpetas temporales |

La prueba de navegador usa puertos 5175/5176 y una cuenta aleatoria de prueba; no carga datos en tus carpetas ni utiliza la contraseña real. El lockfile fija las versiones resueltas; `npm ci` sirve para instalaciones reproducibles. No se requieren utilidades globales aparte de Node/npm.

## Organización y alcance actual

`src/` contiene UI, lienzo, traducciones y cliente HTTP. `shared/` contiene esquemas y comandos tipados. `server/` separa autenticación, procesamiento de imágenes y persistencia. `scripts/` coordina ejecución y alta de cuenta. Los fixtures restantes están únicamente en `tests/fixtures/` para validación; no se incluyen en el catálogo ni en el build.

El backend usa APIs de Node para HTTP, archivos, sesiones y scrypt; sharp valida/decodifica imágenes y genera miniaturas. Zod valida contratos y deriva tipos. No hay framework de base de datos, librerías GIS ni páginas particulares para mapas concretos.

Se validan MIME, firma mediante decodificación, extensión, peso y dimensiones. Se aceptan PNG/JPEG/WebP estáticos hasta 25 MB/40 megapíxeles; iconos hasta 2 MB/1024×1024. Estos límites son de recursos, no de relación de aspecto. Las escrituras verifican sesión y origen, con límites de intentos y cargas. El servidor no registra contraseñas ni tokens.

Quedan pendientes de fases posteriores: edición completa de medios de ficha, movimiento de marcadores por arrastre, deshacer/rehacer, recuperación de formularios tras cierre, eliminación/archivo con gestión completa de referencias y empaquetado Docker. Los cambios no guardados se conservan en pantalla ante un fallo de red, pero no sobreviven a cerrar el navegador.

Docker deberá montar las carpetas de datos fuera de la imagen y entregar builds sin fuentes TypeScript ni source maps. La aplicación ya separa esos recursos; no se creó todavía el paquete Docker. El acceso en red/producción requiere la configuración HTTPS correspondiente; `preview` es una previsualización local.

## Documentación

- [Especificación original](docs/ESPECIFICACION_ARMADOR_DE_MAPAS.md).
- [Propuesta revisada con las correcciones del usuario](docs/PROPUESTA_SIMPLIFICADA.md).
- [Cambios de Editor y guardado real](docs/CAMBIOS_EDITOR_Y_GUARDADO.md).
- [Inventario de referencias visuales](docs/ANALISIS_Y_PLAN_ATLAS_TECHNE.md).

Las capturas originales permanecen intactas. El logo y fondo se configuran en `src/app/identity.ts` a partir de los archivos provistos en `images/`.
