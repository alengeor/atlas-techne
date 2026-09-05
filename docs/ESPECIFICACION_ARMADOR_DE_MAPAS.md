# Especificación funcional y técnica del Armador de Mapas

> Documento base para reconstruir la aplicación desde cero. Versión del relevamiento: 5 de septiembre de 2026.

## 1. Propósito

Esta aplicación es, estrictamente, un **armador y publicador de mapas interactivos basados en imágenes**. No es un sistema de información geográfica (GIS), no interpreta coordenadas geográficas y no depende de teselas ni de proveedores cartográficos. Una persona editora carga una imagen como mapa base, superpone imágenes opcionales, ubica marcadores relativos a esa imagen y publica una experiencia que otra persona puede explorar con zoom, paneo y fichas informativas.

Este documento especifica el producto que debe reconstruirse, no los contenidos cargados actualmente. Las capturas de la aplicación existente deben emplearse únicamente como referencia de composición visual, jerarquía, marca y estados de interfaz.

La reconstrucción debe conservar la intención y los flujos útiles del armador, pero no debe copiar accidentalmente las decisiones improvisadas, el contenido temático ni la estructura híbrida del repositorio actual.

## 2. Alcance

### 2.1 Incluido

- Catálogo de proyectos de mapa.
- Creación, edición, publicación y eliminación de mapas.
- Carga y reemplazo de una imagen base.
- Zoom y paneo sobre un lienzo basado en imagen.
- Creación y administración de capas visuales superpuestas.
- Posicionamiento, escala y orden de las imágenes de capa.
- Creación, movimiento, edición y eliminación de marcadores.
- Marcadores con icono, color, título, descripción y galería multimedia.
- Iconos incorporados e iconos personalizados reutilizables.
- Vista pública separada de la experiencia de edición.
- Persistencia consistente de configuraciones y archivos.
- Interfaz apta para mouse y pantalla táctil.
- Internacionalización completa para visitantes en español, portugués e inglés, tanto de la interfaz como del contenido editorial de los mapas.
- Confirmaciones, avisos, estados de carga y manejo de errores.
- Empaquetado o despliegue reproducible.

### 2.2 Fuera de alcance

- Describir o precargar los mapas concretos que existen hoy.
- Latitud, longitud, proyecciones, geocodificación o análisis GIS.
- Edición de píxeles de las imágenes.
- Navegación GPS, rutas o mapas en tiempo real.
- Gestión editorial avanzada, flujos de aprobación o colaboración simultánea en la primera versión.
- Replicar páginas especiales escritas a medida para contenidos particulares.

## 3. Conceptos y vocabulario

- **Proyecto de mapa:** unidad editable y publicable. Contiene metadatos, una imagen base, capas, marcadores y preferencias de presentación.
- **Imagen base:** imagen principal que define el sistema de coordenadas visual del mapa.
- **Lienzo:** superficie interactiva que presenta la imagen base y todos los elementos vinculados.
- **Capa:** grupo activable de una o más imágenes transparentes o complementarias superpuestas al mapa base.
- **Elemento de capa:** una imagen individual dentro de una capa, con transformación y orden propios.
- **Marcador:** punto interactivo anclado mediante coordenadas normalizadas al lienzo.
- **Ficha:** panel o modal abierto desde un marcador, con información y medios.
- **Biblioteca de iconos:** conjunto de iconos de sistema y recursos personalizados disponibles para los marcadores.
- **Borrador:** mapa editable aún no expuesto al público.
- **Publicado:** mapa disponible en la experiencia de consulta.
- **Modo edición:** interfaz autenticada con herramientas de autoría.
- **Modo vista:** interfaz de consumo que no permite mutaciones.

## 4. Principios de producto y diseño

1. **Datos antes que páginas especiales.** Todo mapa debe expresarse con el mismo modelo de dominio. Una necesidad nueva debe resolverse extendiendo el esquema o mediante módulos explícitos, no creando una página React por mapa.
2. **Una sola fuente de verdad.** Metadatos, capas, transformaciones y marcadores deben persistirse en un repositorio canónico. Las copias de entrega son artefactos, nunca fuentes editables.
3. **Separar autoría y exhibición.** El visor consume una versión publicada; el editor trabaja sobre un borrador. Activar la edición no debe depender de esconder botones mediante estado local.
4. **Coordenadas independientes de la pantalla.** Las posiciones se guardan normalizadas respecto del área real de la imagen.
5. **Guardado explícito y comprensible.** La interfaz debe indicar cambios pendientes, guardado en curso, éxito y error. No debe mezclar cambios que se persisten al instante con otros que exigen un botón sin informarlo.
6. **Operaciones atómicas.** Cada mutación actualiza un recurso concreto y evita sobrescribir cambios ajenos.
7. **Accesibilidad táctil y por teclado.** Los controles deben tener etiquetas, foco visible y objetivos táctiles de al menos 44 por 44 CSS px.
8. **Interfaz independiente del contenido.** Los textos del producto se internacionalizan; el contenido de cada mapa puede modelarse por idioma sin acoplarse a claves codificadas.
9. **El archivo es un recurso administrado.** Una carga tiene validación, identificador, metadatos, referencia y política de eliminación; no es solamente una ruta copiada en un JSON.
10. **Esquema versionado.** Los datos deben poder validarse y migrarse de manera reproducible.

