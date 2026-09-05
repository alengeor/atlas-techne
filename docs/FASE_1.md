# Fase 1 — frontend local y capas

> Registro histórico de la primera entrega. La versión actual ya tiene acceso Editor y persistencia real, sin catálogo de demostración: ver [cambios posteriores](CAMBIOS_EDITOR_Y_GUARDADO.md).

Fecha: 2026-09-05. Entrega: primera fase de frontend de la propuesta simplificada.

## Resultado

App Vite/React/TypeScript ejecutable con un comando en localhost. Portada con los recursos de identidad que el usuario agregó; visor genérico con bases alternativas y superposiciones alineadas; zoom/paneo; fichas y galería; ES/PT/EN sin remontar la vista. Estudio de prueba con carga local de imágenes, capas, iconos personalizados y creación/edición/cancelación de marcadores provisionales.

Las herramientas aplican cambios únicamente a la sesión actual. Este alcance se comunica en portada, visor, paneles, acceso al estudio y botones de aplicar. No existe login ficticio ni guardado/publicación simulados. Las carpetas operativas existentes permanecen vacías y sin modificaciones.

## Verificaciones ejecutadas

Entorno: Windows, Node 24.16.0, npm 11.13.0. Dependencias resueltas en `package-lock.json`.

| Comando | Resultado |
|---|---|
| `npm.cmd install …` | Dependencias instaladas; auditoría npm informó 0 vulnerabilidades |
| `npm.cmd run lint` | Correcto, sin advertencias de lint |
| `npm.cmd run test` | 19 pruebas unitarias correctas en 4 archivos |
| `npm.cmd run build` | Correcto, chequeo de tipos y compilación Vite; dos advertencias de comentarios de Zod detalladas debajo |
| `npm.cmd run test:e2e:install` | Chromium instalado para pruebas |
| `npm.cmd run test:e2e` | 10 pruebas correctas con Chromium |

Cobertura unitaria: contain/letterboxing, puntos externos, ida/vuelta con zoom/paneo en distintos tamaños, límites de vista, esquema/versionado/referencias, orden no mutante, exclusión de bases y overlays independientes, URLs de video permitidas, estado de herramientas e idiomas.

Cobertura de navegador: alternar capas sin mover marcadores; conservar zoom/ficha/medio al cambiar ES/PT/EN; restaurar foco al cerrar; colocar/abrir/cancelar/aplicar marcador; excluir bandas vacías, controles y paneo; cargar y seleccionar icono automáticamente; rechazar proporción incorrecta; cargar una superposición alineada; toque real simulado y navegación de lienzo por teclado. Flujos principales a 1920×1082; pantallas adicionales a 1918×1082, 1024×768, 768×1024 y 390×844, sin overflow horizontal de documento.

Se abrieron y revisaron visualmente las capturas generadas de catálogo y visor frente a la composición relevada. Se corrigieron la dirección del selector de idioma y el área táctil de los marcadores tras esa revisión. `test-results/` contiene las capturas generadas y está ignorado por Git. No hay todavía baselines de regresión visual aprobadas: la comparación no es una prueba de igualdad píxel a píxel.

## Errores encontrados y resueltos

- PowerShell bloquea `npm.ps1` por política del equipo: se usó `npm.cmd`, sin alterar esa política.
- El sandbox impidió descargar paquetes y a esbuild leer la configuración de Vite. Se repitieron las operaciones con permiso de ejecución fuera del sandbox; no fue necesario modificar el código por esa restricción.
- npm señaló ESLint 9 sin soporte: se reemplazó por ESLint 10 antes de cerrar la fase.
- La primera ejecución e2e tuvo 6/7 pruebas correctas; una aserción de prueba seleccionaba dos elementos con rol status (zoom y aviso). Se precisó el selector del aviso. La ejecución final ampliada pasa 10/10.

## Advertencias y límites

- Rollup informa dos anotaciones `@__PURE__` mal ubicadas en comentarios de Zod 4.5.4; elimina los comentarios y termina correctamente. No se ocultaron esas advertencias ni se modificaron dependencias instaladas a mano.
- El GIF provisto pesa aproximadamente 4,64 MB; se conserva el original. Puede optimizarse con autorización de la fase correspondiente. Prefers-reduced-motion muestra un fondo estático de CSS.
- Pinza está implementada mediante Pointer Events, pero no se ensayó en hardware táctil físico. Las pruebas actuales simulan toque y teclado; no certifican todas las combinaciones de dispositivos.
- No se ejecutaron pruebas de backend, permisos reales, publicación, backup ni Docker porque esas funciones todavía no están implementadas en esta fase.
- No se declara certificación WCAG completa: hay controles semánticos, objetivos de 44 px, foco visible, diálogo nativo, Escape y prueba de restauración; falta evaluación asistiva y de contraste completa.
- Formatos locales admitidos: PNG/JPEG/WebP. Los SVG en fixtures son contenido propio controlado, no SVG subidos por visitantes. La validación de cargas de esta fase es exclusivamente temprana en navegador.

## Diferencias respecto del plan y siguiente fase

Se incorporó el logo y el fondo reales porque aparecieron en `images/` antes de empezar. Se adelantaron interacciones locales del editor para que la referencia visual fuera comprobable, sin implementar la persistencia de fase 2. Se eligió Zod para contratos/tipos compartidos en lugar del JSON Schema/Ajv de la primera propuesta, por su validación y tipos inferidos en una sola definición.

La fase 2 deberá implementar autenticación real y guardado en `maps-data`/`maps-multimedia`, resolver rutas y referencias portables, edición completa de medios y transformaciones, movimiento de marcadores al soltar, estados de guardado/error/conflicto, recuperación local y deshacer/rehacer. La publicación real y Docker siguen en la fase de entrega acordada. No se avanzó automáticamente a esas fases.
