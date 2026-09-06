# Atlas Austral — propuesta simplificada

> Actualización de implementación: el usuario pidió retirar los ejemplos, admitir cualquier proporción de imagen y habilitar el perfil Editor con credenciales. El frontend ya utiliza un servidor Node y JSON reales; las restricciones de proporción y el modo de prueba de la primera fase quedaron reemplazados. Ver [estado actual](CAMBIOS_EDITOR_Y_GUARDADO.md).

## Corrección de alcance

Esta revisión responde a la aclaración del usuario posterior al análisis inicial: las capas son imágenes alineadas y su selección es parte central de la experiencia; el frontend debe verse casi igual a las capturas; el logo del museo se proporcionará después como PNG; la aplicación debe ser sencilla.

La aclaración posterior prevalece sobre las decisiones propuestas anteriormente. No se modifica la especificación original. El inventario de las doce capturas permanece en [el análisis inicial](ANALISIS_Y_PLAN_ATLAS_TECHNE.md).

## Capas como interacción principal

Cada mapa contiene una colección ordenada de capas. Cada capa corresponde a una imagen preparada para coincidir con las otras en el mismo espacio visual. La primera imagen establece las dimensiones y proporción de referencia del lienzo; no constituye un mapa separado ni limita el mapa a una imagen.

Todas las imágenes comparten rectángulo, origen y transformación de zoom/paneo. Al cambiar o activar una capa, se conserva la posición del visitante y los marcadores permanecen alineados. No se ajusta cada imagen de forma independiente al tamaño de la ventana.

Dos interacciones genéricas cubren las referencias:

- Imágenes alternativas opacas: seleccionar una a la vez dentro de un grupo, como las opciones de «Mapa Base» de las capturas.
- Superposiciones transparentes: activar o desactivar varias mediante las opciones de «Elementos Interactivos».

Esta distinción es configuración del mapa, no páginas especiales. La existencia de los dos modos es una propuesta de interacción basada en las capturas; no obliga a usar ambos en cada mapa. Se conservan orden, nombre localizado y visibilidad inicial por capa. Los marcadores pueden mostrarse en todas las capas o asociarse a capas concretas mediante IDs, de manera genérica.

La alineación supone imágenes ya registradas: compartir proporción no garantiza que su contenido coincida. Se admiten imágenes de cualquier relación de aspecto; se presentan conservando su proporción y pueden ajustarse en escala y desplazamiento. No se rechaza una capa por diferir del lienzo ni se estira silenciosamente.

## Apariencia

El objetivo es reproducir de cerca la composición de las capturas: portada con panel y tarjetas azules, títulos dorados, idioma inferior izquierdo, acceso editorial superior derecho, lienzo amplio, información inferior izquierda, selector de capas inferior derecho y fichas/modales centrados.

Se construirán esos controles con React y CSS, respetando tamaños, transparencias, bordes, tipografía aproximada y espaciado de referencia. Se adaptarán a otras pantallas y se corregirán objetivos táctiles o problemas de foco sin rediseñar innecesariamente la identidad visual.

El PNG del museo será un recurso de identidad configurable de la instalación cuando esté disponible. No se extraerá de la captura ni se sustituirá por un logo inventado. No es necesario pedirlo para construir el layout. Las imágenes y textos de mapas siguen siendo contenido editable.

## Qué hay que guardar

El acceso requiere usuario y un hash de contraseña en configuración privada del servidor; la contraseña no se guarda como texto ni se incluye en el frontend.

También deben conservarse las imágenes cargadas y las decisiones editoriales: capas y su orden, marcadores y posiciones, textos ES/PT/EN, iconos, medios y publicación. De otro modo, al recargar o reiniciar se perdería el trabajo del administrador. Esto **no exige SQL**.

Se propone persistencia en archivos: JSON por mapa y archivos de imagen separados. No habrá SQLite ni tablas de usuarios. Un único administrador y una única instancia del servidor cubren el alcance inicial. La sesión puede residir en memoria y caducar al reiniciar; sólo las credenciales verificadoras necesitan persistencia.