## 5. Personas y permisos

### Visitante

- Ve únicamente mapas publicados.
- Abre un mapa, navega el lienzo, activa o desactiva capas y consulta fichas.
- Puede elegir español, portugués o inglés y recibe en el idioma seleccionado tanto los controles de la aplicación como el contenido del mapa.
- No ve controles de edición ni puede invocar operaciones de escritura.

### Editor

- Inicia y cierra sesión.
- Crea y modifica borradores.
- Administra imágenes, capas, marcadores e iconos.
- Carga y mantiene las versiones en español, portugués e inglés de todo texto visible para visitantes.
- Previsualiza el resultado público.
- Publica, despublica o archiva proyectos.

### Administrador (recomendado para una etapa posterior)

- Gestiona usuarios, permisos y configuraciones globales.
- Puede eliminar definitivamente recursos y revisar el uso de almacenamiento.

La autorización debe comprobarse en el servidor en cada escritura. No se deben incluir usuarios ni contraseñas en el bundle del navegador.

## 5.1 Idiomas obligatorios

La experiencia destinada al visitante debe soportar obligatoriamente estos tres idiomas:

- español (`es`);
- portugués (`pt`);
- inglés (`en`).

El cambio de idioma afecta dos clases de texto:

1. **Texto de interfaz:** navegación, botones, menús, etiquetas, ayudas, estados vacíos, carga, validaciones, confirmaciones y mensajes de error.
2. **Contenido editorial:** título y descripción del mapa, nombres de capas, títulos y descripciones de marcadores, textos alternativos, leyendas y títulos de medios.

El administrador/editor debe poder ingresar y revisar las tres variantes lingüísticas cuando crea o modifica un mapa. No alcanza con traducir la interfaz: ningún texto editorial destinado al visitante debe quedar codificado en un único idioma dentro de un componente.

Reglas de comportamiento:

- El selector de idioma debe estar disponible y ser claramente visible en el perfil o experiencia de visitante.
- La preferencia elegida debe conservarse entre pantallas y visitas, siempre que el navegador lo permita.
- En la primera visita puede utilizarse el idioma guardado, luego el idioma del navegador y, como último valor, español.
- El cambio debe aplicarse inmediatamente sin recargar la página y mantener el mapa, zoom, capas activas y ficha abierta.
- La URL puede incluir el locale si se necesita compartir o indexar una vista en un idioma específico.
- Antes de publicar, el sistema debe indicar qué traducciones obligatorias faltan. La política recomendada es impedir la publicación si faltan campos principales en alguno de los tres idiomas.
- Si se admite contenido incompleto como excepción editorial, el fallback debe ser explícito y consistente: idioma solicitado → español. Nunca se debe mostrar una clave interna de traducción.
- Los nombres propios, URLs y archivos que no requieren traducción se almacenan una sola vez.
- El contenido escrito por el editor se guarda como datos localizados del proyecto; no debe agregarse manualmente al catálogo estático de traducciones de la aplicación.
- La interfaz editorial puede comenzar en español, pero debe permitir identificar y completar sin ambigüedad las pestañas o campos `ES`, `PT` y `EN`, además de previsualizar cada idioma.

Pruebas mínimas de idioma:

- recorrer catálogo, visor, capas, ficha y estados de error en los tres idiomas;
- cambiar de idioma con una ficha abierta y comprobar que se conserva el contexto;
- verificar que no aparecen claves internas ni mezclas involuntarias de idiomas;
- validar campos faltantes antes de publicar;
- comprobar que textos largos en portugués e inglés no rompen el layout observado en las capturas.

## 6. Modelo mental de la interfaz

La aplicación tiene dos superficies principales:

```text
Catálogo
  ├─ abrir mapa publicado → Visor
  └─ entrar al área privada → Panel de proyectos
                                  ├─ crear mapa
                                  └─ editar mapa → Estudio de edición
                                                      ├─ lienzo
                                                      ├─ inspector
                                                      ├─ capas
                                                      ├─ marcadores
                                                      └─ previsualización/publicación
```

En pantallas amplias, el estudio debe priorizar el lienzo y presentar las herramientas en un panel lateral. En pantallas angostas, el inspector debe convertirse en un drawer o una hoja inferior sin reducir el lienzo a un área inutilizable.

## 7. Flujos funcionales

### 7.1 Catálogo público

1. La aplicación solicita la lista de mapas publicados.
2. Mientras espera, muestra esqueletos o un indicador de carga estable.
3. Cada tarjeta presenta título, descripción breve y, si se define, miniatura.
4. Al activar una tarjeta se abre el visor correspondiente.
5. Un error de red ofrece explicación y acción para reintentar; una colección vacía tiene un estado vacío deliberado.

La navegación no debe contener excepciones basadas en identificadores conocidos. Todos los mapas usan la misma ruta y el mismo visor, por ejemplo `/maps/:slug`.

### 7.2 Inicio de sesión editorial

1. La persona abre el acceso privado.
2. Envía sus credenciales sobre HTTPS.
3. El servidor valida identidad, crea una sesión segura y devuelve el perfil mínimo.
4. La aplicación redirige al panel editorial.
5. Al expirar la sesión, una escritura no se ejecuta silenciosamente: se conserva el borrador local cuando sea viable y se solicita autenticación.

