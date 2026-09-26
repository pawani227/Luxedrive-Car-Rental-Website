import nodemailer from 'nodemailer';

/**
 * Creates a nodemailer transporter using Gmail SMTP.
 * Requires EMAIL_USER and EMAIL_PASS in backend/.env
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS  // Gmail App Password (not your account password)
    }
  });
};

/**
 * Send a booking approval email to the customer.
 * @param {string} customerEmail
 * @param {string} customerName
 * @param {Object} bookingDetails - { vehicle, startDate, endDate, totalDays, totalPrice }
 */
export const sendBookingApprovalEmail = async (customerEmail, customerName, bookingDetails) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  Email credentials not configured. Skipping approval email.');
    return;
  }

  const { vehicle, startDate, pickupTime, endDate, returnTime, totalDays, totalPrice } = bookingDetails;
  const vehicleName = vehicle ? `${vehicle.brand} ${vehicle.model}` : 'your booked vehicle';

  const transporter = createTransporter();

  const mailOptions = {
    from: `"LuxeDrive 🚗" <${process.env.EMAIL_USER}>`,
    to: customerEmail,
    subject: '✅ Your Booking has been Approved! — LuxeDrive',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
        <div style="max-width:600px;margin:40px auto;background:white;border-radius:20px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:40px 30px;text-align:center;">
            <h1 style="color:white;margin:0;font-size:2rem;font-weight:800;">🚗 LuxeDrive</h1>
            <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:1rem;">Premium Car Rental Service</p>
          </div>

          <!-- Success Banner -->
          <div style="background:#d1fae5;border-left:5px solid #10b981;padding:20px 30px;margin:0;">
            <p style="color:#065f46;font-size:1.1rem;font-weight:700;margin:0;">
              ✅ Your Booking has been Approved!
            </p>
          </div>

          <!-- Body -->
          <div style="padding:35px 30px;">
            <p style="color:#1e293b;font-size:1.05rem;margin-bottom:25px;">
              Dear <strong>${customerName}</strong>,
            </p>
            <p style="color:#475569;line-height:1.7;margin-bottom:25px;">
              Great news! Your booking request has been <strong style="color:#10b981;">approved</strong> by our admin team.
              Your vehicle is now confirmed and ready for your trip. Please find your booking details below.
            </p>

            <!-- Booking Details Box -->
            <div style="background:#f8fafc;border-radius:14px;padding:25px;border:1px solid #e2e8f0;margin-bottom:25px;">
              <h3 style="color:#1e293b;margin:0 0 18px;font-size:1.1rem;font-weight:700;border-bottom:2px solid #e2e8f0;padding-bottom:12px;">
                📋 Booking Details
              </h3>
              <table style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="padding:8px 0;color:#64748b;font-size:0.9rem;width:45%;">Vehicle</td>
                  <td style="padding:8px 0;color:#1e293b;font-weight:600;">${vehicleName}</td>
                </tr>
                <tr style="background:#f1f5f9;border-radius:8px;">
                  <td style="padding:8px 10px;color:#64748b;font-size:0.9rem;">Pickup Date & Time</td>
                  <td style="padding:8px 10px;color:#1e293b;font-weight:600;">${startDate ? new Date(startDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—'} at ${pickupTime || '10:00'}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#64748b;font-size:0.9rem;">Return Date & Time</td>
                  <td style="padding:8px 0;color:#1e293b;font-weight:600;">${endDate ? new Date(endDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—'} at ${returnTime || '10:00'}</td>
                </tr>
                <tr style="background:#f1f5f9;">
                  <td style="padding:8px 10px;color:#64748b;font-size:0.9rem;">Total Days</td>
                  <td style="padding:8px 10px;color:#1e293b;font-weight:600;">${totalDays || '—'} day(s)</td>
                </tr>
                <tr>
                  <td style="padding:12px 0 4px;color:#64748b;font-size:0.9rem;">Total Amount</td>
                  <td style="padding:12px 0 4px;color:#6366f1;font-weight:800;font-size:1.2rem;">LKR ${totalPrice ? Number(totalPrice).toLocaleString() : '—'}</td>
                </tr>
              </table>
            </div>

            <p style="color:#475569;line-height:1.7;margin-bottom:8px;">
              Please be ready at your specified pickup location on time. If you have any questions,
              feel free to contact our support team.
            </p>
          </div>

          <!-- Footer -->
          <div style="background:#f8fafc;padding:25px 30px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="color:#94a3b8;font-size:0.85rem;margin:0;">
              © ${new Date().getFullYear()} LuxeDrive — Premium Car Rental Service
            </p>
            <p style="color:#94a3b8;font-size:0.8rem;margin:6px 0 0;">
              This is an automated email. Please do not reply.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Approval email sent to ${customerEmail} — MessageId: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`❌ Failed to send approval email to ${customerEmail}:`, err.message);
    // Don't throw — email failure should not break the booking approval
  }
};
