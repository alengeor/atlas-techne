# Editor, mapas propios y persistencia real

El usuario pidió retirar los mapas de demostración, admitir cualquier relación de aspecto y crear el perfil Editor con las credenciales indicadas en el chat. También pidió reducir las pruebas. Estas correcciones autorizan conectar el servidor y el almacenamiento acordado previamente.

## Cambios

- Catálogo real vacío hasta que el Editor cree mapas. Los fixtures se retiraron del frontend y de los assets públicos; sólo quedan datos de validación aislados en tests.
- Login/logout de Editor con sesión de servidor y cookie HttpOnly/SameSite. Cuenta configurada en archivo privado con scrypt y sal, sin contraseña incorporada al bundle ni a la documentación versionada.
- Vite y Node se inician juntos con `npm run dev`; `preview` también coordina API y build.
- Creación de mapas y carga real de imágenes; JSON en `maps-data/<nombre>` y archivos en `maps-multimedia/<nombre>`. Rutas relativas y nombre de carpeta estable.
- Guardado explícito por cambios tipados de entidad, revisión y sustitución de JSON. Los formularios aplican al borrador en pantalla; Guardar cambios confirma la persistencia de ese borrador.
- Imágenes con cualquier proporción, sin estirarlas. Escala y desplazamiento ajustables por capa; el viewport sigue siendo común.
- Publicación de una copia coherente y acceso anónimo exclusivamente a sus mapas/archivos. Traducciones obligatorias se comprueban al publicar, no al comenzar un borrador.

## Verificación acotada

Se mantuvieron las 19 pruebas unitarias existentes y se sustituyó la batería anterior de 10 e2e por un único recorrido integrado. Se ejecutó correctamente: ingreso, catálogo vacío, mapa nuevo, capa de proporción diferente, guardado, recarga, existencia de JSON/archivos, denegación de escritura/asset privado a visitante y publicación. Usa datos temporales ajenos a las carpetas operativas.

Lint y build se verifican antes de entregar. npm informó cero vulnerabilidades después de actualizar las versiones incorporadas de sharp y esbuild. La primera actualización de esbuild quedó interrumpida porque Windows tenía bloqueado el ejecutable del Vite anterior; se detuvo ese proceso y se completó la instalación. Persisten dos advertencias de Rollup sobre comentarios de Zod, sin impedir el build.

## Límites explícitos

Una sola instancia escritora por almacenamiento; no hay bloqueo distribuido. La copia de ambas carpetas debe hacerse con la app detenida. Hay validación de versiones y referencias, pero no se ensayó todavía migración entre Windows y Docker/Linux.

Los archivos subidos quedan registrados en `assets.json`, aunque luego se cancele su incorporación a un marcador/capa. No se borran automáticamente recursos todavía referenciados; la limpieza y gestión completa de biblioteca se completará en otra fase. No hay recuperación persistente de formularios pendientes ni deshacer/rehacer.

El perfil solicitado ya puede crear y guardar mapas reales. Esta entrega no completa todas las funciones del producto original: multimedia editorial completa, arrastre de marcadores, archivo/eliminación y Docker siguen pendientes. No se crearon mapas de ejemplo en las carpetas del usuario ni se hicieron commits.
