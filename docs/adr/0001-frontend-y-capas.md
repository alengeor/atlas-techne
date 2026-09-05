# ADR 0001 — frontend local y capas alineadas

Estado: implementado para fase 1. Fecha: 2026-09-05.

## Contexto

El usuario autorizó comenzar el desarrollo después de simplificar el plan: Vite/React, JSON y archivos en dos carpetas portables, capas como imágenes alineadas y estética cercana a capturas. El plan limita cada entrega a su fase.

## Decisión

Una raíz npm, Vite 7, React 19 y TypeScript 5 estricto. Node 24 local. Sin backend ficticio ni credenciales en cliente. Un adaptador carga fixtures neutros validados con Zod 4; los mapas temporales se editan en memoria con avisos visibles. La persistencia de servidor queda para fase 2.

Una capa equivale a una imagen del lienzo completo. Las bases forman un grupo exclusivo y las superposiciones son independientes. Todas comparten un único rectángulo contain y una transformación de vista. El cálculo de clics rechaza letterboxing; no lo convierte en puntos pegados al borde. Los iconos mantienen objetivos de 44 px de pantalla bajo zoom. El DOM se transforma durante el paneo sin reconstruir todo el mapa por cada movimiento.

La identidad se centraliza en `src/app/identity.ts`, usando el PNG y GIF que el usuario agregó. Los fixtures gráficos son SVG propios, no las capturas ni contenido temático. La fuente es del sistema. El fondo animado se reemplaza visualmente por un gradiente bajo prefers-reduced-motion.

Las rutas futuras de almacenamiento se conservan en la propuesta, pero no se crean archivos operativos ni esquemas de autenticación a medias. Vite bloquea la lectura directa de las carpetas privadas previstas. Ningún secreto ni dato operativo forma parte del build.

## Consecuencias

Se puede revisar la interacción y estética en localhost. No se puede publicar ni conservar trabajo entre reinicios. Un futuro adaptador HTTP debe reemplazar los fixtures y agregar autorización real antes de exponer escrituras. El esquema actual describe contenido; no mezcla URLs blob temporales con rutas persistentes. Los blobs de imágenes propias viven en un registro efímero separado y se liberan al cerrar la aplicación o cancelar una carga no usada.

La validación Zod comparte esquema y tipos inferidos. Vitest comprueba geometría y contratos; Playwright comprueba flujos y layout en Chromium. ESLint 10 reemplazó la línea 9 inicialmente evaluada porque npm la marcó sin soporte al instalar.
