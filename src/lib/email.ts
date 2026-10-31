import nodemailer from 'nodemailer'

const htmlEscapeMap: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => htmlEscapeMap[character])
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

export async function sendVerificationEmail(email: string, url: string) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Vérifiez votre email - Miss France Pronos',
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ec4899;">Miss France Pronos</h1>
        <p>Cliquez sur le lien ci-dessous pour vérifier votre adresse email :</p>
        <p><a href="${escapeHtml(url)}" style="display: inline-block; background: #ec4899; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Vérifier mon email</a></p>
        <p>Ce lien expire dans 24 heures.</p>
        <hr style="margin: 24px 0; border-color: #fce7f3;">
        <p style="color: #6b7280; font-size: 14px;">Si vous n'avez pas demandé cette inscription, ignorez cet email.</p>
      </div>
    `,
  })
}

export async function sendInvitationEmail(email: string, groupName: string, inviteUrl: string) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Invitation à rejoindre un groupe - Miss France Pronos',
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ec4899;">Miss France Pronos</h1>
        <p>Vous avez été invité à rejoindre le groupe <strong>${escapeHtml(groupName)}</strong>.</p>
        <p><a href="${escapeHtml(inviteUrl)}" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Rejoindre le groupe</a></p>
        <hr style="margin: 24px 0; border-color: #fce7f3;">
        <p style="color: #6b7280; font-size: 14px;">Si vous n'avez pas de compte, vous pourrez en créer un après avoir cliqué sur le lien.</p>
      </div>
    `,
  })
}