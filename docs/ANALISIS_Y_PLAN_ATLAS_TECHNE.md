# Atlas Technē — análisis y plan propuesto

Fecha: 5 de septiembre de 2026. Estado: **análisis inicial, con arquitectura revisada**.

> La [propuesta simplificada](PROPUESTA_SIMPLIFICADA.md) registra la corrección posterior del usuario y reemplaza las propuestas de este documento sobre SQLite, organización en workspaces, división de API, capas y fidelidad visual. El inventario de referencias y los flujos relevados siguen siendo útiles. No se inició implementación.

Este documento complementa y enlaza la [especificación funcional y técnica](ESPECIFICACION_ARMADOR_DE_MAPAS.md); no la sustituye. Prioridad aplicada: especificación → capturas para estética → pedido adjunto para ejecución. Las decisiones propuestas aquí aún no son ADR aceptados.

## 1. Comprensión y alcance actual

Atlas Technē es un armador genérico: una persona editora carga una imagen, coloca marcadores y superposiciones, completa contenido trilingüe y publica una experiencia de consulta. Un único modelo, un único editor y un único visor deben servir para cualquier contenido. La imagen establece un espacio visual normalizado, sin GIS ni coordenadas geográficas.

El visitante consume exclusivamente una revisión publicada; el editor modifica un borrador autenticado. Guardar y publicar son operaciones distintas. La identidad visible será «Atlas Technē» / «ATLAS TECHNĒ — Armador de Mapas Interactivos»; nombres técnicos: `atlas-techne`.

Esta entrega sólo comprende descubrimiento, diseño y planificación. No se instalaron dependencias, no se creó scaffold, no se modificaron referencias y no se hicieron commits.

## 2. Inventario y estado del repositorio

Se enumeró recursivamente todo `docs/`: hay un Markdown y doce PNG, todos inspeccionados. El Markdown se leyó completo, incluidos modelo orientativo, diagnóstico histórico, fases y decisiones abiertas. El pedido adjunto también se leyó completo.

| Recurso | Inspección y resultado |
|---|---|
| `docs/ESPECIFICACION_ARMADOR_DE_MAPAS.md` | Fuente normativa, 23 secciones; comportamiento, arquitectura, seguridad, accesibilidad y reconstrucción |
| `docs/capturas_referencia/` | 12 imágenes; inventario individual debajo |
| `.dist/` | Directorio vacío al enumerarlo, incluidos archivos ocultos; sin material recuperable |
| `.git/` | Rama `main` sin commits; `git ls-files` vacío; estado inicial `?? docs/` |
| Raíz | No hay código, `package.json`, README, lockfile ni configuración de pruebas; no se encontraron instrucciones `AGENTS.md` en raíz o directorio padre inmediato |

Git rechazó inicialmente la lectura por diferente propietario. Se utilizó `git -c safe.directory=C:/Users/Usuario/Documents/UNRN/atlas-techne …` sólo para las consultas, sin cambiar configuración global. Los documentos existentes son archivos del usuario aún no versionados: no deben confundirse con cambios generados por esta entrega.

El diagnóstico de la sección 19 describe otro estado histórico: sus `src/`, servidor, JSON y entregables no están en este checkout. No hay datos operativos que respaldar o importar aquí. No se inventará un importador de un formato cuyo archivo real no está disponible.

## 3. Inventario individual de capturas

Las dimensiones siguientes son píxeles del archivo, **no una medición del viewport CSS**. DPR, zoom del navegador, navegador y recortes no se pueden determinar con certeza a partir de los PNG. La mayoría mide 1920 × 1082; la portada pública mide 1918 × 1082. No se recibieron fuentes, logotipos originales ni licencias.

Perfiles visuales compartidos, referenciados por cada fila:

- **C (catálogo):** fondo fotográfico desenfocado y oscurecido, panel azul central de aproximadamente 1080 px, título blanco grande, tarjetas con título dorado y descripción clara. Sans serif de apariencia geométrica; título ~48 px y tarjetas ~30 px, estimados. Retícula de tres columnas con separación ~24 px, tarjetas con padding ~24 px, panel con aire ~60–72 px. Bordes claros de 1 px, radios ~14 px, sombra amplia y superficie azul parcialmente translúcida. Idioma abajo a la izquierda y acceso privado arriba a la derecha. Los fondos y logotipo temático son contenido accidental, no assets del nuevo producto.
- **V (visor):** lienzo dominante; metadatos en panel azul translúcido inferior izquierdo, idioma encima, panel/botón de capas inferior derecho. Títulos dorados ~36 px, cuerpo ~18–20 px; márgenes exteriores ~36 px y padding ~24–36 px. Bordes finos claros, radios ~14 px, sombras suaves. Marcadores con etiquetas oscuras pequeñas. Las áreas cartográficas claras/celestes pertenecen a la imagen, no a los tokens de UI.
- **E (editor):** comparte V; panel inferior derecho azul, pestañas con subrayado dorado, grupos internos carbón, botones cuadrados de iconos ~48 px, entradas oscuras. Espaciado interno ~8–12 px, contenedores ~24 px; bordes grises, radios menores en controles y ~14 px en panel. Amarillo/dorado para selección y guardar, cian para subir. Transparencia en panel exterior y sombra; scroll interno visible. La interfaz heredada mezcla EN y ES.
- **M (modal):** overlay oscuro por encima de V o C y tarjeta azul centrada, ~600 px para fichas y ~420 px para login. Radio ~14 px, borde tenue y sombra intensa. Foto arriba y texto debajo en ficha; campos oscuros en editor. Padding ~30 px, título ~30 px y cuerpo ~20 px en ficha. El scroll es interno; el botón de cierre está en el extremo superior derecho. Opacidad, blur y fuente exactos no son recuperables de manera fiable.

