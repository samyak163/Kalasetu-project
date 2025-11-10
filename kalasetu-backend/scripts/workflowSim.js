import axios from 'axios';
import readline from 'readline';

const BASE_URL = process.env.WORKFLOW_BASE_URL || 'http://localhost:5000';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const createClient = () => {
  const instance = axios.create({ baseURL: BASE_URL, withCredentials: true });
  let cookie = '';
  instance.interceptors.response.use((response) => {
    const setCookie = response.headers['set-cookie'];
    if (setCookie && setCookie.length) {
      cookie = setCookie.map((c) => c.split(';')[0]).join('; ');
    }
    return response;
  });
  instance.interceptors.request.use((config) => {
    if (cookie) {
      config.headers.Cookie = cookie;
    }
    return config;
  });
  return instance;
};

const pause = (message) => new Promise((resolve) => rl.question(`${message}\nPress Enter to continue...`, resolve));

async function runWorkflow() {
  console.log('🚀 KalaSetu Workflow Simulation');
  console.log(`Using backend: ${BASE_URL}`);

  const timestamp = Date.now();
  const artisanEmail = `artisan${timestamp}@example.com`;
  const userEmail = `user${timestamp}@example.com`;
  const password = 'Workflow@123';

  const artisanClient = createClient();
  const userClient = createClient();

  try {
    console.log('\n1️⃣ Register artisan');
    await artisanClient.post('/api/auth/register', {
      fullName: 'Workflow Artisan',
      email: artisanEmail,
      password,
    });
    console.log(`   ✔ Artisan registered (${artisanEmail})`);

    console.log('2️⃣ Register customer');
    await userClient.post('/api/users/register', {
      fullName: 'Workflow Customer',
      email: userEmail,
      password,
    });
    console.log(`   ✔ Customer registered (${userEmail})`);

    console.log('3️⃣ Artisan creates a service');
    const categoriesRes = await artisanClient.get('/api/categories');
    const categoryId = categoriesRes.data?.data?.[0]?._id;
    if (!categoryId) throw new Error('No categories available. Seed core data first.');
    await artisanClient.post('/api/services', {
      categoryId,
      name: 'Workflow Consultation',
      description: 'A sample service created by the workflow script.',
      price: 500,
      durationMinutes: 45,
    });
    console.log('   ✔ Service created');

    console.log('4️⃣ Customer books the service');
    const artisans = await userClient.get('/api/artisans', { params: { limit: 1 } });
    const artisan = artisans.data?.artisans?.[0];
    if (!artisan) throw new Error('No artisans available for booking');
    const start = new Date(Date.now() + 3600_000);
    const end = new Date(start.getTime() + 45 * 60_000);
    const bookingRes = await userClient.post('/api/bookings', {
      artisan: artisan._id,
      start,
      end,
      notes: 'Workflow test booking',
      price: 500,
    });
    const bookingId = bookingRes.data?.data?._id;
    console.log(`   ✔ Booking created (id: ${bookingId})`);

    console.log('5️⃣ Artisan accepts the booking');
    await artisanClient.patch(`/api/bookings/${bookingId}/respond`, { action: 'accept' });
    console.log('   ✔ Booking accepted');

    console.log('6️⃣ Workflow complete. Check the dashboard and booking tabs for updates.');
  } catch (error) {
    console.error('❌ Workflow failed:', error.response?.data || error.message);
  } finally {
    rl.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runWorkflow();
}
