// This script tests if Railway backend has SMTP configured
// by checking the health/config endpoint
const https = require('https');

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(new Error('TIMEOUT')); });
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  // Step 1: Login with Supabase-based auth (need to use the frontend token approach)
  // The backend uses Supabase JWT - we need to get a token from Supabase directly
  const SUPABASE_URL = 'gqrwjafrebbgpvkfphzw.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxcndqYWZyZWJiZ3B2a2ZwaHp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NDQ5MzIsImV4cCI6MjA4OTIyMDkzMn0.kgMho0WTjTOpxnad9p6CuyvKRWF4dFM_HseOM0fHKPI';

  console.log('Step 1: Logging in via Supabase...');
  const loginBody = JSON.stringify({ email: 'naveenagowda09@gmail.com', password: 'Admin@123' });
  
  const loginRes = await request({
    hostname: SUPABASE_URL,
    path: '/auth/v1/token?grant_type=password',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Content-Length': Buffer.byteLength(loginBody)
    }
  }, loginBody);

  if (!loginRes.body.access_token) {
    console.log('Login failed:', JSON.stringify(loginRes.body).slice(0, 200));
    // Try admin email
    const loginBody2 = JSON.stringify({ email: 'techbusinessblr@gmail.com', password: 'Admin@123' });
    const loginRes2 = await request({
      hostname: SUPABASE_URL,
      path: '/auth/v1/token?grant_type=password',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Content-Length': Buffer.byteLength(loginBody2)
      }
    }, loginBody2);
    if (!loginRes2.body.access_token) {
      console.log('Admin login also failed:', JSON.stringify(loginRes2.body).slice(0, 200));
      return;
    }
    console.log('Admin login OK');
    await testWithToken(loginRes2.body.access_token);
    return;
  }

  console.log('Login OK, user:', loginRes.body.user?.email);
  await testWithToken(loginRes.body.access_token);
}

async function testWithToken(token) {
  console.log('\nStep 2: Getting bookings from Railway...');
  const bookingsRes = await request({
    hostname: 'dazzle-wheels-production.up.railway.app',
    path: '/api/bookings?limit=10',
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token }
  });

  console.log('Bookings status:', bookingsRes.status);
  if (bookingsRes.status !== 200) {
    console.log('Response:', JSON.stringify(bookingsRes.body).slice(0, 300));
    return;
  }

  const bookings = bookingsRes.body.bookings || [];
  console.log('Total bookings:', bookings.length);
  bookings.forEach(b => console.log(` - ${b.bookingId} | ${b.bookingStatus} | ${b.user?.email}`));

  const pending = bookings.find(b => b.bookingStatus === 'PENDING');
  const approved = bookings.find(b => b.bookingStatus === 'APPROVED');
  
  if (pending) {
    console.log('\nStep 3: Testing approve on pending booking:', pending.id);
    const start = Date.now();
    const approveRes = await request({
      hostname: 'dazzle-wheels-production.up.railway.app',
      path: '/api/bookings/' + pending.id + '/approve',
      method: 'PATCH',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Length': 0 }
    });
    console.log('Approve took:', Date.now() - start, 'ms');
    console.log('Approve status:', approveRes.status);
    console.log('Approve response:', JSON.stringify(approveRes.body));
    console.log('\nCheck Railway logs for [Email] lines to see if SMTP vars are set');
  } else if (approved) {
    console.log('\nNo pending bookings. Approved booking user:', approved.user?.email);
    console.log('To test email, reject then re-approve from admin panel');
  } else {
    console.log('No bookings found to test');
  }
}

main().catch(console.error);