### 7.3 Crear un mapa

1. El editor elige **Nuevo mapa**.
2. Completa título y descripción y selecciona una imagen base.
3. La interfaz valida tipo, tamaño y dimensiones antes de cargar.
4. La carga muestra progreso y permite cancelar.
5. El backend crea el archivo y el borrador en una operación coordinada. Si una parte falla, revierte o marca el recurso para limpieza.
6. El editor entra al estudio con el nuevo mapa centrado y ajustado a la ventana.

Reglas mínimas:

- El título es obligatorio y debe tener longitud acotada.
- El identificador interno lo genera el servidor; el `slug` legible debe ser único y modificable con control de colisiones.
- La descripción puede estar vacía.
- Debe existir exactamente una imagen base activa.
- Los límites de peso, dimensiones y formatos deben aparecer junto al selector.

### 7.4 Editar metadatos y reemplazar la base

- Título, descripción, miniatura, estado y traducciones se editan desde el inspector del proyecto.
- Reemplazar la base requiere confirmación porque puede afectar la relación visual con capas y marcadores.
- Como las posiciones son normalizadas, los marcadores conservan su ubicación relativa. La interfaz debe advertir que un cambio de proporción puede desalinear contenido.
- La base anterior sólo se elimina cuando ninguna revisión la referencia.

### 7.5 Navegar el lienzo

- Rueda o gesto de pinza: zoom alrededor del punto de interacción.
- Arrastre del fondo: paneo.
- Botones visibles: acercar, alejar, restablecer y ajustar a pantalla.
- Doble clic o doble toque: comportamiento configurable; no debe interferir con colocar marcadores.
- El zoom tiene límites explícitos y el lienzo no debe perderse fuera de pantalla.
- Las capas y marcadores se transforman junto con la base.
- Los controles de interfaz permanecen a escala de pantalla; el icono de un marcador puede configurarse para mantener tamaño visual constante.

### 7.6 Crear un marcador

1. El editor selecciona **Marcador**.
2. Elige un icono incorporado o personalizado y, cuando corresponda, un color.
3. El cursor y un mensaje no ambiguo indican que la herramienta está armada.
4. Un clic o toque sobre la imagen crea el marcador en esa posición.
5. Se abre el inspector del marcador para completar su ficha.
6. Guardar persiste los datos; cancelar elimina el marcador provisional.
7. La herramienta vuelve al modo selección, salvo que el editor active explícitamente colocación múltiple.

No se debe crear el marcador si el evento ocurrió sobre un control, fuera del rectángulo real de la imagen o durante un gesto de paneo.

### 7.7 Mover y eliminar un marcador

- En edición, el marcador puede arrastrarse dentro de la imagen o recibir coordenadas desde el inspector.
- El movimiento muestra una previsualización fluida y persiste al soltar, no en cada píxel.
- Teclado: las flechas desplazan en pasos pequeños y una tecla modificadora usa pasos mayores.
- Eliminar requiere confirmación o una acción reversible con **Deshacer**.
- Arrastrar a una papelera puede mantenerse como atajo visual, pero no debe ser la única forma de eliminar y debe funcionar bien en táctil.

### 7.8 Editar la ficha del marcador

La ficha admite:

- título;
- descripción con saltos de línea seguros;
- texto alternativo para el marcador o el icono;
- icono y color;
- icono personalizado opcional;
- colección ordenada de medios;
- visibilidad y estado.

Los medios pueden ser imágenes cargadas y videos externos de proveedores permitidos. Cada elemento tiene tipo explícito, URL o `assetId`, miniatura, texto alternativo, leyenda y orden. No se debe inferir el tipo permanentemente mediante una expresión regular sobre una cadena genérica.

La galería del visitante ofrece anterior, siguiente, indicadores, navegación por teclado y contador. Un video externo se incrusta con una política de orígenes permitidos y título accesible. El contenido introducido por usuarios se renderiza como texto o se sanea estrictamente.

### 7.9 Administrar iconos personalizados

- Subir un icono lo incorpora a una biblioteca del proyecto o del espacio de trabajo, según la opción elegida.
- La selección muestra una miniatura y un nombre accesible.
- Eliminar un icono informa cuántos marcadores lo utilizan y ofrece reemplazo antes de retirarlo.
- La pulsación larga puede ser un atajo, nunca la única interacción descubrible.
- Deben preferirse archivos servidos por URL/identificador. Evitar imágenes base64 dentro de la configuración porque inflan cada lectura y escritura.

### 7.10 Administrar capas

1. El editor crea una capa y asigna un nombre.
2. Carga uno o más elementos de imagen.
3. Puede activar la capa para previsualizarla.
4. Para cada elemento ajusta escala, desplazamiento X/Y, opacidad y orden. Rotación es una extensión prevista.
5. Puede reordenar capas y elementos mediante arrastre y alternativa por botones.
6. Guarda el conjunto como una actualización atómica.

Una capa sin imágenes es válida como estado de preparación, pero no debe publicarse como opción vacía. El visitante puede activar varias capas simultáneamente, salvo que una capa pertenezca a un grupo de exclusión explícito.

### 7.11 Publicar

