const axios = require('axios');

async function testApp() {
  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true
  });

  try {
    console.log('1. Testing Login...');
    let cookie = '';
    
    // Login
    const loginRes = await api.post('/auth/login', {
      email: 'client@example.com',
      password: 'Secret@123'
    });
    console.log('Login successful:', loginRes.data.user.email);
    
    // Get cookies manually since axios doesn't store them in node environment automatically without tough-cookie
    cookie = loginRes.headers['set-cookie'][0];
    
    console.log('\n2. Testing Get Profile...');
    const profileRes = await api.get('/auth/me', { headers: { Cookie: cookie } });
    console.log('Profile fetched:', profileRes.data.user.name);

    console.log('\n3. Testing Form Creation...');
    const createRes = await api.post('/forms', {
      formType: 'MARATHI',
      language: 'MR',
      status: 'DRAFT',
      formData: {
        customerName: 'Test Customer',
        totalPlotAmount: '1000000',
        payments: []
      }
    }, { headers: { Cookie: cookie } });
    const formId = createRes.data.form._id;
    console.log('Form created with ID:', formId);

    console.log('\n4. Testing Forms List...');
    const listRes = await api.get('/forms', { headers: { Cookie: cookie } });
    console.log('Forms count:', listRes.data.forms.length);

    console.log('\n5. Testing Security Audit Log...');
    const auditRes = await api.get('/security/logs', { headers: { Cookie: cookie } });
    console.log('Audit events recorded:', auditRes.data.logs.map(l => l.event).join(', '));

    console.log('\n✅ All tests passed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testApp();
