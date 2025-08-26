// publisher.ts - Test script to publish different types of messages
import 'dotenv/config';
import amqp from 'amqplib';

interface OrderItem {
  name: string;
  quantity: number;
  price: string | number;
}

interface OrderConfirmationData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  total: string;
  items: OrderItem[];
  orderDate: string;
  estimatedDelivery: string;
}

interface EmailOnlyOrderData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  items: OrderItem[];
  status: string;
}

interface SMSOnlyOrderData {
  orderId: string;
  customerName: string;
  customerPhone: string;
  total: string;
  items: OrderItem[];
}

interface OutForDeliveryData {
  orderId: string;
  customerName: string;
  customerPhone: string;
  trackingNumber: string;
  estimatedDelivery: string;
  carrier: string;
}

interface GenericSMSData {
  to: string;
  message: string;
  from: string;
}

type MessageData = OrderConfirmationData | EmailOnlyOrderData | SMSOnlyOrderData | OutForDeliveryData | GenericSMSData;

interface TestData {
  orderConfirmation: OrderConfirmationData;
  emailOnlyOrder: EmailOnlyOrderData;
  smsOnlyOrder: SMSOnlyOrderData;
  outForDelivery: OutForDeliveryData;
  genericSMS: GenericSMSData;
}

const QUEUES = {
  ORDER_CONFIRMED: 'order.confirmed',
  ORDER_OUT_FOR_DELIVERY: 'order.out-for-delivery',
  GENERIC_SMS: 'generic.sms',
  ORDER_CONFIRMATION_EMAIL: 'order.confirmation.email',
  ORDER_CONFIRMATION_SMS: 'order.confirmation.sms'
} as const;

type QueueName = typeof QUEUES[keyof typeof QUEUES];

async function publishMessage(queueName: QueueName, messageData: MessageData): Promise<void> {
  let connection;
  let channel;
  
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Failed to publish to ${queueName}:`, errorMessage);
  } finally {
    // Clean up connections
    if (channel) await channel.close();
    if (connection) await connection.close();
  }
}

// Test data generators
const testData: TestData = {
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
async function testOrderConfirmation(): Promise<void> {
  console.log('🛍️ Testing Order Confirmation (Email + SMS)...');
  await publishMessage(QUEUES.ORDER_CONFIRMED, testData.orderConfirmation);
}

async function testEmailOnlyConfirmation(): Promise<void> {
  console.log('📧 Testing Email-Only Order Confirmation...');
  await publishMessage(QUEUES.ORDER_CONFIRMATION_EMAIL, testData.emailOnlyOrder);
}

async function testSMSOnlyConfirmation(): Promise<void> {
  console.log('📱 Testing SMS-Only Order Confirmation...');
  await publishMessage(QUEUES.ORDER_CONFIRMATION_SMS, testData.smsOnlyOrder);
}

async function testOutForDelivery(): Promise<void> {
  console.log('🚚 Testing Out for Delivery Notification...');
  await publishMessage(QUEUES.ORDER_OUT_FOR_DELIVERY, testData.outForDelivery);
}

async function testGenericSMS(): Promise<void> {
  console.log('📲 Testing Generic SMS...');
  await publishMessage(QUEUES.GENERIC_SMS, testData.genericSMS);
}

// Main test function
async function runAllTests(): Promise<void> {
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
      await new Promise<void>(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log('\n🎉 All test messages published!');
  console.log('💡 Check your consumer service logs to see the processing.');
}

type QueueType = 'order' | 'email' | 'sms' | 'delivery' | 'generic';

// Command line interface
async function main(): Promise<void> {
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
        console.log('📖 Usage: npm run dev [command]');
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
async function sendRabbitMessages(messageCount: number = 1, queueType: QueueType = 'order', messageData: MessageData): Promise<void> {
  console.log(`Starting message send: ${messageCount} messages to ${queueType} queue`);

  const queueMap: Record<QueueType, QueueName> = {
    'order': QUEUES.ORDER_CONFIRMED,
    'email': QUEUES.ORDER_CONFIRMATION_EMAIL,
    'sms': QUEUES.ORDER_CONFIRMATION_SMS,
    'delivery': QUEUES.ORDER_OUT_FOR_DELIVERY,
    'generic': QUEUES.GENERIC_SMS
  };
  
  const selectedQueue = queueMap[queueType];
  const baseData = messageData;

  if (!selectedQueue) {
    console.error('❌ Invalid queue type');
    return;
  }
  
  for (let i = 0; i < messageCount; i++) {
    // Create unique data for each message
    const messageData: MessageData & { timestamp?: string } = {
      ...baseData,
      timestamp: new Date().toISOString()
    };

    // Add unique orderId if the message has one
    if ('orderId' in messageData && messageData.orderId) {
      messageData.orderId = `${messageData.orderId}-${i}`;
    }
    
    await publishMessage(selectedQueue, messageData);
    
    // Small delay to avoid overwhelming the queue
    await new Promise<void>(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`✅ Message sent completed: ${messageCount} messages sent`);
}

export {
  MessageData,
  OrderItem,
  publishMessage, 
  testData, 
  QUEUES,
  runAllTests,
  sendRabbitMessages
};