1. El editor previsualiza el borrador en las dimensiones objetivo.
2. La validación comprueba base disponible, referencias de archivos, campos obligatorios y coordenadas válidas.
3. **Publicar** crea una revisión inmutable o una instantánea coherente.
4. El catálogo y el visor pasan a consumir esa revisión.
5. Un fallo no deja datos parcialmente publicados.

Debe ser posible conservar cambios posteriores como borrador sin alterar inmediatamente la exhibición pública.

### 7.12 Eliminar o archivar

- La acción habitual es **Archivar**, reversible y ausente del catálogo público.
- La eliminación definitiva se reserva a un rol autorizado y exige confirmación reforzada.
- Los archivos sólo se borran cuando no existen referencias desde proyectos o revisiones.

## 8. Matemática del lienzo

La aplicación trabaja con coordenadas visuales, no geográficas.

### 8.1 Coordenadas normalizadas

Si el rectángulo visible de la imagen tiene origen `(left, top)`, ancho `width` y alto `height`, un punto de pantalla `(clientX, clientY)` se guarda como:

```text
x = clamp((clientX - left) / width, 0, 1)
y = clamp((clientY - top) / height, 0, 1)
```

Para renderizar:

```text
left = x * 100%
top  = y * 100%
```

El esquema nuevo debe usar el intervalo `0..1`; si se importan datos antiguos expresados como porcentajes `0..100`, una migración debe convertirlos una sola vez.

### 8.2 Letterboxing

Cuando la imagen usa `object-fit: contain`, el elemento contenedor y la imagen visible no necesariamente comparten rectángulo. La conversión debe usar el rectángulo real de la imagen, calculado desde su proporción intrínseca. De otro modo los marcadores se desplazan en pantallas con otra relación de aspecto.

### 8.3 Transformaciones de capas

Cada elemento de capa debe compartir el mismo espacio de referencia de la base:

```ts
type Transform = {
  scale: number;       // 1 = tamaño natural relativo al lienzo
  offsetX: number;     // fracción del ancho del lienzo
  offsetY: number;     // fracción del alto del lienzo
  rotationDeg: number;
  opacity: number;     // 0..1
};
```

La composición debe usar una matriz o una convención única y probada. No se deben mezclar porcentajes afectados por el orden interno de `scale()` y `translate()` de CSS sin documentarlo.

## 9. Modelo de datos objetivo

Los tipos siguientes son orientativos y deben materializarse tanto en TypeScript como en validadores de ejecución (por ejemplo, JSON Schema o Zod).

```ts
type UUID = string;
type Locale = 'es' | 'en' | 'pt' | string;

interface LocalizedText {
  [locale: Locale]: string;
}

interface Asset {
  id: UUID;
  kind: 'image';
  url: string;
  mimeType: string;
  sizeBytes: number;
  width: number;
  height: number;
  originalName: string;
  checksum: string;
  createdAt: string;
}

interface MapProject {
  schemaVersion: number;
  id: UUID;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  title: LocalizedText;
  description: LocalizedText;
  baseAssetId: UUID;
  thumbnailAssetId?: UUID;
  layers: MapLayer[];
  markers: Marker[];
  iconLibrary: CustomIcon[];
  viewport: ViewportSettings;
  revision: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

interface MapLayer {
  id: UUID;
  name: LocalizedText;
  visibleByDefault: boolean;
  publishVisible: boolean;
  order: number;
  exclusiveGroup?: string;
  items: LayerImage[];
}

interface LayerImage {
  id: UUID;
  assetId: UUID;
  order: number;
  transform: Transform;
}

interface Marker {
  id: UUID;
  position: { x: number; y: number };
  title: LocalizedText;
  description: LocalizedText;
  appearance: MarkerAppearance;
  media: MediaItem[];
  visible: boolean;
  order: number;
}

type MarkerAppearance =
  | { kind: 'system'; icon: SystemIconName; color: string }
  | { kind: 'custom'; customIconId: UUID };

interface CustomIcon {
  id: UUID;
  name: string;
  assetId: UUID;
}

type MediaItem =
  | { id: UUID; kind: 'image'; assetId: UUID; alt: LocalizedText; caption?: LocalizedText; order: number }
  | { id: UUID; kind: 'video'; provider: 'youtube'; externalId: string; title: LocalizedText; order: number };

interface ViewportSettings {
  minZoom: number;
  maxZoom: number;
  initialZoom: 'fit' | number;
  keepMarkerSizeOnZoom: boolean;
}
```

### 9.1 Invariantes

- Todos los IDs son opacos, únicos y generados fuera del reloj del navegador.
- `x`, `y` y `opacity` están entre 0 y 1.
- Escala y zoom son números finitos, positivos y acotados.
- El orden es estable y no depende del orden accidental del objeto JSON.
- Cada `assetId` existente apunta a un recurso válido.
- Una apariencia usa icono de sistema o personalizado, nunca ambos.
- No hay propiedades opcionales que cambien de significado según la página.
- `revision` permite actualización optimista y detección de conflictos.

## 10. API propuesta

La API debe validar entrada y salida, autenticar escrituras y devolver errores estructurados.

