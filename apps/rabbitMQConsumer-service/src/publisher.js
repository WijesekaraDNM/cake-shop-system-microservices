// publisher.js - Test script to publish different types of messages
require('dotenv').config();
const amqp = require('amqplib');

const QUEUES = {
  ORDER_CONFIRMED: 'order.confirmed',
  ORDER_OUT_FOR_DELIVERY: 'order.out-for-delivery',
  GENERIC_SMS: 'generic.sms',
  ORDER_CONFIRMATION_EMAIL: 'order.confirmation.email',
  ORDER_CONFIRMATION_SMS: 'order.confirmation.sms'
};

async function publishMessage(queueName, messageData) {
  let connection, channel;
  
  try {
    // Connect to RabbitMQ
    connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
    channel = await connection.createChannel();
    
    // Ensure queue exists
    await channel.assertQueue(queueName, { 
      durable: true,
      arguments: {
        'x-dead-letter-exchange': 'dlx',
        'x-dead-letter-routing-key': 'failed'
      }
    });
    
    // Publish message
    const message = Buffer.from(JSON.stringify(messageData));
    channel.sendToQueue(queueName, message, { persistent: true });
    
    console.log(`✅ Published to ${queueName}:`, messageData);
    
  } catch (error) {
    console.error(`❌ Failed to publish to ${queueName}:`, error.message);
  } finally {
    // Clean up connections
    if (channel) await channel.close();
    if (connection) await connection.close();
  }
}

// Test data generators
const testData = {
  // Order confirmation data (for combined email + SMS)
  orderConfirmation: {
    orderId: 'ORD-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
    customerName: 'John Doe',
    customerEmail: 'john.doe@example.com',
    customerPhone: '+1234567890',
    total: (Math.random() * 200 + 50).toFixed(2),
    items: [
      { name: 'Product A', quantity: 2, price: '29.99' },
      { name: 'Product B', quantity: 1, price: '49.99' }
    ],
    orderDate: new Date().toISOString(),
    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  
  // Email-only order confirmation
  emailOnlyOrder: {
    orderId: 'ORD-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
    customerName: 'Masha',
    customerEmail: 'masha.wijesekara@gmail.com',
    totalAmount: 149.99,
    items: [
      { name: 'Premium Widget', quantity: 1, price: 149.99 }
    ],
    status: "Pending"
  },
  
  // SMS-only order confirmation
  smsOnlyOrder: {
    orderId: 'ORD-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
    customerName: 'Bob Wilson',
    customerPhone: '+1987654321',
    total: '75.50',
    items: [
      { name: 'Basic Widget', quantity: 3, price: '25.17' }
    ]
  },
  
  // Out for delivery notification
  outForDelivery: {
    orderId: 'ORD-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
    customerName: 'Alice Johnson',
    customerPhone: '+1555123456',
    trackingNumber: 'TRK-' + Math.random().toString(36).substr(2, 10).toUpperCase(),
    estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    carrier: 'FastShip Express'
  },
  
  // Generic SMS
  genericSMS: {
    to: '+1444555666',
    message: 'This is a test generic SMS notification sent at ' + new Date().toLocaleString(),
    from: 'YourBusiness'
  }
};

// Individual test functions
async function testOrderConfirmation() {
  console.log('🛍️ Testing Order Confirmation (Email + SMS)...');
  await publishMessage(QUEUES.ORDER_CONFIRMED, testData.orderConfirmation);
}

async function testEmailOnlyConfirmation() {
  console.log('📧 Testing Email-Only Order Confirmation...');
  await publishMessage(QUEUES.ORDER_CONFIRMATION_EMAIL, testData.emailOnlyOrder);
}

async function testSMSOnlyConfirmation() {
  console.log('📱 Testing SMS-Only Order Confirmation...');
  await publishMessage(QUEUES.ORDER_CONFIRMATION_SMS, testData.smsOnlyOrder);
}

async function testOutForDelivery() {
  console.log('🚚 Testing Out for Delivery Notification...');
  await publishMessage(QUEUES.ORDER_OUT_FOR_DELIVERY, testData.outForDelivery);
}

async function testGenericSMS() {
  console.log('📲 Testing Generic SMS...');
  await publishMessage(QUEUES.GENERIC_SMS, testData.genericSMS);
}

// Main test function
async function runAllTests() {
  console.log('🧪 Starting all notification tests...\n');
  
  const tests = [
    testOrderConfirmation,
    testEmailOnlyConfirmation,
    testSMSOnlyConfirmation,
    testOutForDelivery,
    testGenericSMS
  ];
  
  for (let i = 0; i < tests.length; i++) {
    await tests[i]();
    
    // Wait 3 seconds between tests to see processing in real-time
    if (i < tests.length - 1) {
      console.log('⏳ Waiting 3 seconds before next test...\n');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log('\n🎉 All test messages published!');
  console.log('💡 Check your consumer service logs to see the processing.');
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command || command === 'all') {
    await runAllTests();
  } else {
    switch (command) {
      case 'order':
        await testOrderConfirmation();
        break;
      case 'email':
        await testEmailOnlyConfirmation();
        break;
      case 'sms':
        await testSMSOnlyConfirmation();
        break;
      case 'delivery':
        await testOutForDelivery();
        break;
      case 'generic':
        await testGenericSMS();
        break;
      default:
        console.log('📖 Usage: node publisher.js [command]');
        console.log('   Commands:');
        console.log('   - all (default): Run all tests');
        console.log('   - order: Test order confirmation');
        console.log('   - email: Test email-only confirmation');
        console.log('   - sms: Test SMS-only confirmation');
        console.log('   - delivery: Test out-for-delivery notification');
        console.log('   - generic: Test generic SMS');
        return;
    }
    
    console.log('✅ Test completed!');
  }
  
  process.exit(0);
}

// Bulk testing function for load testing
async function loadTest(messageCount = 10, queueType = 'order') {
  console.log(`🚀 Starting load test: ${messageCount} messages to ${queueType} queue`);
  
  const queueMap = {
    'order': QUEUES.ORDER_CONFIRMED,
    'email': QUEUES.ORDER_CONFIRMATION_EMAIL,
    'sms': QUEUES.ORDER_CONFIRMATION_SMS,
    'delivery': QUEUES.ORDER_OUT_FOR_DELIVERY,
    'generic': QUEUES.GENERIC_SMS
  };
  
  const dataMap = {
    'order': testData.orderConfirmation,
    'email': testData.emailOnlyOrder,
    'sms': testData.smsOnlyOrder,
    'delivery': testData.outForDelivery,
    'generic': testData.genericSMS
  };
  
  const selectedQueue = queueMap[queueType];
  const baseData = dataMap[queueType];
  
  if (!selectedQueue) {
    console.error('❌ Invalid queue type');
    return;
  }
  
  for (let i = 0; i < messageCount; i++) {
    // Create unique data for each message
    const messageData = {
      ...baseData,
      ...(baseData.orderId && { orderId: `${baseData.orderId}-${i}` }),
      timestamp: new Date().toISOString()
    };
    
    await publishMessage(selectedQueue, messageData);
    
    // Small delay to avoid overwhelming the queue
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`✅ Load test completed: ${messageCount} messages sent`);
}

// Check if running load test
if (process.argv.includes('--load-test')) {
  const count = parseInt(process.argv[process.argv.indexOf('--load-test') + 1]) || 10;
  const type = process.argv[process.argv.indexOf('--type') + 1] || 'order';
  loadTest(count, type);
} else if (require.main === module) {
  main();
}

module.exports = { 
  publishMessage, 
  testData, 
  QUEUES,
  runAllTests,
  loadTest 
};