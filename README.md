# DengueCero

Plataforma educativa para guiar una inspección preventiva del hogar y registrar posibles criaderos del zancudo que transmite el dengue.

## Abrir localmente

1. Descomprime la carpeta.
2. Abre `index.html` en un navegador moderno. Para probar todas las funciones, se recomienda abrirla mediante un servidor estático local o publicarla en HTTPS.
3. Los registros se guardan en `LocalStorage` del navegador en el que se usa la web; no se envían a un servidor.

También se incluye `DengueCero.html`, una versión de un solo archivo para abrir rápidamente. Para desarrollar y mantener el proyecto, utiliza la versión organizada en `index.html`, `css/` y `js/`.

## Publicación

La web es estática. Puedes publicar la carpeta en GitHub Pages, Netlify, Cloudflare Pages o cualquier alojamiento estático. Sube `index.html`, `css/` y `js/` conservando la estructura de carpetas.

## Funcionalidades

- Inspección guiada de 15 puntos en 5 zonas del hogar.
- Estados: sin revisar, revisado sin hallazgo y posible criadero.
- Recomendaciones específicas y registro local de acciones declaradas como realizadas.
- Progreso, resultados, historial e informe imprimible/guardable en PDF.
- Compartir resumen y descargar un recordatorio de calendario (`.ics`).
- Información educativa, señales de alarma y reto de mitos y verdades con banco de 50 preguntas; cada ronda selecciona cinco al azar, muestra explicaciones y permite repasar errores al finalizar.
- Siguientes pasos personalizados tras la inspección, priorizando acciones pendientes y puntos sin revisar a partir de las respuestas declaradas. El orden es orientativo y no una puntuación sanitaria oficial.
- Modo Brigada Escolar: guion breve, agenda de actividad de 10 minutos, lista de preparación guardada localmente y guía imprimible.
- Diseño adaptable, navegación por teclado y soporte para preferencia de movimiento reducido.

## Límites

- No ofrece diagnóstico ni certificación sanitaria.
- Los hallazgos son declaraciones de la persona que realiza la inspección.
- No hay cuentas, servidor ni sincronización entre dispositivos.
- La información sanitaria general se apoya en los enlaces oficiales citados en la página; debe consultarse la guía oficial vigente para recomendaciones actualizadas.

## Fuentes principales

- Ministerio de Salud del Perú: https://www.gob.pe/institucion/minsa/campa%C3%B1as/8255-campana-de-prevencion-contra-el-dengue
- Minsa, prevención en el hogar (27 de enero de 2026): https://www.gob.pe/institucion/minsa/noticias/1341720-como-prevenir-en-el-hogar-la-aparicion-del-zancudo-que-transmite-el-dengue
- Organización Mundial de la Salud: https://www.who.int/es/news-room/fact-sheets/detail/dengue-and-severe-dengue