```text
GET    /api/public/maps                 catálogo publicado
GET    /api/public/maps/:slug           revisión publicada

POST   /api/auth/session                iniciar sesión
DELETE /api/auth/session                cerrar sesión
GET    /api/me                          sesión y permisos

GET    /api/projects                    listar proyectos editables
POST   /api/projects                    crear borrador
GET    /api/projects/:id                obtener borrador
PATCH  /api/projects/:id                actualizar metadatos/preferencias
DELETE /api/projects/:id                archivar o eliminar según política

POST   /api/projects/:id/layers         crear capa
PATCH  /api/projects/:id/layers/:lid    editar capa
DELETE /api/projects/:id/layers/:lid    eliminar capa

POST   /api/projects/:id/markers        crear marcador
PATCH  /api/projects/:id/markers/:mid   editar/mover marcador
DELETE /api/projects/:id/markers/:mid   eliminar marcador

POST   /api/assets                      cargar archivo
DELETE /api/assets/:id                  eliminar si no tiene referencias
POST   /api/projects/:id/publish        publicar revisión validada
```

Todas las mutaciones deben incluir la revisión esperada mediante `If-Match`, `revision` o mecanismo equivalente. Un conflicto devuelve `409` y permite recargar o resolver, en lugar de pisar el proyecto entero. Los errores usan un formato estable con `code`, `message`, `fieldErrors` y `requestId`.

Para una instalación local pequeña puede usarse SQLite y almacenamiento en disco. Para escalar, el repositorio de dominio y el servicio de archivos deben poder sustituirse por PostgreSQL y almacenamiento de objetos sin cambiar los componentes de UI.

## 11. Arquitectura recomendada

```text
apps/
  web/                         React + TypeScript
    src/
      app/                     rutas, providers, arranque
      features/
        auth/
        catalog/
        map-editor/
        map-viewer/
        layers/
        markers/
        assets/
      shared/
        api/
        ui/
        i18n/
        validation/
        styles/
  api/                         servidor HTTP
    src/
      modules/
        auth/
        projects/
        layers/
        markers/
        assets/
        publishing/
      infrastructure/
        database/
        files/
        logging/
packages/
  contracts/                   DTO, esquemas y tipos compartidos
  canvas-core/                 coordenadas y transformaciones puras
tests/
  e2e/
docs/
```

La división por funcionalidad evita un componente monolítico para todo el menú. Cada feature contiene componentes, hooks, servicio API y pruebas cercanas. `canvas-core` no depende de React y se prueba con casos geométricos puros.

### 11.1 Responsabilidades del frontend

- Presentación, accesibilidad e interacción inmediata.
- Estado efímero de selección, zoom, paneles y herramientas.
- Caché de consultas y mutaciones con invalidación controlada.
- Formularios con borrador y validación temprana.
- Nunca actuar como autoridad de permisos ni persistencia.

### 11.2 Responsabilidades del backend

- Autenticación, autorización y protección CSRF según el tipo de sesión.
- Validación del esquema y de invariantes.
- Persistencia transaccional y control de concurrencia.
- Procesamiento y almacenamiento seguro de archivos.
- Creación de revisiones publicadas.
- Registro de errores y auditoría de operaciones destructivas.

### 11.3 Estado del editor

Conviene distinguir:

- **estado remoto:** proyecto, capas, marcadores, assets;
- **estado de formulario:** valores aún no confirmados;
- **estado del lienzo:** zoom, paneo, selección, herramienta activa;
- **estado global de sesión:** identidad, idioma y permisos.

No debe existir un hook único que cargue todos los mapas y además concentre cada mutación. Las actualizaciones deben dirigirse a entidades concretas y ofrecer `isPending`, `error` y recuperación.

## 12. Componentes de interfaz

### Shell pública

- Encabezado o controles flotantes consistentes.
- Selector de idioma.
- Catálogo o visor según la ruta.
- Identidad visual configurable, no embebida en posiciones rígidas.

### Visor de mapa

- `CanvasViewport`: zoom, paneo y cálculo del rectángulo de imagen.
- `BaseImage`: carga, error, dimensiones y texto alternativo.
- `LayerStack`: composición ordenada de capas activas.
- `MarkerLayer`: render y activación de marcadores.
- `ViewerToolbar`: zoom, reinicio, capas y pantalla completa.
- `MarkerDetails`: ficha y galería accesible.

### Estudio de edición

- `EditorShell`: distribución adaptable.
- `ProjectToolbar`: estado de guardado, deshacer/rehacer, vista previa y publicar.
- `CanvasToolbar`: seleccionar, panear y colocar marcador.
- `LayersPanel`: lista, visibilidad, orden y alta.
- `LayerInspector`: propiedades y elementos de la capa.
- `MarkersPanel`: búsqueda, lista, selección y eliminación.
- `MarkerInspector`: contenido, apariencia y medios.
- `AssetPicker`: cargar, elegir y reutilizar archivos.

### Diálogos compartidos

- Confirmación con foco atrapado y retorno de foco.
- Aviso no bloqueante para operaciones exitosas.
- Error persistente con reintento para fallas accionables.
- Progreso de carga de archivos.

## 13. Estados de interfaz obligatorios

Cada consulta y mutación debe contemplar: inicial, cargando, éxito vacío, éxito con datos, error recuperable, sin permiso y conflicto de revisión. Además:

- indicador **Sin cambios / Cambios pendientes / Guardando / Guardado / Error al guardar**;
- placeholder mientras carga la imagen base;
- fallback si un archivo falta o no decodifica;
- desactivación de acciones duplicadas durante una mutación;
- confirmación antes de perder un formulario modificado;
- aviso si se intenta cerrar la pestaña con cambios locales pendientes;
- recuperación del último borrador local ante un cierre inesperado, sin confundirlo con la versión guardada.

