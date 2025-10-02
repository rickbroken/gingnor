# gingnor

## Configuración del formulario de registro

El formulario de registro utiliza [SMTPJS](https://smtpjs.com/) para enviar notificaciones por correo directamente desde el navegador. Debes generar un `SecureToken` en SMTPJS y reemplazar los valores de las constantes declaradas al inicio de `js/main.js`.

Variables a configurar:

- `SMTP_SECURE_TOKEN`
- `SMTP_FROM_EMAIL`
- `SMTP_TARGET_EMAIL`
- `SMTP_SUBJECT` (opcional, puedes ajustar el valor por defecto)

Recuerda que los valores sensibles no deben compartirse públicamente. Si prefieres gestionar el envío desde un entorno controlado, puedes integrar los datos con tu propio backend o función serverless asegurando estas credenciales.
