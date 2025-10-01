# gingnor

## Configuración del formulario de registro

El formulario de registro utiliza una función serverless de Netlify para enviar las notificaciones por correo a través de [Resend](https://resend.com/). Para que el envío funcione correctamente debes definir las siguientes variables de entorno en tu proyecto (por ejemplo en Netlify):

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_TARGET_EMAIL`
- `RESEND_SUBJECT` (opcional, cuenta con un valor por defecto)

La función se encuentra en `netlify/functions/send-email.js`. Si ejecutas el proyecto de forma local con `netlify dev`, las variables de entorno pueden declararse en un archivo `.env` en la raíz del proyecto.