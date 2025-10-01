const RESEND_API_URL = 'https://api.resend.com/emails';

const buildResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return buildResponse(200, {});
  }

  if (event.httpMethod !== 'POST') {
    return buildResponse(405, { message: 'Method Not Allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const targetEmail = process.env.RESEND_TARGET_EMAIL;
  const subject = process.env.RESEND_SUBJECT || 'Nuevo registro en la lista prioritaria de Gingnor';

  if (!apiKey || !fromEmail || !targetEmail) {
    return buildResponse(500, {
      message: 'La configuración del servicio de correo no está completa.',
    });
  }

  let payload;

  try {
    payload = JSON.parse(event.body || '{}');
  } catch (error) {
    return buildResponse(400, { message: 'Solicitud inválida.' });
  }

  const email = String(payload.email || '').trim();

  if (!email) {
    return buildResponse(400, { message: 'El correo electrónico es obligatorio.' });
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Gingnor Early Access <${fromEmail}>`,
        to: [targetEmail],
        subject,
        reply_to: email,
        html: `
          <h1>Nuevo registro</h1>
          <p>Se ha registrado un nuevo correo para la beta privada de Gingnor.</p>
          <p><strong>Correo:</strong> ${email}</p>
          <p>Recuerda dar seguimiento para continuar con el proceso de bienvenida.</p>
        `,
      }),
    });

    if (!response.ok) {
      const details = await response.json().catch(() => ({}));
      console.error('Error al enviar correo con Resend:', details);
      return buildResponse(response.status, {
        message: 'No fue posible enviar el correo.',
      });
    }

    return buildResponse(200, { message: 'Correo enviado correctamente.' });
  } catch (error) {
    console.error('Error inesperado al enviar correo:', error);
    return buildResponse(500, { message: 'Ocurrió un error al procesar tu solicitud.' });
  }
};