| Archivo en `capturas_referencia/` | Dimensiones | Perfil e idioma observado | Pantalla, paneles, herramienta e inspector | Registro visual e interpretación / ambigüedad |
|---|---|---|---|---|
| `landing-page.png` | 1918×1082 | Visitante, ES; una descripción accidental en inglés | Catálogo, cuatro tarjetas, sin modal, sin herramienta | C: tres tarjetas arriba y una centrada abajo. Selector ES. No inferir número fijo de mapas, fotografía o patrocinador obligatorio |
| `developer-login.png` | 1920×1082 | Acceso editorial; ES con etiquetas User/Password | Catálogo atenuado; modal de credenciales, primer campo con borde amarillo | C+M: modal ~420×360, acción amarilla de ancho completo. La captura no demuestra autenticación real ni credenciales válidas |
| `mapa-ejemplo01.png` | 1920×1082 | Visitante, ES | Visor, imagen vertical centrada con bandas laterales; capas cerradas; marcador estrella, ficha cerrada | V: evidencia clave para contain/letterboxing. Panel izquierdo más ancho. No inferir enlaces a mapas especiales desde la estrella |
| `mapa-ejemplo02.png` | 1920×1082 | Visitante, ES | Visor con numerosos marcadores, leyenda, capas cerradas y ayuda táctil inferior | V: lienzo ocupa casi todo; puntos verdes/amarillos/rojos con borde blanco y etiquetas solapadas. La leyenda es editorial; corregir solapamientos y accesibilidad, no adoptar categorías temáticas |
| `mapa-ejemplo02-interacciones.png` | 1920×1082 | Visitante, ES | Panel derecho abierto en Elementos Interactivos; varios checkboxes activos; sin ficha | V: panel ~780 px, pestaña subrayada, separadores finos, cierre arriba. Sugiere activación múltiple; no prueba si cada opción agrupa imágenes o marcadores |
| `mapa-ejemplo02-tarjeta-de-elemento-interactuable.png` | 1920×1082 | Visitante, ES | Ficha abierta con foto y texto largo, scroll; panel Base abierto detrás e inactivo | V+M: modal ~600×730, imagen ~300 px de alto. Texto incluye coordenadas como contenido; no implica GIS. No se ven todas las acciones de galería |
| `mapa-ejemplo02-tarjeta-de-elemento-interactuable-en-ingles.png` | 1920×1082 | Visitante, EN; nombre propio conserva Base | Otra ficha abierta, foto y texto inglés; panel Base abierto detrás | V+M: modal ~600×660, misma jerarquía; evidencia de traducción pública. Es otro marcador: no demuestra por sí sola conservación de ficha al cambiar idioma |
| `modo-dev-edicion-landing-page.png` | 1920×1082 | Editor; selector EN, acciones de alta ES | Catálogo editable, iconos rojos para borrar y tarjeta Agregar Mapa; sin modal | C: panel central más alto (~688 px), segunda fila con dos tarjetas; alta con borde discontinuo. Engranaje amarillo. No trasladar la mezcla idiomática al visitante |
| `modo-dev-modo-edicion-menu.png` | 1920×1082 | Editor; EN público / ES herramientas | Estudio con panel Modo Edición abierto, iconos de sistema y biblioteca; cambio de base, alta de capa, guardar | E: panel ~718×432, grupos carbón y scrollbar. No hay icono de colocación inequívocamente activo; pestaña enfocada. Panel heredado tapa parte del lienzo |
| `modo-dev-modo-edicion-menu-editar-marcador-antes-de-colocarlo.png` | 1920×1082 | Editor; EN/ES | Modo Edición, pin seleccionado, paleta visible y mensaje para hacer clic; sin modal | E: icono sobre dorado y color con borde claro; mensaje amarillo. Es **colocación armada**, no edición de un marcador persistido. Doble scroll visible a evitar |
| `modo-dev-edicion-de-marcador-colocado.png` | 1920×1082 | Editor; EN/ES | Marcador recién colocado y modal de edición abierto; título, descripción, iconos; panel de herramientas detrás | E+M: modal ~600×434 con scroll; campos carbón, foco visible en textarea, sección de apariencia. Etiqueta provisional detrás no demuestra guardado. Cierre adicional arriba del lienzo es ambiguo y no se replica |
| `modo-dev-edicion-de-marcador-colocado-02.png` | 1920×1082 | Editor; EN/ES | Mismo editor desplazado hacia abajo; color verde, visibilidad por bases, multimedia 0/3, URL, subir imagen y guardar | E+M: botones cian y dorado, separadores y checkboxes. Límite 3 y múltiples bases son heredados, no requisitos. No se observa Cancelar: hay que incorporarlo explícitamente |

