import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as https from 'https';

@Injectable()
export class EmailService {
  constructor(private configService: ConfigService) {
    const key = process.env.BREVO_API_KEY || this.configService.get('BREVO_API_KEY');
    console.log(`[Email] Service initialized. BREVO_API_KEY ${key ? `present (${key.substring(0, 12)}...)` : 'NOT SET'}`);
  }

  private async send(to: string, subject: string, html: string) {
    const apiKey = process.env.BREVO_API_KEY || this.configService.get('BREVO_API_KEY');

    if (!apiKey) {
      console.warn(`[Email] BREVO_API_KEY not set. Would have sent to ${to}: ${subject}`);
      return;
    }

    const senderEmail = process.env.SMTP_USER || this.configService.get('SMTP_USER') || 'dazzlewheels9@gmail.com';

    const payload = JSON.stringify({
      sender: { name: 'Dazzle Wheels', email: senderEmail },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    });

    return new Promise<void>((resolve) => {
      const req = https.request(
        {
          hostname: 'api.brevo.com',
          path: '/v3/smtp/email',
          method: 'POST',
          headers: {
            'api-key': apiKey,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
          },
        },
        (res) => {
          let body = '';
          res.on('data', (chunk) => (body += chunk));
          res.on('end', () => {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              console.log(`[Email] ✅ Sent to ${to}: ${subject}`);
            } else {
              console.error(`[Email] ❌ Failed to send to ${to}: HTTP ${res.statusCode} ${body}`);
            }
            resolve();
          });
        },
      );
      req.on('error', (err) => {
        console.error(`[Email] Request error sending to ${to}:`, err.message);
        resolve();
      });
      req.setTimeout(15000, () => {
        console.error(`[Email] Timeout sending to ${to}`);
        req.destroy();
        resolve();
      });
      req.write(payload);
      req.end();
    });
  }

  private baseTemplate(title: string, body: string): string {
    return `<!DOCTYPE html><html><head><meta charset="utf-8">
    <style>
      body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0}
      .wrap{max-width:600px;margin:30px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1)}
      .header{background:linear-gradient(135deg,#6d28d9,#4f46e5);color:#fff;padding:28px 24px;text-align:center}
      .header h1{margin:0;font-size:22px}
      .body{padding:24px}
      .info-box{background:#f8f7ff;border-left:4px solid #6d28d9;padding:16px;border-radius:4px;margin:16px 0}
      .info-box p{margin:6px 0;font-size:14px}
      .footer{text-align:center;padding:16px;font-size:12px;color:#888;border-top:1px solid #eee}
    </style></head><body>
    <div class="wrap">
      <div class="header"><h1>Dazzle Wheels</h1><p style="margin:4px 0;opacity:.9">${title}</p></div>
      <div class="body">${body}</div>
      <div class="footer"><p>&copy; 2024 Dazzle Wheels &bull; Ground floor building no /flat no 14/2 muneshwara layout road tumkur road totadaguddadahalli anche palya bengaluru madanayakanahalli 560073</p><p>+91 9972427475 &bull; dazzlewheels9@gmail.com</p></div>
    </div></body></html>`;
  }

  private bookingInfoBox(booking: any): string {
    return `<div class="info-box">
      <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
      <p><strong>Car:</strong> ${booking.car?.name || 'N/A'} (${booking.car?.brand || ''})</p>
      <p><strong>Pickup:</strong> ${booking.pickupTime ? new Date(booking.pickupTime).toLocaleString('en-IN') : 'N/A'}</p>
      <p><strong>Drop:</strong> ${booking.dropTime ? new Date(booking.dropTime).toLocaleString('en-IN') : 'N/A'}</p>
      <p><strong>Amount:</strong> Rs.${Number(booking.totalPrice || 0).toLocaleString('en-IN')}</p>
    </div>`;
  }

  async sendBookingSubmitted(booking: any) {
    if (!booking.user?.email) return;
    const body = `<p>Dear ${booking.user.name || 'Customer'},</p>
      <p>Your booking request has been received. Our team will review your driving license and confirm shortly.</p>
      ${this.bookingInfoBox(booking)}
      <p>You will receive another email once your booking is approved.</p>
      <p>Thank you for choosing Dazzle Wheels!</p>`;
    await this.send(booking.user.email, `Booking Request Received - ${booking.bookingId}`, this.baseTemplate('Booking Request Received', body));
  }

  async sendBookingApproved(booking: any) {
    const toEmail = booking.user?.email || booking.userEmail;
    const toName = booking.user?.name || booking.userName || 'Customer';
    if (!toEmail) {
      console.warn('[Email] sendBookingApproved: no email address found for booking', booking.bookingId);
      return;
    }
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const body = `<p>Dear ${toName},</p>
      <p>Great news! Your booking has been <strong style="color:#16a34a">approved</strong>. Please complete the payment to confirm your booking.</p>
      ${this.bookingInfoBox(booking)}
      <p>Log in to your dashboard and click <strong>Pay Now</strong> to complete your booking.</p>
      <a href="${frontendUrl}/dashboard" style="display:inline-block;padding:12px 28px;background:#6d28d9;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;margin-top:16px">Go to Dashboard</a>`;
    await this.send(toEmail, `Booking Approved - Complete Payment | ${booking.bookingId}`, this.baseTemplate('Booking Approved!', body));
  }

  async sendBookingRejected(booking: any) {
    const toEmail = booking.user?.email || booking.userEmail;
    const toName = booking.user?.name || booking.userName || 'Customer';
    if (!toEmail) {
      console.warn('[Email] sendBookingRejected: no email address found for booking', booking.bookingId);
      return;
    }
    const body = `<p>Dear ${toName},</p>
      <p>We regret to inform you that your booking request has been <strong style="color:#dc2626">rejected</strong>.</p>
      ${this.bookingInfoBox(booking)}
      <p>This may be due to an issue with your driving license or car availability. Please contact us for more information.</p>
      <p>+91 9972427475 &bull; dazzlewheels9@gmail.com</p>`;
    await this.send(toEmail, `Booking Rejected - ${booking.bookingId}`, this.baseTemplate('Booking Rejected', body));
  }

  async sendPaymentSuccess(booking: any) {
    if (!booking.user?.email) return;
    const body = `<p>Dear ${booking.user.name || 'Customer'},</p>
      <p>Your payment was successful and your booking is now <strong style="color:#16a34a">CONFIRMED</strong>!</p>
      ${this.bookingInfoBox(booking)}
      <p>Please carry a valid ID proof at the time of pickup.</p>
      <p>For any queries: +91 9972427475 &bull; dazzlewheels9@gmail.com</p>
      <p>Thank you for choosing Dazzle Wheels. Enjoy your ride!</p>`;
    await this.send(booking.user.email, `Booking Confirmed - ${booking.bookingId}`, this.baseTemplate('Booking Confirmed!', body));
  }

  async sendBookingConfirmation(booking: any) {
    return this.sendPaymentSuccess(booking);
  }
}
