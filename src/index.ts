import express, { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import Order from './order';
import { verifySignature } from './webhook';

dotenv.config();

const app = express();
app.use(express.json());

// Retrieve the necessary environment variables
const DEFIHUB_SERVER_URL = process.env.DEFIHUB_SERVER_URL;
const MERCHANT_API_KEY = process.env.MERCHANT_API_KEY;
const MERCHANT_BOT_URL = process.env.MERCHANT_BOT_URL;

// Check if the required environment variables are set
if (!DEFIHUB_SERVER_URL || !MERCHANT_API_KEY) {
  throw new Error('Missing environment variables');
}

// Endpoint for creating a new subscription order
app.post('/subscribe', async (req: Request, res: Response) => {
  try {
    const { packageId } = req.body;

    // Create a new order using the provided package ID
    const newOrder = Order.createNewOrder(packageId);

    // Send a request to the DefiHub server to create the order
    const response = await axios.post(
      `${DEFIHUB_SERVER_URL}/v1/order`,
      {
        externalId: newOrder.id.toString(),
        payAmount: newOrder.amount,
        currencyCode: 'TON',
        timeout: 60 * 60, // 1 hour
        description: newOrder.description,
        returnUrl: `${MERCHANT_BOT_URL}/success`,
        failReturnUrl: `${MERCHANT_BOT_URL}/error`,
      },
      {
        headers: {
          'merchant-api-key': MERCHANT_API_KEY,
        },
      },
    );

    // Extract the payment link from the response and send it back to the client
    const { payLink } = response.data.data;
    res.json({ data: { payLink } });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Object to keep track of processed webhook events
const ProcessedEvent: Record<string, boolean> = {};

// Endpoint for handling webhook events
app.post('/webhook', (req: Request, res: Response) => {
  const { eventId, externalId } = req.body;

  // Check if the event has already been processed
  if (ProcessedEvent[eventId]) {
    return res.status(200).json();
  }

  // Verify the signature of the webhook request
  if (!verifySignature(req, MERCHANT_API_KEY)) {
    return res.status(401).json();
  }

  try {
    // Retrieve the order using the external ID
    const order = Order.getById(externalId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update the order status based on the webhook payload
    order.status = 'paid';
    Order.updateOrder(order);

    // Mark the event as processed
    ProcessedEvent[eventId] = true;
    return res.status(200).json();
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// Endpoint for retrieving a list of all orders
app.get('/order/list', (req: Request, res: Response) => {
  const orders = Order.getAll();

  res.json({ data: orders });
});

// Endpoint for retrieving a specific order by ID
app.get('/order/:orderId', (req: Request, res: Response) => {
  const { orderId } = req.params;

  const order = Order.getById(orderId);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  res.json({ data: order });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Merchant server demo is running on port ${PORT}`);
});
