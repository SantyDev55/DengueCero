# DengueCero — parche del mapa comunitario

## Qué corrige

- El mapa se puede probar sin Supabase: muestra pines **simulados y etiquetados**, permite elegir una ubicación aproximada y guarda reportes de prueba en el navegador.
- Los ejemplos simulados no entran en los indicadores de reportes ni se presentan como datos reales.
- Con Supabase configurado, carga y publica reportes compartidos.
- Mantiene ubicaciones aproximadas (latitud/longitud redondeadas a tres decimales), añade mensajes más claros, controla errores y mejora el diseño para celulares/tablets.
- El mapa inicia en Lima Norte para facilitar la demostración, y conserva el botón para ver todo el Perú.

## Instalar en tu proyecto

Descomprime el ZIP y copia sus carpetas dentro de la carpeta principal de tu repositorio, aceptando reemplazar:

- `js/mapa.js`
- `css/mapa.css`

No reemplaces `js/mapa-config.js` si ya contiene una configuración tuya. Si aún está vacío, abre ese archivo y copia la estructura de `js/mapa-config.js.example` con tus propios valores.

## Probar ahora, sin backend

1. Deja `js/mapa-config.js` así: `window.DENGUE_MAPA = { url: '', key: '' };`
2. Abre el proyecto en un servidor local (por ejemplo, Live Server en VS Code) o en su dirección HTTPS.
3. Ve a **Mapa comunitario de criaderos**. Verás una banda amarilla de modo demostración y pines morados de ejemplos simulados.
4. Toca el mapa para marcar una zona, selecciona un recipiente y pulsa **Enviar reporte**. El reporte aparecerá en el mapa y en los indicadores, pero solo dentro de ese navegador.

## Activar reportes compartidos con Supabase

1. Crea un proyecto en Supabase.
2. Abre **SQL Editor**, pega `supabase/configurar_mapa.sql` y ejecútalo. Si ya habías creado la tabla con el esquema anterior, este script vuelve a crear las políticas sin borrar reportes existentes.
3. En **Project Settings → API** (o sección equivalente), copia la URL del proyecto y la clave pública `anon` o `publishable`.
4. Edita `js/mapa-config.js`:

   ```js
   window.DENGUE_MAPA = {
     url: 'https://TU-PROYECTO.supabase.co',
     key: 'TU_CLAVE_PUBLICA_ANON_O_PUBLISHABLE'
   };
   ```

5. Guarda y publica los cambios. La banda de demostración desaparecerá y las nuevas contribuciones se compartirán online.
6. Haz una prueba real controlada desde dos navegadores o dispositivos para comprobar que un reporte enviado desde uno aparece en el otro.

**Importante:** utiliza solamente la clave pública `anon`/`publishable` en el frontend. Nunca coloques `service_role` en archivos JavaScript publicados. Las políticas RLS limitan lo que puede leer y enviar un visitante anónimo, pero una web pública sin cuenta todavía puede recibir spam; antes de una campaña comunitaria amplia conviene agregar moderación y protección antispam del lado del servidor.

## Qué se puede afirmar ante el jurado

- Los pines simulados son solo para demostrar la interfaz.
- Un reporte ciudadano no es un caso confirmado de dengue ni una inspección oficial; es una observación que no está verificada.
- “Atendido” significa que la persona declara haberlo atendido.
- Sin Supabase, los reportes no salen del navegador y no los puede ver la comunidad.
- El mapa no reemplaza los canales oficiales de salud ni emergencias.