## 14. Diseño visual a reconstruir con capturas

Las capturas que el responsable del proyecto entregue a la IA del nuevo repositorio forman parte de la especificación visual. Este documento define comportamiento y arquitectura; las capturas definen la apariencia de referencia. Ante una diferencia meramente estética debe prevalecer la captura más reciente y representativa. Ante una contradicción funcional, de seguridad, accesibilidad o adaptabilidad debe prevalecer este documento y registrarse la decisión.

Las capturas deben analizarse por componentes, no copiarse como una única maqueta rígida. Para cada captura registrar:

- tamaño exacto del viewport y densidad aproximada;
- retícula, márgenes y áreas seguras;
- jerarquía tipográfica y archivos de fuente autorizados;
- paleta como tokens semánticos (`surface`, `text`, `accent`, `danger`, etc.);
- radios, sombras, desenfoque, bordes y opacidades;
- dimensiones y estados de botones;
- orden de superposición de lienzo, paneles, menús y modales;
- estado funcional representado: vista, edición, selección, carga o error;
- adaptación esperada a otras proporciones.

La entrega de capturas debería incluir, cuando sea posible:

- nombre de la pantalla y ruta correspondiente;
- perfil representado: visitante o editor;
- idioma visible;
- dimensiones del viewport y nivel de zoom del navegador;
- estado de paneles, capas, marcador seleccionado y modal;
- indicación de cuál captura es la referencia principal si existen variantes;
- assets originales —logos, iconos, fondos y fuentes— cuando no puedan recuperarse fielmente desde una imagen.

La IA reconstructora debe elaborar primero un inventario de pantallas y estados observados. Después debe identificar componentes repetidos, extraer tokens de diseño y construir una interfaz adaptable. No debe rasterizar las capturas, usarlas como fondo, fijar toda la composición a una resolución ni inventar funciones a partir de elementos visuales ambiguos. Cuando una captura sólo muestre un idioma, la misma estructura debe probarse igualmente con español, portugués e inglés.

La estética actual usa superficies oscuras, paneles translúcidos y un acento cálido. Esos rasgos pueden conservarse como tema, pero deben implementarse con tokens CSS y componentes compartidos. Evitar estilos inline, valores de `z-index` arbitrarios y ubicaciones fijas dependientes de una sola resolución.

## 15. Accesibilidad y dispositivos de entrada

- HTML semántico antes que contenedores con `onClick`.
- Todos los botones tienen nombre accesible; los iconos decorativos se ocultan a lectores.
- Paneles y modales admiten teclado, `Escape`, trampa de foco y restauración de foco.
- Contraste conforme a WCAG 2.2 AA.
- Foco visible y orden lógico.
- Movimiento reducido mediante `prefers-reduced-motion`.
- Zoom de navegador y escalado de texto sin pérdida de controles.
- Gestos táctiles no bloquean el desplazamiento necesario de paneles.
- Alternativas por teclado a drag-and-drop y pulsación larga.
- Imágenes informativas con texto alternativo editable; decorativas con `alt=""`.

## 16. Seguridad y archivos

- Contraseñas con hash fuerte y sesiones `HttpOnly`, `Secure` y `SameSite` apropiado.
- Rate limiting en autenticación y cargas.
- CORS limitado al origen esperado; no abierto indiscriminadamente en producción.
- Validar MIME real, extensión, firma, peso, dimensiones y cantidad de archivos.
- Generar nombres opacos y no confiar en el nombre original como ruta.
- Rechazar SVG no saneado o servirlo con política segura.
- No aceptar cuerpos JSON enormes como sustituto de almacenamiento de archivos.
- CSP restrictiva, especialmente para videos externos.
- Textos del editor tratados como datos, nunca HTML confiable.
- Backups consistentes de base y assets, más prueba periódica de restauración.
- Registro de inicio de sesión, publicación, archivo y eliminación, sin guardar secretos.

## 17. Rendimiento y robustez

- Crear miniaturas para catálogo e inspector; no descargar originales para vistas pequeñas.
- Carga diferida de medios y capas inactivas.
- Precargar sólo la base y los recursos visibles por defecto.
- Comprimir imágenes cuando el caso lo permita y conservar el original según política.
- Evitar reescrituras completas del catálogo y blobs base64 en JSON.
- Mantener interacción de paneo y zoom fluida; las escrituras no deben bloquear frames.
- Cancelar solicitudes obsoletas al cambiar de proyecto.
- Añadir límites documentados de proyectos, capas, elementos, marcadores y medios.
- Usar logs estructurados, `requestId`, endpoint de salud y métricas mínimas de errores y latencia.

## 18. Pruebas y criterios de aceptación

### 18.1 Unitarias

- Conversión pantalla ↔ coordenada normalizada con distintas proporciones y letterboxing.
- Composición y serialización de transformaciones.
- Validación del modelo, límites y referencias.
- Extracción/validación de identificadores de proveedores de video.
- Reducers o máquina de estados de herramientas del editor.

### 18.2 Integración

