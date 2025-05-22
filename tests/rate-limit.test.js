import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const perSecondErrors = new Rate('per_second_errors');
const perMinuteErrors = new Rate('per_minute_errors');
const per15MinErrors = new Rate('per_15min_errors');

// Test configuration
export const options = {
  scenarios: {
    // Test 1: Per-second rate limit (3 requests/second)
    per_second_limit: {
      executor: 'constant-arrival-rate',
      rate: 5, // Try to send 5 requests per second (should trigger rate limit)
      timeUnit: '1s',
      duration: '10s',
      preAllocatedVUs: 5,
      maxVUs: 10,
    },
    // Test 2: Per-minute rate limit (50 requests/minute)
    per_minute_limit: {
      executor: 'constant-arrival-rate',
      rate: 60, // Try to send 60 requests per minute (should trigger rate limit)
      timeUnit: '1m',
      duration: '2m',
      preAllocatedVUs: 10,
      maxVUs: 15,
      startTime: '10s',
    },
    // Test 3: 15-minute rate limit (300 requests/15min)
    per_15min_limit: {
      executor: 'constant-arrival-rate',
      rate: 400, // Try to send 400 requests per 15 minutes (should trigger rate limit)
      timeUnit: '15m',
      duration: '30m',
      preAllocatedVUs: 15,
      maxVUs: 20,
      startTime: '2m10s',
    },
  },
};

// Simulated user ID (should be a valid Telegram user ID for testing)
const TEST_USER_ID = '123456789';

// Helper function to make a request to the bot
function makeBotRequest() {
  const payload = {
    message: {
      from: { id: TEST_USER_ID },
      text: '/start',
      chat: { id: TEST_USER_ID },
    },
  };

  const headers = {
    'Content-Type': 'application/json',
  };

  const response = http.post(
    'http://localhost:3000/webhook', // Update with your bot's webhook URL
    JSON.stringify(payload),
    { headers }
  );

  return response;
}

// Main test function
export default function () {
  const response = makeBotRequest();

  // Check response and update metrics
  check(response, {
    'status is 200 or 429': (r) => r.status === 200 || r.status === 429,
  });

  if (response.status === 429) {
    const retryAfter = Number(response.headers['Retry-After'] || 0);
    
    // Determine which rate limit was hit based on retry time
    if (retryAfter <= 1) {
      perSecondErrors.add(1);
    } else if (retryAfter <= 60) {
      perMinuteErrors.add(1);
    } else {
      per15MinErrors.add(1);
    }

    // Wait for the suggested retry time
    sleep(retryAfter);
  } else {
    // Small delay between successful requests
    sleep(0.1);
  }
}

// Test summary
export function handleSummary(data) {
  return {
    'stdout': JSON.stringify({
      'per_second_rate_limit_errors': perSecondErrors.value,
      'per_minute_rate_limit_errors': perMinuteErrors.value,
      'per_15min_rate_limit_errors': per15MinErrors.value,
      'scenarios': data.scenarios,
    }, null, 2),
  };
} 