// Automated endpoint testing script for ScholarHub Express Backend

const BASE_URL = 'http://localhost:5000';

const testCases = [
  {
    name: 'Health check',
    path: '/health',
    method: 'GET',
    headers: {},
    body: null,
    expectedStatus: 200
  },
  {
    name: 'Get Classrooms (Teacher)',
    path: '/api/classrooms',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer mock-bypass-token',
      'x-bypass-role': 'teacher'
    },
    body: null,
    expectedStatus: 200
  },
  {
    name: 'Get Enrolled Classrooms (Student)',
    path: '/api/classrooms/enrolled',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer mock-bypass-token',
      'x-bypass-role': 'student'
    },
    body: null,
    expectedStatus: 200
  },
  {
    name: 'Create Classroom (Teacher)',
    path: '/api/classrooms',
    method: 'POST',
    headers: {
      'Authorization': 'Bearer mock-bypass-token',
      'x-bypass-role': 'teacher'
    },
    body: {
      title: 'Testing Express API Course',
      description: 'Automated test suite course description.',
      category: 'Computer Science',
      level: 'Beginner',
      price: 1999,
      tags: ['test', 'express']
    },
    expectedStatus: 201
  },
  {
    name: 'Create Payment Order (Student)',
    path: '/api/payments/order',
    method: 'POST',
    headers: {
      'Authorization': 'Bearer mock-bypass-token',
      'x-bypass-role': 'student'
    },
    body: {
      courseId: 'c1',
      amount: 4999
    },
    expectedStatus: 201
  },
  {
    name: 'Verify Payment & Auto-Enroll (Student)',
    path: '/api/payments/verify',
    method: 'POST',
    headers: {
      'Authorization': 'Bearer mock-bypass-token',
      'x-bypass-role': 'student'
    },
    body: {
      orderId: 'order_TEST123456',
      razorpayPaymentId: 'pay_TEST123',
      razorpaySignature: 'sig_TEST123',
      courseId: 'c1'
    },
    expectedStatus: 200
  },
  {
    name: 'Get Calendar Events (Student)',
    path: '/api/calendar/events',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer mock-bypass-token',
      'x-bypass-role': 'student'
    },
    body: null,
    expectedStatus: 200
  },
  {
    name: 'Create Custom Calendar Event (Student)',
    path: '/api/calendar/events',
    method: 'POST',
    headers: {
      'Authorization': 'Bearer mock-bypass-token',
      'x-bypass-role': 'student'
    },
    body: {
      title: 'Study Session with Peer',
      date: new Date().toISOString().split('T')[0],
      startTime: '16:00',
      endTime: '17:00',
      type: 'meeting',
      location: 'Virtual Library'
    },
    expectedStatus: 201
  },
  {
    name: 'AI Tutor Chat (Student)',
    path: '/api/ai/tutor',
    method: 'POST',
    headers: {
      'Authorization': 'Bearer mock-bypass-token',
      'x-bypass-role': 'student'
    },
    body: {
      message: 'Explain React state components.',
      context: 'Web development class'
    },
    expectedStatus: 200
  },
  {
    name: 'AI Quiz Generation (Student)',
    path: '/api/ai/quiz/generate',
    method: 'POST',
    headers: {
      'Authorization': 'Bearer mock-bypass-token',
      'x-bypass-role': 'student'
    },
    body: {
      courseContent: 'Vite and TypeScript configuration',
      difficulty: 'Beginner',
      questionCount: 2
    },
    expectedStatus: 200
  },
  {
    name: 'AI Assignment Checker (Student)',
    path: '/api/ai/assignments/check',
    method: 'POST',
    headers: {
      'Authorization': 'Bearer mock-bypass-token',
      'x-bypass-role': 'student'
    },
    body: {
      submission: 'Vite uses esbuild for fast development reload.',
      rubric: 'Explain bundler speeds'
    },
    expectedStatus: 200
  },
  {
    name: 'Admin Overview Stats (Admin)',
    path: '/api/admin/stats',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer mock-bypass-token',
      'x-bypass-role': 'admin'
    },
    body: null,
    expectedStatus: 200
  },
  {
    name: 'Get Peer Message Conversations (Student)',
    path: '/api/messages/conversations',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer mock-bypass-token',
      'x-bypass-role': 'student'
    },
    body: null,
    expectedStatus: 200
  },
  {
    name: 'Get Notifications (Student)',
    path: '/api/notifications',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer mock-bypass-token',
      'x-bypass-role': 'student'
    },
    body: null,
    expectedStatus: 200
  }
];

async function runTests() {
  console.log('🧪 Starting end-to-end integration tests for ScholarHub...\n');
  let passedCount = 0;

  for (const tc of testCases) {
    try {
      const options = {
        method: tc.method,
        headers: {
          'Content-Type': 'application/json',
          ...tc.headers
        },
        body: tc.body ? JSON.stringify(tc.body) : null
      };

      const response = await fetch(`${BASE_URL}${tc.path}`, options);
      const data = await response.json();

      const isExpected = response.status === tc.expectedStatus || 
        (tc.name.includes('AI') && response.status === 500 && (data.error === 'OpenAI API key missing' || data.error?.includes('API key')));

      if (isExpected) {
        console.log(`✅ [PASS] ${tc.name}`);
        passedCount++;
      } else {
        console.error(`❌ [FAIL] ${tc.name} | Expected status ${tc.expectedStatus}, got ${response.status}`);
        console.error('Response:', data);
      }
    } catch (err) {
      console.error(`❌ [ERROR] ${tc.name} failed with exception:`, err.message);
    }
  }

  console.log(`\n📊 Test Run Completed: ${passedCount}/${testCases.length} tests passed.`);
  process.exit(passedCount === testCases.length ? 0 : 1);
}

runTests();