- Crear, actualizar y publicar sin sobrescribir otro proyecto.
- Conflicto de revisión devuelve `409` y no pierde datos.
- Carga inválida no crea asset ni proyecto incompleto.
- Eliminación respeta referencias.
- Autorización deniega todas las escrituras a visitantes.

### 18.3 End-to-end

1. Iniciar sesión, crear un mapa y comprobar que abre en el estudio.
2. Colocar un marcador con mouse y otro con táctil simulado.
3. Editar texto, apariencia y medios; recargar y verificar persistencia.
4. Mover un marcador tras hacer zoom y comprobar que conserva su posición relativa.
5. Crear una capa, cargar imágenes, transformarlas, reordenarlas y alternar su visibilidad.
6. Previsualizar, publicar y verificar el resultado desde una sesión anónima.
7. Archivar y restaurar.
8. Probar navegación completa por teclado y viewport objetivo de kiosco.

### 18.4 Visuales

- Pruebas de regresión por captura en los tamaños de referencia.
- Estados mínimos: catálogo, visor, panel cerrado/abierto, colocación, inspector, ficha, confirmación, carga y error.
- Las diferencias aceptables deben limitarse a antialiasing o contenido dinámico enmascarado.

### 18.5 Definición de terminado

Una funcionalidad se considera terminada cuando tiene tipos y validación, estados de carga/error, autorización, accesibilidad por teclado, pruebas relevantes, textos internacionalizables y documentación de cualquier decisión no evidente.

## 19. Diagnóstico del repositorio actual

El código vigente sirvió para validar el concepto, pero no debe tomarse literalmente como plantilla. Hoy coexisten dos arquitecturas: páginas temáticas implementadas a medida y un flujo dinámico basado en configuración. La reconstrucción del **armador** debe quedarse con un único motor configurable.

### 19.1 Fuente vigente identificada

Para comprender el armador actual, las piezas relevantes son:

- `src/pages/Home/Home.tsx`: catálogo, alta y baja de mapas.
- `src/pages/DynamicMap/DynamicMap.tsx`: visor genérico.
- `src/hooks/useDynamicMapConfig.ts`: carga y mutaciones de configuración.
- `src/components/MapViewer/`: lienzo, zoom, paneo, drop y papelera.
- `src/components/MapMarker/`: representación del marcador.
- `src/components/LayerMenu/`: edición de capas, marcadores e iconos.
- `src/components/InfoModal/`: ficha pública y edición contextual.
- `src/contexts/DevModeContext.tsx`: activación actual de edición.
- `server/index.js`: API local y cargas.
- `server/data/maps.json`: fuente operativa usada por ese servidor.

Esta lista explica la implementación observada; no prescribe conservar esos límites de archivo.

### 19.2 Archivos o grupos que no deben guiar la reconstrucción

| Elemento | Diagnóstico | Tratamiento recomendado |
|---|---|---|
| Páginas temáticas dedicadas y sus recursos | Implementaciones de contenido particular, mezcladas con el editor dinámico | No portar al núcleo. Importar contenido futuro mediante el esquema común |
| `data/maps.json` | Copia divergente que el servidor de desarrollo no lee | Eliminar tras respaldar o convertir en fixture identificado |
| `Entregable_Cliente/` | Salida compilada y copia de datos/recursos | Generar en CI o en release; no versionar como fuente |
| `.dist/` | Artefacto de compilación | Ignorar y regenerar |
| `temp.json` | Volcado temporal grande, sin referencia en la app | Retirar del producto |
| `test_post.js` | Script manual de prueba que modifica el conjunto completo | Sustituir por pruebas de integración aisladas |
| `git_diff.patch`, `diff_antartida.patch` | Parches de trabajo históricos | Archivar fuera del árbol productivo o eliminar tras verificar su valor |
| `implementation_plan.md` | Plan de una etapa inicial ya superada | Conservar sólo como histórico, claramente marcado, o archivar |
| `SRS.txt` y `docs/SRS.txt` | Duplicados idénticos | Mantener una única versión en `docs/` |
| `scripts/generateBackgroundList.cjs` y `src/backgroundList.json` | Flujo anterior no invocado por `package.json` | Eliminar si no existe un consumidor externo |
| `Microsoft/Windows/PowerShell/ModuleAnalysisCache` | Caché local ajena a la aplicación | Eliminar del repositorio y agregar al ignore |
| `public/images/uploads/` | Mezcla de datos operativos con assets versionados | Mover cargas a almacenamiento administrado y separar fixtures |
| `maplibre-gl`, `react-map-gl` | Dependencias sin importaciones en el código fuente relevado | No instalar en la reconstrucción salvo requisito GIS futuro |
| Assets iniciales de Vite y CSS de plantilla sin consumidor real | Restos del scaffold | Eliminar al crear la nueva base |

No se recomienda borrar automáticamente estos elementos durante la reconstrucción: primero se crea inventario, respaldo y migración verificable. Los archivos cargados pueden estar referenciados por datos aunque parezcan huérfanos a simple vista.

### 19.3 Conductas actuales útiles que deben conservarse

- Crear un mapa desde una imagen y metadatos.
- Posicionar marcadores mediante porcentajes relativos.
- Zoom y paneo conjunto de base, capas y marcadores.
- Iconos incorporados con colores e iconos personalizados.
- Movimiento por drag-and-drop.
- Capas activables con varias imágenes y transformaciones individuales.
- Fichas con texto, galería y video externo.
- Selector de idioma, confirmaciones propias y orientación a pantalla táctil.

