// index.js - RabbitMQ Consumer Service
require('dotenv').config();
const amqp = require('amqplib');
const axios = require('axios');

// Configuration
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5005/api/notifications';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

// Queue configurations
const QUEUES = {
  ORDER_CONFIRMED: 'order.confirmed',
  ORDER_OUT_FOR_DELIVERY: 'order.out-for-delivery',
  GENERIC_SMS: 'generic.sms',
  ORDER_CONFIRMATION_EMAIL: 'order.confirmation.email',
  ORDER_CONFIRMATION_SMS: 'order.confirmation.sms'
};

let connection, channel;

// HTTP client with timeout and retry logic
const httpClient = axios.create({
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add retry logic to HTTP client
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config } = error;
    
    // Retry logic for 5xx errors or network issues
    if (config && !config._retry && (
      error.code === 'ECONNABORTED' ||
      error.code === 'ENOTFOUND' ||
      (error.response && error.response.status >= 500)
    )) {
      config._retry = true;
      console.log(`⚠️ Retrying request to ${config.url}...`);
      
      // Wait 2 seconds before retry
      await new Promise(resolve => setTimeout(resolve, 2000));
      return httpClient(config);
    }
    
    return Promise.reject(error);
  }
);

// Connect to RabbitMQ
async function connectRabbitMQ() {
  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    
    // Assert all queues
    for (const queueName of Object.values(QUEUES)) {
      await channel.assertQueue(queueName, { 
        durable: true,
        arguments: {
          'x-dead-letter-exchange': 'dlx',
          'x-dead-letter-routing-key': 'failed'
        }
      });
    }
    
    // Setup dead letter exchange for failed messages
    await channel.assertExchange('dlx', 'direct', { durable: true });
    await channel.assertQueue('failed-notifications', { durable: true });
    await channel.bindQueue('failed-notifications', 'dlx', 'failed');
    
    console.log('✅ Connected to RabbitMQ and all queues are ready');
    
    // Handle connection errors
    connection.on('error', (err) => {
      console.error('❌ RabbitMQ connection error:', err.message);
    });
    
    connection.on('close', () => {
      console.log('🔌 RabbitMQ connection closed');
      process.exit(1);
    });
    
  } catch (error) {
    console.error('❌ Failed to connect to RabbitMQ:', error.message);
    throw error;
  }
}

