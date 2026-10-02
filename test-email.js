const nodemailer = require('./backend/node_modules/nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  connectionTimeout: 10000,
  auth: { user: 'techboomblr@gmail.com', pass: 'bgga pfpd vqdj ornz' }
});

transporter.sendMail({
  from: '"Dazzle Wheels" <techboomblr@gmail.com>',
  to: 'naveenagowda09@gmail.com',
  subject: 'Test - Booking Approved by Admin',
  html: '<h2 style="color:#6d28d9">Your booking has been APPROVED!</h2><p>This is a test email from Dazzle Wheels. If you received this, email is working correctly.</p><p>Please complete payment from your dashboard.</p>'
}, (err, info) => {
  if (err) {
    console.log('SMTP FAILED:', err.message);
    console.log('Full error:', err.code, err.response);
  } else {
    console.log('EMAIL SENT OK:', info.messageId);
    console.log('Accepted:', info.accepted);
  }
});