Estructura acordada en la aclaración posterior: `maps-data` para JSON y `maps-multimedia` para archivos, agrupados por nombre de mapa. Son carpetas dentro del directorio de datos configurable de la instalación, no rutas fijadas a la raíz de una unidad Windows.

```text
maps-data/
  nombre-del-mapa/
    draft.json                configuración editable versionada
    published.json            copia validada para visitantes, si existe
maps-multimedia/
  nombre-del-mapa/
    layers/                   imágenes alineadas
    markers/                  imágenes de fichas
    icons/                    iconos personalizados
    thumbnails/               miniaturas generadas
config-private/
  admin.json                  usuario + hash y parámetros de contraseña
```

El nombre de carpeta se deriva del título al crear el mapa: nombre legible normalizado, sin separadores ni caracteres incompatibles con Windows/Linux. Se resuelven colisiones, incluidos nombres que difieren sólo por mayúsculas, con un sufijo generado. Se conserva un ID opaco independiente del nombre. El nombre de carpeta queda estable aunque cambie el título editorial, evitando mover archivos y romper referencias. Los archivos multimedia usan nombres opacos y conservan el nombre original como metadato.

Los JSON guardan rutas **relativas a maps-multimedia**, con `/` como separador portable. Fragmento ilustrativo de un asset, no esquema completo:

```json
{
  "path": "nombre-del-mapa/layers/archivo-id.png"
}
```

No se persisten rutas de máquina como `C:\\Users\\...`, dominios, puertos ni rutas internas de Docker. El servidor resuelve la ruta bajo la carpeta multimedia configurada y genera la URL de acceso. Valida que no haya escapes de directorio, rutas absolutas ni enlaces que conduzcan fuera del almacenamiento permitido. Las carpetas no se exponen completas como directorios públicos: el acceso a cada archivo respeta borrador/publicación.

Para trasladar contenido se copian juntas `maps-data` y `maps-multimedia`, preservando nombres y estructura, con la aplicación detenida o mediante un respaldo que pause escrituras. La nueva instancia descubre los JSON al arrancar y valida versión de esquema y archivos referenciados; no depende de un índice externo ni de una base SQL. Una versión incompatible o un archivo faltante se informa sin sobrescribir el contenido. Las credenciales son propias de la instalación: se configuran aparte o se migran deliberadamente con `config-private`.

La prueba de portabilidad usará otra carpeta raíz y otra instancia detenida/iniciada sucesivamente, incluyendo lectura dentro de Linux/Docker en la fase de empaquetado. No se permite que dos procesos escriban simultáneamente en las mismas carpetas; copiar datos para otra instancia es distinto de compartir almacenamiento activo.

Los archivos JSON contienen referencias, no imágenes base64. Guardar modifica únicamente el mapa correspondiente; el servidor valida operaciones sobre capas/marcadores, comprueba la revisión y serializa escrituras para evitar pérdidas entre pestañas. La sustitución mediante archivo temporal en el mismo volumen debe probarse en Windows, incluidos errores y recuperación. Publicar sustituye una copia coherente sólo después de comprobar los archivos referenciados. Una modificación del borrador no cambia la versión visible.

Este diseño sacrifica transacciones SQL y exige cuidados concretos al escribir archivos; es razonable para una instancia pequeña. No se plantea como almacenamiento para múltiples servidores simultáneos. Inicialmente se conserva cualquier archivo referenciado por borrador o publicación, y no se implementa eliminación automática agresiva.

## Empaquetado futuro con Docker

Se prevé desde ahora una aplicación independiente de sus datos. Las rutas `MAPS_DATA_DIR`, `MAPS_MULTIMEDIA_DIR` y `PRIVATE_CONFIG_DIR` se resuelven mediante configuración de servidor y tienen valores locales por defecto. En este repositorio colaborativo se versionan `maps-data` y `maps-multimedia`; las credenciales y temporales siguen excluidos de Git, y los datos se mantienen fuera del contexto de construcción de la imagen.

