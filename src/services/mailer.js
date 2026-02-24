import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOwnerNotification = async ({
  userName,
  userEmail,
  serviceType,
  serviceName,
  circuitName,
  message,
  language,
}) => {
  const subject =
    serviceType === "circuit"
      ? `Nuevo interés en circuito`
      : `Nuevo interés en servicio`;

  const text = `
Nuevo interés recibido

Usuario:
Nombre: ${userName}
Email: ${userEmail}

Tipo: ${serviceType}
Servicio: ${serviceName}
${circuitName ? `Circuito: ${circuitName}` : ""}

Idioma: ${language}

Mensaje del usuario:
${message || "No dejó mensaje"}

Fecha: ${new Date().toLocaleString()}
`;

  await transporter.sendMail({
    from: `"Luxury Travel Point" <${process.env.SMTP_USER}>`,
    to: process.env.OWNER_EMAIL,
    subject,
    text,
  });
};