No hay referencias PT, móvil/tablet, error, carga, conflicto, progreso de subida, publicación, transformación de capas ni confirmaciones destructivas. El aspecto de esos estados se derivará del sistema compartido, no de supuestas capturas inexistentes. La barra fina roja/gris en el borde superior no tiene función identificada y no se incorpora.

## 4. Pantallas y estados necesarios

| Superficie / ruta propuesta | Estados y acciones |
|---|---|
| Catálogo `/` | Cargando, vacío, tarjetas publicadas, error con reintento, selector ES/PT/EN |
| Visor `/maps/:slug` | Base cargando/visible/fallida, mapa no disponible, vista ajustada/zoom/paneo, capas abiertas/cerradas, ficha abierta/cerrada, galería imagen/video/error; fullscreen cuando disponible |
| Acceso `/editor/login` | Credenciales, enviando, error seguro, límite de intentos, sesión expirada |
| Proyectos `/editor/projects` | Lista, borrador/publicado/con cambios/archivado, crear, archivo/restauración, vacío/error |
| Alta de mapa | Metadatos, base, validación, progreso, cancelación y reintento |
| Estudio `/editor/projects/:id` | Selección, paneo, colocación armada, marcador provisional, edición, movimiento, inspección de proyecto/base/capa, biblioteca, medios, traducciones |
| Previsualización privada | Mismo visor con DTO de borrador autenticado; ES/PT/EN y dimensiones objetivo |
| Publicación | Validando, errores por campo/idioma/referencia, confirmación, publicando, éxito/error/conflicto |
| Diálogos compartidos | Reemplazo de base, cancelar cambios, archivar/restaurar, borrar/reemplazar recurso en uso, reautenticación, recuperación local |

Toda consulta contempla inicial, carga, vacío, datos, error recuperable, acceso denegado y recurso inexistente. Toda escritura distingue sin cambios, cambios pendientes, guardando, guardado confirmado, error y conflicto de versión. Nunca se anuncia guardado antes de respuesta válida.

En escritorio: lienzo prioritario e inspector lateral. En tablet horizontal/kiosco: objetivos amplios y paneles desplazables. En ancho reducido: drawer u hoja inferior con scroll interno, sin miniaturizar el lienzo. Marcadores accesibles también por lista para evitar que superposiciones visuales los vuelvan inalcanzables.

## 5. Creación y edición de marcadores

1. Abrir herramientas autenticadas y elegir Marcador.
2. Elegir icono de sistema y color, o icono personalizado existente. La selección se comunica por borde, estado accesible y texto.
3. Entrar en `placing`: cursor de colocación, vista previa y mensaje «Colocar marcador». Escape desarma la herramienta.
4. Aceptar un clic/toque sólo sobre el rectángulo real de la base; excluir controles, paneles, letterboxing y gestos con desplazamiento/pinza. Determinar gesto antes de crear, al terminar el puntero.
5. Invertir la transformación de vista y convertir a coordenadas 0..1. Rechazar puntos externos antes de aplicar clamp; clamp sólo corrige pequeños errores numéricos.
6. Crear un marcador **provisional local**, seleccionarlo y abrir inmediatamente su inspector/modal. Llevar foco al título. No enviar todavía `POST` ni dejar un marcador genérico persistido.
7. Editar ES/PT/EN, descripción segura, alternativa textual, apariencia, visibilidad, posición y medios. Mantener claramente separados formulario y recurso remoto.
8. Guardar valida el borrador y envía una creación granular con revisión esperada y clave de idempotencia para evitar duplicados al reintentar una respuesta perdida. El servidor genera el ID estable.
9. Éxito: integrar el recurso devuelto, mostrar guardado y volver a selección. Fallo: conservar formulario y posición, informar y permitir reintentar. Conflicto: conservar copia local, mostrar revisión remota y pedir resolución sin sobrescritura silenciosa.
10. Cancelar elimina el provisional y vuelve a selección; si hay contenido modificado, confirmar descarte. X/Escape siguen la misma política, con restauración de foco.

Alternativa completa por teclado: elegir icono, activar «Colocar por coordenadas», usar posición inicial centrada y ajustar X/Y o flechas antes de confirmar; nunca exigir un clic físico. En un marcador existente, seleccionar desde lienzo o lista y abrir el mismo inspector. Arrastre muestra posición temporal y persiste una vez al soltar; Escape revierte. Flechas desplazan, modificador amplía paso, campos numéricos ofrecen alternativa. La interfaz indica esta excepción al guardado explícito de formularios: «Posición guardada al finalizar movimiento». Eliminar requiere confirmación o deshacer fiable. Deshacer un cambio persistido es una nueva mutación con revisión, no una alteración invisible de la copia local.