// Call notification service API
async function callNotificationAPI(endpoint, data) {
  try {
    const url = `${NOTIFICATION_SERVICE_URL}${endpoint}`;
    console.log(`📞 Calling notification API: ${url}`);
    
    const response = await httpClient.post(url, data);
    console.log(`✅ Notification API call successful: ${response.status}`);
    
    return response.data;
  } catch (error) {
    console.error(`❌ Notification API call failed for ${endpoint}:`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
}

// Message processors for different queue types
const messageProcessors = {
  // Combined email + SMS order confirmation
  [QUEUES.ORDER_CONFIRMED]: async (orderData) => {
    console.log(`🛍️ Processing order confirmation for order: ${orderData.orderId}`);
    return await callNotificationAPI('/order-confirmation', orderData);
  },
  
  // Email-only order confirmation
  [QUEUES.ORDER_CONFIRMATION_EMAIL]: async (orderData) => {
    console.log(`📧 Processing email-only order confirmation for order: ${orderData.orderId}`);
    return await callNotificationAPI('/email/order-confirmation', orderData);
  },

  // SMS-only order confirmation
  [QUEUES.ORDER_CONFIRMATION_SMS]: async (orderData) => {
    console.log(`📱 Processing SMS-only order confirmation for order: ${orderData.orderId}`);
    return await callNotificationAPI('/sms/order-confirmation', orderData);
  },
  
  // Out for delivery SMS
  [QUEUES.ORDER_OUT_FOR_DELIVERY]: async (orderData) => {
    console.log(`🚚 Processing out-for-delivery notification for order: ${orderData.orderId}`);
    return await callNotificationAPI('/sms/out-for-delivery', orderData);
  },
  
  // Generic SMS
  [QUEUES.GENERIC_SMS]: async (smsData) => {
    console.log(`📲 Processing generic SMS to: ${smsData.to}`);
    return await callNotificationAPI('/sms', smsData);
  }
};

// Generic message consumer
async function consumeMessages(queueName, processor) {
  try {
    console.log(`👂 Starting consumer for queue: ${queueName}`);
    
    await channel.consume(queueName, async (message) => {
      if (message) {
        try {
          const messageContent = message.content.toString();
          console.log(`📥 Received message from ${queueName}:`, messageContent);
          
          // Parse message data
          const messageData = JSON.parse(messageContent);
          
          // Process the message using the appropriate processor
          await processor(messageData);
          
          // Acknowledge successful processing
          channel.ack(message);
          console.log(`✅ Successfully processed message from ${queueName}`);
          
        } catch (error) {
          console.error(`❌ Error processing message from ${queueName}:`, error.message);
          
          // Check if this is a retry (you can implement retry count in message properties)
          const retryCount = message.properties.headers?.['x-retry-count'] || 0;
          const maxRetries = 3;
          
          if (retryCount < maxRetries) {
            // Reject and requeue with retry count
            console.log(`🔄 Retrying message (attempt ${retryCount + 1}/${maxRetries})`);
            
            // Republish with updated retry count
            const headers = { ...message.properties.headers, 'x-retry-count': retryCount + 1 };
            channel.sendToQueue(queueName, message.content, { 
              persistent: true, 
              headers 
            });
            
            channel.ack(message);
          } else {
            // Max retries reached, send to dead letter queue
            console.log(`💀 Max retries reached, sending to dead letter queue`);
            channel.nack(message, false, false);
          }
        }
      }
    }, {
      noAck: false // Manual acknowledgment
    });
    
  } catch (error) {
    console.error(`❌ Error setting up consumer for ${queueName}:`, error.message);
    throw error;
  }
}

// Start all consumers
async function startAllConsumers() {
  try {
    console.log('🚀 Starting all message consumers...');
    
    // Start consumers for each queue
    for (const [queueName, processor] of Object.entries(messageProcessors)) {
      await consumeMessages(queueName, processor);
    }
    
    console.log('✅ All consumers are running');
    
  } catch (error) {
    console.error('❌ Error starting consumers:', error.message);
    throw error;
  }
}

// Health check endpoint (optional - if you want to add express)
function startHealthCheck() {
  const express = require('express');
  const app = express();
  const port = process.env.HEALTH_CHECK_PORT || 5010;
  
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      queues: Object.values(QUEUES),
      notificationService: NOTIFICATION_SERVICE_URL
    });
  });
  
  app.listen(port, () => {
    console.log(`🏥 Health check server running on port ${port}`);
  });
}

// Graceful shutdown
async function gracefulShutdown() {
  console.log('🔄 Shutting down gracefully...');
  
  try {
    if (channel) {
      await channel.close();
    }
    if (connection) {
      await connection.close();
    }
    console.log('✅ Shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error.message);
    process.exit(1);
  }
}

// Handle shutdown signals
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown();
});

// Main function
async function main() {
  try {
    console.log('🚀 Starting RabbitMQ Consumer Service...');
    console.log(`📡 Notification Service URL: ${NOTIFICATION_SERVICE_URL}`);
    console.log(`🐰 RabbitMQ URL: ${RABBITMQ_URL}`);
    
    // Test notification service connectivity
    try {
      await axios.get(`${NOTIFICATION_SERVICE_URL.replace('/api/notifications', '')}/health`);
      console.log('✅ Notification service is reachable');
    } catch (error) {
      console.log('⚠️ Could not reach notification service health endpoint (continuing anyway)');
    }
    
    await connectRabbitMQ();
    await startAllConsumers();
    
    // Optional: Start health check server
    if (process.env.ENABLE_HEALTH_CHECK === 'true') {
      startHealthCheck();
    }
    
    console.log('✅ RabbitMQ Consumer Service is running');
    console.log('📋 Listening to queues:', Object.values(QUEUES));
    
  } catch (error) {
    console.error('❌ Failed to start service:', error.message);
    process.exit(1);
  }
}

// Export for testing
module.exports = {
  connectRabbitMQ,
  startAllConsumers,
  callNotificationAPI,
  messageProcessors,
  QUEUES
};

// Start the application
if (require.main === module) {
  main();
}