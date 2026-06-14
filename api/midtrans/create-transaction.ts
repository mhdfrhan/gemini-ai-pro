import { VercelRequest, VercelResponse } from '@vercel/node';
import midtransClient from 'midtrans-client';

const serverKey = process.env.MIDTRANS_SERVER_KEY;
const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';

const snap = new midtransClient.Snap({
  isProduction: isProduction,
  serverKey: serverKey,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { uid, email, displayName } = req.body;

    if (!uid) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Format Order ID: ORDER-{uid}-{timestamp}
    const orderId = `ORDER-${uid}-${Date.now()}`;

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: 50000,
      },
      item_details: [{
        id: 'PKG-6-POINTS',
        price: 50000,
        quantity: 1,
        name: '6 Poin API Bot Google',
      }],
      customer_details: {
        first_name: displayName || 'User',
        email: email,
      },
      enabled_payments: ['other_qris', 'qris'],
    };

    const transaction = await snap.createTransaction(parameter);
    
    return res.status(200).json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      order_id: orderId,
    });
  } catch (error: any) {
    console.error('Midtrans Snap Error:', error);
    return res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
}