## 6. Iconos personalizados

1. Abrir la biblioteca desde la herramienta o el inspector. Mostrar formatos y límites.
2. Validar temprano archivo y dimensiones; cargar con progreso, cancelación y reintento. Backend verifica autorización, extensión, firma/MIME, decodificación, peso y píxeles.
3. Almacenamiento temporal y procesamiento; incorporar asset válido y entrada de biblioteca en operación coordinada. Un fallo no deja entrada utilizable rota.
4. Tras respuesta confirmada, mostrar miniatura y nombre accesible, **seleccionar automáticamente** ese icono y mantener abierta la configuración. En la herramienta de alta, dejar estado `placing`; en un inspector ya abierto, aplicar la apariencia al marcador que se edita sin crear otro.
5. Al colocarlo, abrir inmediatamente el mismo editor de marcador del flujo anterior. Un custom conserva sus colores propios; no se muestra un selector de tinte sin soporte genérico definido.
6. Un fallo conserva selección anterior válida; muestra causa segura y reintento. Nunca seleccionar un ID inexistente.
7. Gestión visible mediante botón/menú, además de cualquier atajo. Antes de eliminar, consultar referencias y cantidad de marcadores; ofrecer reemplazo en borrador. Revisiones publicadas mantienen sus assets. Si sigue referenciado, impedir borrado físico aunque se retire de la biblioteca.

Propuesta: biblioteca por proyecto en V1; cambiar a biblioteca de instalación afecta permisos y referencias, por lo que requiere confirmación.

## 7. Arquitectura propuesta

Monorepo con npm workspaces, frontend Vite + React + TypeScript estricto y API HTTP separada. Mismo origen en producción; proxy de Vite a API en desarrollo. Un servicio local, sin servicios externos obligatorios. No se utilizarán librerías GIS.

```text
Shell pública / Shell editorial
       ↓
Features de presentación → clientes API → contratos validados
       ↓                                    ↓
Visor compartido + canvas-core           API HTTP
                                            ↓
                                   casos de uso / dominio
                                            ↓
                              repositorios + AssetStore + sesiones
                                            ↓
                                      SQLite + disco
```

El visor recibe un modelo de lectura, no decide permisos. La previsualización y la vista publicada reutilizan componentes y matemática con proveedores de datos diferentes. Los DTO públicos excluyen usuarios, nombres originales de archivos, borradores, auditoría, recursos ocultos y configuración interna. Ninguna ruta elige componentes por nombre o ID de mapa.

Separación de estado: sesión/idioma globales mínimos; consultas remotas por feature; formularios recuperables; viewport/selección/herramienta efímeros. Clientes API centralizan errores, cancelación y revisión; no habrá fetch disperso en componentes. React no rerenderiza todo el árbol por cada píxel: el viewport actualiza la transformación del contenedor durante el gesto y consolida estado al finalizar.

API basada en las rutas de la especificación; añadir operaciones explícitas `archive`, `restore`, `unpublish`, administración de elementos/medios/iconos y reordenación atómica. Evitar un DELETE ambiguo entre archivo y destrucción. Cada mutación de proyecto valida `expectedRevision`, incrementa revisión en transacción y devuelve 409 ante conflicto; reordenar afecta sólo la colección indicada. Autorización también en lecturas privadas y descarga de assets, no sólo en escrituras.

## 8. Backend concreto propuesto y dependencias

