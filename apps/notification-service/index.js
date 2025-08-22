// index.js;
require('dotenv').config(); // Load environment variables
const amqp = require('amqplib');
const sgMail = require('@sendgrid/mail');
const twilio = require('twilio');

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Initialize Twilio Client
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// RabbitMQ connection and channel will be established later
let connection, channel;

// Name of the queue we want to listen to
const QUEUE_NAME = 'order.confirmed';