### 19.4 Problemas actuales que no deben replicarse

- Autenticación y credenciales embebidas en el frontend; cualquier persona puede inspeccionarlas y el backend no protege escrituras.
- Un `POST /api/maps` sobrescribe el arreglo completo, con riesgo de pérdida por concurrencia.
- Escrituras optimistas sin comprobar `response.ok`, rollback ni error visible.
- Mutaciones superficiales que pueden modificar estructuras anidadas por referencia.
- IDs basados en `Date.now()` y tipos `any` en el dominio.
- Varias definiciones parciales de `MapConfig`.
- Transformaciones que unas acciones guardan inmediatamente y otras sólo con botón.
- Imágenes guardadas unas veces como archivo y otras como data URL dentro del JSON.
- Límite de medios inconsistente entre interfaces.
- Campos de alcance heredados que no se aplican uniformemente en el visor genérico.
- Eliminación de configuración sin recolección segura de archivos asociados.
- Menú de edición monolítico, con lógica de red, dominio y estilos inline en el mismo componente.
- Rutas especiales seleccionadas mediante IDs conocidos.
- Ausencia de esquema, migraciones, pruebas automatizadas y endpoints granulares.
- Valores de layout y `z-index` rígidos, con poca adaptación responsive explícita.
- CORS abierto y cargas con validación insuficiente.
- Empaquetado no integrado en los scripts normales y dependiente de herramientas no declaradas.

## 20. Estrategia de reconstrucción desde cero

### Fase 0 — Congelar y respaldar

- Copiar la configuración operativa y todos los archivos referenciados a un respaldo verificable.
- Generar un manifiesto con checksum, tamaño, MIME y cantidad de referencias.
- No usar el entregable compilado como fuente si existe código fuente equivalente.

### Fase 1 — Contratos y canvas

- Definir esquema versionado, validadores y migraciones.
- Implementar `canvas-core` y probar coordenadas, letterboxing y transformaciones.
- Construir el visor genérico con datos ficticios neutros.

### Fase 2 — Backend seguro

- Incorporar persistencia transaccional, assets administrados y autenticación real.
- Exponer API granular y control de revisión.
- Añadir pruebas de integración y backups.

### Fase 3 — Editor esencial

- Crear proyectos, cambiar base, crear/mover/editar marcadores.
- Implementar estado de guardado, deshacer/rehacer y recuperación de errores.
- Validar mouse, touch y teclado.

### Fase 4 — Capas y multimedia

- Agregar orden, transformaciones, opacidad, biblioteca de iconos y galería tipada.
- Optimizar archivos y carga diferida.

### Fase 5 — Publicación y migración

- Separar borrador de revisión publicada.
- Crear importador idempotente desde el JSON anterior.
- Comparar la salida con capturas y pruebas visuales, sin codificar excepciones por contenido.

### Fase 6 — Entrega reproducible

- Configurar CI con formato, lint, tipos, pruebas, build y escaneo de dependencias.
- Producir artefactos fuera del control de versiones, con versión y checksum.
- Documentar instalación, actualización, backup y restauración.

## 21. Decisiones que deben cerrarse antes de implementar

1. ¿La instalación será exclusivamente local/kiosco o también multiusuario en red?
2. ¿Qué dimensiones y navegadores corresponden a las capturas objetivo?
3. ¿Qué campos secundarios pueden admitir fallback al español y cuáles deben exigir las tres traducciones para publicar?
4. ¿Cuáles son los límites máximos de archivo, capas, marcadores y medios?
5. ¿Se requiere funcionamiento sin Internet para videos y otros recursos externos?
6. ¿Los iconos personalizados pertenecen a un mapa o a una biblioteca compartida?
7. ¿Se necesita historial completo, sólo deshacer durante la sesión o revisiones publicadas?
8. ¿Qué política de backup, retención y eliminación exige la instalación?

Estas decisiones cambian contratos o infraestructura y deben registrarse como ADR (Architecture Decision Record), no quedar implícitas en componentes.

## 22. Checklist para una IA que reconstruya la app

- Leer este documento completo y registrar las decisiones abiertas.
- Analizar las capturas por estado y viewport; no inferir funciones únicamente por estética.
- Implementar un solo visor y un solo modelo de proyecto.
- Crear primero contratos, validación y matemática del canvas.
- Usar contenido ficticio neutro en desarrollo y pruebas.
- Mantener dominio, red, archivos, estado de UI y presentación separados.
- No copiar credenciales, datos reales, rutas especiales ni blobs del repositorio anterior.
- No introducir una librería GIS si el requisito sigue siendo imagen + coordenadas normalizadas.
- Verificar cada flujo en mouse, táctil y teclado.
- Entregar pruebas, migraciones, documentación operativa y build reproducible junto con el código.

## 23. Resultado esperado

La nueva aplicación debe permitir que una persona sin modificar código cree una experiencia interactiva completa: carga una imagen base, añade capas y marcadores, ajusta su presentación, adjunta información, previsualiza y publica. El visitante recibe un visor estable y accesible. El contenido es dato importable; el armador es el producto; ninguna experiencia particular obliga a bifurcar la arquitectura.
