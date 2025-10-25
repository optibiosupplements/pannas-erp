import formData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(formData);

// Only initialize Mailgun if API key is configured
const MAILGUN_ENABLED = !!process.env.MAILGUN_API_KEY;

const mg = MAILGUN_ENABLED ? mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY!,
}) : null;

const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || '';
const FROM_EMAIL = process.env.BUSINESS_EMAIL || 'noreply@' + MAILGUN_DOMAIN;

export async function sendConfirmationEmail(
  customerEmail: string,
  rfqNumber: string
) {
  // Skip sending if Mailgun is not properly configured
  if (!MAILGUN_ENABLED || !mg) {
    console.log(`Mailgun not configured - skipping confirmation email to ${customerEmail} for ${rfqNumber}`);
    return { success: false, error: 'Email service not configured' };
  }

  const messageData = {
    from: `Panna - OptiBio Supplements <${FROM_EMAIL}>`,
    to: customerEmail,
    subject: `RFQ Received - ${rfqNumber}`,
    text: `Dear Valued Customer,

Thank you for your quote request. We have received your inquiry and assigned it reference number ${rfqNumber}.

Our team is currently reviewing your requirements and will get back to you shortly with a detailed quotation.

If you have any additional information or questions, please don't hesitate to reach out.

Best regards,
Panna
OptiBio Supplements
Nutraceutical Brokerage & Consulting

---
This is an automated confirmation. Please do not reply to this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">RFQ Received</h2>
        <p>Dear Valued Customer,</p>
        <p>Thank you for your quote request. We have received your inquiry and assigned it reference number <strong>${rfqNumber}</strong>.</p>
        <p>Our team is currently reviewing your requirements and will get back to you shortly with a detailed quotation.</p>
        <p>If you have any additional information or questions, please don't hesitate to reach out.</p>
        <p>Best regards,<br/>
        <strong>Panna</strong><br/>
        OptiBio Supplements<br/>
        Nutraceutical Brokerage & Consulting</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;"/>
        <p style="font-size: 12px; color: #6b7280;">This is an automated confirmation. Please do not reply to this email.</p>
      </div>
    `,
  };

  try {
    await mg.messages.create(MAILGUN_DOMAIN, messageData);
    console.log(`Confirmation email sent to ${customerEmail} for ${rfqNumber}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return { success: false, error: String(error) };
  }
}