En la fase de entrega se agregará Docker Compose con una imagen de aplicación y las carpetas externas montadas en ubicaciones estables del contenedor. Se proponen bind mounts para mantener los JSON y multimedia directamente accesibles al responsable de la instalación. Así, reemplazar el contenedor no sustituye los mapas. El directorio de configuración privada también persiste fuera de la imagen. [Documentación oficial de bind mounts](https://docs.docker.com/engine/storage/bind-mounts/).

La construcción en varias etapas permitirá entregar sólo el frontend compilado, el servidor compilado/empaquetado y las dependencias de ejecución, sin repositorio, fuentes TypeScript, herramientas de desarrollo ni source maps en la imagen final. Los componentes nativos, si se usan, se construirán para el sistema destino. Esto no obliga a usar Docker durante el desarrollo local. [Documentación oficial de multi-stage builds](https://docs.docker.com/build/building/multi-stage/).

**Docker no garantiza ocultamiento del código.** Evita entregar el proyecto fuente como carpeta de trabajo, pero alguien con control del equipo puede inspeccionar los archivos del contenedor; el propio Docker permite exportar su filesystem. El JavaScript que ejecuta el navegador también es accesible. Compilar/minificar y omitir source maps dificulta la lectura, sin impedir la extracción o ingeniería inversa. No se ofrecerá confidencialidad del código como propiedad del empaquetado. [Exportación de contenedores](https://docs.docker.com/reference/cli/docker/container/export/).

Criterios de entrega futura: arrancar con carpetas existentes, crear contenido, reiniciar/recrear contenedor sin perderlo, trasladar ambas carpetas a otra instalación compatible y comprobar referencias; verificar que la imagen no contiene credenciales, mapas operativos ni fuentes/source maps que no deban distribuirse. Docker se implementará en la fase de entrega, no en esta revisión documental.

## Una aplicación y un servidor pequeño

Se mantiene Vite + React + TypeScript estricto para el frontend y Node.js para un servidor local pequeño. Una raíz de proyecto, sin monorepo/workspaces ni paquetes internos publicados. Un solo `npm run dev` inicia ambos.

Las «APIs» anteriores eran rutas del mismo servidor, no servicios externos. Se reduce la superficie a unas pocas responsabilidades: sesión del administrador, lectura pública, guardar cambios de mapas, carga de archivos y publicación/archivo. Las operaciones de capas, marcadores y orden se pueden expresar como comandos tipados en una ruta de cambios del mapa; cada operación sigue validándose y no sobrescribe el catálogo completo.

Separar estas responsabilidades en archivos pequeños evita mezclar controles visuales y escritura en disco. No implica desplegar varios sistemas. Las lecturas públicas sólo entregan mapas publicados y sus recursos; el backend verifica la sesión para editar, cargar y publicar. Ocultar el modo edición no sustituye esa comprobación.

```text
src/
  app/                        navegación y sesión
  components/                 controles compartidos
  features/                   catálogo, visor, editor, capas, marcadores
  canvas/                     coordenadas y transformaciones
  api/                        comunicación con el servidor
  i18n/
  styles/
server/
  auth/
  maps/                       validación, guardado y publicación
  files/                      carga y acceso a imágenes
shared/                       contratos y validadores
tests/
docs/
```

## Secuencia revisada

1. **Frontend y capas:** reproducir portada, visor, selector de capas e inspectores de referencia con datos neutros. Probar imágenes alineadas al alternarlas, zoom/paneo compartidos, mouse/touch/teclado y ES/PT/EN. Esta etapa usa fixtures explícitos y todavía no se presenta como editor persistente.
2. **Guardado y edición real:** servidor pequeño, administrador, archivos JSON, uploads, marcadores con apertura inmediata del editor, biblioteca de iconos y guardado comprobado. Probar persistencia tras reinicio, cancelación, cargas inválidas y acceso denegado.
3. **Publicación y entrega:** copia publicada, vista anónima, archivo/restauración, respaldo de configuración e imágenes y ejecución reproducible. Probar que cambios privados no aparecen antes de publicar.

La configuración de scripts, tipos, pruebas y documentación se incorpora desde la primera fase; lint, test y build deben ejecutarse al cerrar cada fase con código. No hay instalación ni scaffold en esta revisión documental. La autorización genérica del análisis y sus correcciones no se interpreta como permiso para completar automáticamente todas las fases.
