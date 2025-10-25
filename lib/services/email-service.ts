import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendConfirmationEmail(
  customerEmail: string,
  rfqNumber: string
) {
  const msg = {
    to: customerEmail,
    from: process.env.BUSINESS_EMAIL || 'quotes@optibiosupplements.com',
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
    await sgMail.send(msg);
    console.log(`Confirmation email sent to ${customerEmail} for ${rfqNumber}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    throw error;
  }
}