| Elección | Motivo y límite |
|---|---|
| Node.js 24 LTS + TypeScript estricto | Una plataforma para desarrollo local y servidor; línea LTS, evitando adoptar Current para producción. [Ciclo oficial](https://nodejs.org/en/about/previous-releases) |
| Fastify 5 | Encapsulación de módulos, HTTP, validación/serialización y logging; soporte documentado. [Política LTS](https://fastify.dev/docs/latest/Reference/LTS/) |
| SQLite con `better-sqlite3` | Transacciones, consultas preparadas y despliegue sin servicio de BD; adaptador aislado, SQL explícito y migraciones numeradas. Adecuado para instalación pequeña, no alta concurrencia de escritura. [Proyecto oficial](https://github.com/WiseLibs/better-sqlite3) |
| Disco privado + `sharp` | Originales y derivados fuera de public; decodificación, dimensiones y miniaturas. Limitar procesamiento simultáneo. [Documentación oficial](https://sharp.pixelplumbing.com/) |
| Sesiones opacas en SQLite | Revocación/logout/expiración en servidor; cookie HttpOnly, SameSite y Secure en HTTPS. Hash de token almacenado; nunca JWT persistido en localStorage |
| `node:crypto` scrypt + sal aleatoria | Hash de contraseña con parámetros revisados y versionados; evita una dependencia nativa adicional. Comparación segura, coste acotado y creación del primer editor mediante comando interactivo privado |
| JSON Schema + Ajv / tipos derivados | Un esquema por contrato; validación de entradas y salidas. Tipos derivados, sin duplicar manualmente definiciones. Dominio y formularios no se confunden con DTO |

Se comprobaron las fuentes primarias de Node, Fastify, better-sqlite3 y sharp durante el análisis. La propuesta fija tecnologías y líneas principales, no pretende que ya exista un lockfile probado. Antes de instalar se verificará la combinación exacta, mantenimiento, licencia y binarios Windows de cada paquete/plugin y se fijarán versiones en lockfile. Plugins previstos sólo según responsabilidad: cookies, multipart limitado, rate limit y cabeceras de seguridad. No se añadirá ORM, framework de autenticación ni biblioteca global de estado sin necesidad demostrada.

Herramientas de frontend/pruebas previstas: Vite, React, TypeScript, ESLint, Vitest y Playwright; incorporar cada una en su fase, con justificación y verificación de versiones. Pointer Events, matrices, AbortController, Intl y diálogo nativo cubren interacción básica; la accesibilidad de dialog se probará, no se presumirá.

Seguridad propuesta: verificar Origin y token CSRF vinculado a sesión en mutaciones; CORS cerrado por defecto; HTTPS en red/producción. HTTP sólo en loopback de desarrollo explícito. Límites de intentos y cargas, expiración absoluta/inactiva de sesión, rotación al autenticar. CSP con scripts propios y frame-src restringido al proveedor de video; ningún HTML editorial confiable. No obtener URLs arbitrarias desde servidor. Logs estructurados con requestId, códigos estables, latencia y redacción de secretos. `/api/health` sin información sensible.

## 9. Modelo preliminar y persistencia

Se conserva el agregado de la especificación; el JSON de lectura no obliga a almacenar todo en una fila mutable. `Locale` será la unión cerrada `es | pt | en`, sin el `| string` orientativo. `LocalizedText` exige las tres claves; borradores permiten valores vacíos según campo.

| Entidad | Campos/relaciones principales |
|---|---|
| MapProject | UUID, slug único, schemaVersion, estado, revisión del borrador, publishedRevisionId nullable, fechas |
| MapDraft | Metadatos localizados, baseAssetId exactamente uno, baseAlt, thumbnailAssetId, viewport, capas y marcadores como agregado |
| MapLayer | UUID, projectId, nombre localizado, visibleByDefault, publishVisible, orden, exclusiveGroup opcional |
| LayerImage | UUID, layerId, assetId, alt localizado o decorativo explícito, orden, transform |
| Marker | UUID, projectId, posición x/y, título/descripción/alt localizados, apariencia discriminada, visible, orden |
| MediaItem | UUID, markerId, orden; imagen con assetId/alt/título/leyenda o video con provider/externalId/título/leyenda |
| CustomIcon | UUID, projectId propuesto, assetId, nombre interno; etiqueta localizada sólo si se expone al público |
| Asset / AssetVariant | UUID, storageKey privado, MIME, bytes, dimensiones, checksum, nombre original privado, estado de ingestión y derivados |
| PublishedRevision | UUID, projectId, número, schemaVersion, instantánea inmutable validada y filtrada para exhibición, fecha/autor privado |
| AssetReference | Asset, propietario y revisión; incluye base, miniaturas, capas, iconos y medios; bloquea recolección |
| User / Session / AuditEvent | Identidad y permisos; sesiones revocables; autor/acción/recurso/fecha/requestId, sin secretos |

Las traducciones pueden persistirse en tablas hijas por entidad/locale; las respuestas reconstruyen LocalizedText. FK y transacciones garantizan pertenencia al proyecto; no basta con que un ID exista en otra biblioteca. IDs UUID aleatorios generados por servidor. Índices para slug, projectId, orden y referencias. Migraciones SQL con tabla de versión y checksum, probadas desde cero y desde versión anterior.

Aclaraciones genéricas necesarias: alt de base/marcador/elementos y títulos de medios completan requisitos que el ejemplo de tipos no expresa enteramente. La leyenda debe ser dato localizado: se propone `LegendItem { id, label, appearance, order }` opcional del proyecto, sin semántica temática. Su relación con filtros de marcadores es una decisión abierta; no se implementará filtrado de grupos deducido sólo de capturas.

Transformación propuesta: origen superior izquierdo de la base; tamaño natural de superposición según dimensiones del asset relativas a dimensiones intrínsecas de base; escala uniforme, desplazamientos en fracciones de base, rotación alrededor del centro del elemento. Serializar `rotationDeg: 0` inicialmente, editor de rotación pospuesto. Matriz única: tamaño natural → escala/rotación alrededor del centro → desplazamiento en espacio base → transformación del viewport. Se probará composición e inversa. Base reemplazada conserva posiciones relativas y advierte cambios de proporción y tamaño natural de overlays.

Publicación: dentro de transacción, comprobar revisión esperada, traducciones, coordenadas, assets listos y referencias; generar snapshot inmutable, referencias de assets y actualizar puntero publicado. Borrador posterior no altera snapshot. Capas vacías se excluyen de publicación con aviso, nunca como opción vacía; marcadores no visibles y capas publishVisible=false tampoco viajan al visitante. Una revisión previa no debe quedar accesible públicamente sólo por adivinar su ID.

Archivo retira acceso público y preserva contenido. Propuesta de restauración: volver al panel como borrador y exigir publicar para reaparecer en catálogo; confirmar esta semántica. Despublicar conserva revisiones históricas privadas. Eliminación definitiva queda para rol autorizado y política de retención aprobada.

Archivos: staging → validación/decodificación → nombre opaco y derivados → transacción de metadatos/referencias → recurso disponible. BD y filesystem no comparten transacción: registrar estados y compensación, reconciliar staging tras fallos y no exponer archivos antes de completar. Recolector elimina únicamente assets sin referencias y fuera del periodo de gracia. Publicar, referenciar y reclamar para borrado deben coordinarse para evitar carreras. Descarga pública verifica referencia en publicación activa; uploads privados no son un directorio estático abierto.

Backup inicial propuesto: pausa breve de escrituras y GC, backup consistente de SQLite, copia de assets referenciados inmutables, manifiesto con checksums, verificación y restauración en ubicación aislada. No copiar a ciegas sólo el archivo principal de una BD WAL activa. Retención y destino externo requieren acuerdo.

## 10. Internacionalización

Catálogos estáticos de UI completos y tipados para ES/PT/EN; contenido editorial en entidades, nunca en claves del sistema. Errores API tienen códigos que UI traduce, con mensaje genérico seguro si el código no es conocido. No mostrar claves internas. Editor inicialmente ES con pestañas editoriales ES/PT/EN y preview en cada idioma.

Preferencia: idioma guardado válido → idioma compatible del navegador → ES; almacenamiento bloqueado se tolera con estado en memoria. No incluir locale en URL inicialmente. Cambiar idioma actualiza textos y `lang` sin recargar ni remontar visor; selección, viewport, capas y medio/ficha abiertos se identifican por IDs estables.

Política propuesta para publicar: títulos de mapa/marcador, nombres de capas publicables, etiquetas de leyenda y alternativas de imágenes informativas obligatorios en los tres idiomas. Videos exigen título accesible trilingüe. Descripciones, leyendas de medios y títulos de imagen opcionales, pero si se completan en un idioma deben completarse en los tres. Decorativos usan alt vacío explícito. No fallback editorial público en V1; los borradores incompletos muestran advertencias privadas. Nombres propios pueden repetirse sin traducirse; URLs y archivos se guardan una vez.

## 11. Estructura y operación propuestas

```text
apps/web/src/
  app/                         rutas, sesión e idioma
  features/                    auth, catalog, map-viewer, map-editor,
                               projects, layers, markers, assets, publishing
  shared/                      api, ui, i18n, styles
apps/api/src/
  domain/                      entidades, invariantes y puertos
  modules/                     auth, projects, layers, markers, assets, publishing
  infrastructure/              database, files, logging, config
apps/api/migrations/           SQL numerado
packages/contracts/            DTO públicos/privados y esquemas
packages/canvas-core/          matemática pura sin React
tests/e2e/                     flujos y accesibilidad
tests/visual/                  fixtures neutros y baselines aprobadas
scripts/                       desarrollo coordinado, bootstrap, backup/restore
docs/                          referencia intacta, análisis, ADR y operación
var/                           BD/uploads/staging locales, ignorados
.env.example
.gitignore
package.json
package-lock.json
README.md
```

README enlazará la especificación y explicará Node/npm requeridos, instalación, scripts, estructura y entorno. `npm install` instala workspaces; `npm run dev` coordina Vite y API, comprueba configuración/migraciones y termina ambos si uno falla. La cuenta inicial se configura mediante comando interactivo documentado, sin contraseña por defecto. `build` comprueba tipos y compila ambos; `lint` y `test` fallan realmente ante errores; `preview` sirve build más API local; `test:e2e` declara instalación de navegadores de prueba y arranque. No requerir herramientas globales aparte de Node/npm.

`.env.example`: NODE_ENV, HOST (loopback local), PORT, APP_ORIGIN, DATA_DIR y límites validados; los valores locales deben permitir arrancar sin servicios externos. Producción exige origen y transporte seguros; pruebas usan directorios temporales aislados. Ninguna variable privada usa prefijo VITE_. Secretos futuros sólo en servidor. `.gitignore` cubrirá node_modules, dist/.dist, var, env privados, logs, cachés, resultados y paquetes; conservará docs y .env.example.

## 12. Sistema visual propuesto

Valores de partida **estimados**, no muestreo exacto ni contraste ya certificado. La fuente original no puede identificarse/licenciarse con estos archivos: comenzar con `system-ui, "Segoe UI", sans-serif`, sin descargas; una fuente distribuida requerirá licencia comprobada.

| Familia | Tokens iniciales |
|---|---|
| Fondo | background #0e2340; canvas #102540; fondo de catálogo gradiente propio oscuro sin foto temática |
| Superficies | surface #193958; surface-raised #244665; surface-translucent rgba(25,57,88,.94); input #202020 |
| Texto | text #f5f7fa; text-muted #cbd5e1; text-on-accent #141414 |
| Acción | accent #e6b65e; accent-strong #ffe43b; info #43c6ed |
| Estado | success #49d18b; warning #f3c969; danger #ff7485; acompañados por texto/icono |
| Bordes y foco | border rgba(203,213,225,.30); interactive-border #8ca3ba; focus #ffe43b con outline 3 px y separación 3 px |
| Radios | control 8 px; card/panel 14 px; pill 999 px |
| Sombras y blur | panel 0 12px 32px rgba(0,0,0,.28); modal 0 24px 64px rgba(0,0,0,.45); blur 12 px con fallback opaco |
| Espaciado | 4, 8, 12, 16, 24, 32, 48, 64 px |
| Tipografía | 14/16/18/20/24/32/48 px; cuerpo 1.5 de interlineado; títulos 1.15; pesos 400/600/700 |
| Controles e iconos | objetivo mínimo 44×44 px, habitual 48 px; iconos 20/24/32 px; pictograma de marcador independiente de hit area |
| Elevación | canvas 0; marcadores 10; controles 20; paneles 30; overlay 40; modal 50; notificación 60; dialog nativo usa top layer y exige coordinación |

No trasladar estilos temáticos, recortes cartográficos, logos ni nombres. El color personalizado de marcador no será el único indicador y tendrá contorno/fondo de etiqueta de contraste independiente. Verificar AA sobre imágenes claras y oscuras: transparencia puede degradar contraste; permitir superficies opacas. Mejorar objetivos pequeños, cierres sobre fotos y scroll múltiple aunque difiera del legado.

Comparación visual en dos niveles: revisión de composición/tokens contra cada captura original; regresión píxel a píxel contra baselines nuevas aprobadas con contenido neutro. No es válido exigir igualdad total con mapas/logos distintos ni usar máscaras que oculten controles. Cubrir 1918×1082 y 1920×1082 como tamaños de prueba provisionales a DPR 1, más 1366×768, 1024×768 y 768×1024; confirmar dispositivos reales.

## 13–14. Fases verificables y aceptación

Cada fase de implementación exige aprobación independiente. Se conserva la secuencia conceptual de la especificación; se añade la base de tooling a F1 y se marca migración como condicional a recibir datos. No se adelanta implementación por aprobar sólo este análisis.

| Fase | Entrega | Aceptación para cerrar |
|---|---|---|
| Descubrimiento — actual | Este análisis, inventario y decisiones propuestas | 13 archivos originales inspeccionados, 12 capturas individualizadas; ninguna referencia alterada; aprobación del usuario pendiente |
| F0 — preservación | Manifiesto/checksums de referencias; si llegan datos reales, backup verificado | Fuente separada de artefactos; inventario reconciliado. No declarar respaldo operativo si no hay datos. Sin borrado ni commits automáticos |
| F1 — base, contratos y canvas | Workspaces, scripts, README/env/ignore, esquemas, matemática, visor neutro y tokens, UI pública ES/PT/EN | Instalación limpia y dev coordinado; lint/test/build pasan; unitarias de letterboxing, límites, inversas, orden y locale; mouse/touch/teclado y cambio de idioma conservan estado; visor sólo con fixtures de desarrollo explícitos |
| F2 — backend seguro | SQLite/migraciones, sesión, permisos, API granular, assets y recuperación de staging, backup | Integración deniega lecturas privadas/escrituras/archivos a anónimo; CSRF y límites; upload inválido sin entrada rota; 409 conserva datos; referencias impiden borrado; restauración aislada comprobada |
| F3 — editor esencial | Alta/metadatos/reemplazo de base, marcadores, guardado y recuperación, deshacer/rehacer | E2E crear base y marcador, apertura inmediata, cancelar provisional, guardar/recargar/mover tras zoom; no colocar sobre controles/bandas/paneo; pérdida de red/sesión conserva formulario; teclado y táctil completos |
| F4 — capas y multimedia | Capas/elementos/orden/transformación, iconos propios, galería tipada, traducciones editoriales | E2E upload selecciona icono automáticamente y abre editor al colocar; capas múltiples y exclusivas; orden atómico; URLs externas rechazadas correctamente; eliminación no rompe referencias; medios y capas inactivas no descargan innecesariamente |
| F5 — publicación | Validación trilingüe, snapshot, catálogo real, vista anónima, archivo/restauración/despublicación; importación sólo si hay fuente | Publicación atómica y 409; borrador posterior invisible a público; assets privados inaccesibles; flujo anónimo ES/PT/EN mantiene viewport/ficha; archivo retira publicación; regresión visual aprobada. Si hay importador: idempotencia y conversión 0..100 una vez |
| F6 — entrega reproducible | CI, artefacto/version/checksum, operación, actualización y respaldo documentados | Clon limpio instala y ejecuta todos los scripts en plataforma acordada; restore probado; controles de accesibilidad y rendimiento medidos; paquete sin secretos/uploads reales; registro de limitaciones |

En cada fase con código se ejecutarán realmente `npm run lint`, `npm run test`, `npm run build` y pruebas e2e/visuales aplicables. CI no sustituye pruebas manuales de foco, tactilidad y legibilidad. Pruebas de publicación y permisos usarán datos aislados y casos negativos. Objetivos de rendimiento se fijarán contra hardware acordado; medir latencia/frames antes de optimizar.

## 15. Riesgos, supuestos y ambigüedades

- Varias bases/visibilidad por base aparecen en captura, pero se requiere una única base activa. Prevalece la especificación: no se modelan variantes de base en V1. Sólo una futura extensión genérica podría incorporarlas.
- Los checkboxes de grupos y leyendas sugieren categorías de marcadores que no aparecen en el modelo de capas de imágenes. Propuesta mínima: leyenda editorial; filtros de grupos pendientes de decisión, nunca categorías hardcodeadas.
- Deshacer/rehacer, guardado explícito y persistencia al soltar requieren distinguir comandos de movimiento de formularios; documentar visiblemente cuándo se escribe.
- No hay fuente histórica que permita validar importación. No reutilizar contenido extraído de capturas como datos iniciales.
- Node + SQLite es propuesta para carga local pequeña. Uso en red con muchos escritores, múltiples instancias o disco de red exige revisar almacenamiento y despliegue.
- Módulos nativos de SQLite/imagen requieren comprobar instalación Windows limpia. No se verificó su ejecución en este repositorio.
- Offline: imágenes propias pueden operar localmente; videos externos no funcionan sin Internet. No prometer caché offline de terceros ni incorporar descarga de videos.
- Recuperación local puede contener contenido privado: guardar por usuario/proyecto con revisión de origen, informar que no está sincronizado y limpiar al cerrar sesión según política; no restaurar datos de otra cuenta ni publicar automáticamente.
- Tamaño de captura no identifica DPI ni viewport. No se puede afirmar identidad tipográfica ni WCAG aprobado desde un PNG.
- Referencias guardadas en publicaciones aumentan uso de disco. No borrar por antigüedad sin una política de retención aprobada.

## 16. Decisiones a confirmar

La aprobación debe indicar si acepta estas propuestas o sus cambios; no se aplican por silencio.

| Decisión | Propuesta para primera versión |
|---|---|
| Instalación y arquitectura | Instalación local de una instancia, preparada para acceso en red bajo HTTPS; Node 24/Fastify 5/SQLite/disco. Confirmar si habrá editores concurrentes y cantidad aproximada |
| Pantallas y navegador | Referencias a 1918×1082 y 1920×1082, DPR 1 provisional; Chromium en Windows como entorno primario. Confirmar kiosco/tablet y navegadores exigidos |
| Traducciones | Política estricta de sección 10, sin fallback público; opcionales vacíos en todos o completos en los tres |
| Límites | Propuesta configurable: base/overlay 25 MiB y 40 MP; icono 2 MiB y 1024×1024; imagen de ficha 10 MiB y 20 MP; 100 proyectos, 30 capas/proyecto, 20 imágenes/capa, 500 marcadores/proyecto, 12 medios/marcador; PNG/JPEG/WebP estáticos, SVG rechazado inicialmente |
| Conectividad de medios | Sólo YouTube externo inicialmente, sin reproducción offline; sin carga de archivos de video en V1 |
| Iconos y filtros | Iconos por proyecto; leyendas genéricas localizadas; filtros por grupos de marcadores pospuestos salvo confirmación de necesidad |
| Historial | Revisiones publicadas inmutables y deshacer/rehacer de sesión; sin historial completo de cada edición. Restaurar archivo vuelve a borrador, no republica |
| Respaldo y retención | Backup diario, siete diarios y cuatro semanales como punto de partida; destino separado por definir. Retener revisiones publicadas hasta retiro explícito; GC de temporales/no referenciados tras 24 h. Confirmar capacidad, pérdida tolerable y responsable |
| Próximo alcance | Aprobar análisis/arquitectura y autorizar explícitamente F0 y/o F1; ninguna fase posterior se inicia automáticamente |

Estas decisiones provienen de la sección 21 de la especificación y las secciones 20–22 del pedido. Antes de implementar se convertirán las aceptadas en ADR con estado y consecuencias.

## Verificaciones de esta entrega

Ejecutado: enumeración recursiva de docs y .dist, lectura completa de especificación/pedido, apertura individual de doce PNG, lectura de dimensiones con System.Drawing, consultas Git status/ls-files/log y revisión de fuentes oficiales del stack. Resultado: sin código inicial ni commits; docs no versionados; doce capturas legibles. El primer status falló por propietario; la consulta con excepción por comando funcionó. `git log` confirmó rama sin commits mediante su error esperado.

No ejecutados `npm run lint`, `npm run test`, `npm run build` ni e2e: no existe package.json y esta etapa prohíbe crear el scaffold/instalar dependencias. No hay aplicación, seguridad, contraste, rendimiento o restauración verificados todavía. La única escritura de esta etapa es este documento.
