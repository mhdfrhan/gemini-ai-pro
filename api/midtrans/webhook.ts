import { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const serverKey = process.env.MIDTRANS_SERVER_KEY!;

function getFirebaseAdmin() {
  if (!getApps().length) {
    const sa = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!sa) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is missing!');
    }
    initializeApp({ credential: cert(JSON.parse(sa)) });
  }
  return getFirestore();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const notification = req.body;

    const orderId = notification.order_id;
    const statusCode = notification.status_code;
    const grossAmount = notification.gross_amount;
    const signatureKey = notification.signature_key;

    // Verifikasi Signature Midtrans (wajib untuk keamanan)
    const hash = crypto.createHash('sha512');
    hash.update(orderId + statusCode + grossAmount + serverKey);
    const expectedSignature = hash.digest('hex');

    if (signatureKey !== expectedSignature) {
      console.error(`Invalid signature for order ${orderId}`);
      return res.status(401).json({ message: 'Invalid signature' });
    }

    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    // Ekstrak UID dari Order ID (Format: ORDER-{uid}-{timestamp})
    const parts = orderId.split('-');
    // UID bisa mengandung '-', jadi ambil semua bagian kecuali 'ORDER' (index 0) dan timestamp (index terakhir)
    const uid = parts.slice(1, parts.length - 1).join('-');

    console.log(`Midtrans Webhook received: orderId=${orderId}, status=${transactionStatus}, uid=${uid}`);

    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      if (fraudStatus === 'accept' || !fraudStatus) {
        if (!uid) {
          console.error('UID kosong, tidak bisa tambah poin!');
          return res.status(200).json({ message: 'OK but UID missing' });
        }

        const db = getFirebaseAdmin();
        const userRef = db.collection('users').doc(uid);
        await userRef.update({
          points: FieldValue.increment(6)
        });
        console.log(`✅ Berhasil menambahkan 6 poin untuk user UID: ${uid}`);
      }
    }

    return res.status(200).json({ message: 'OK' });
  } catch (error: any) {
    console.error('Webhook Error:', error);
    return res.status(500).json({ message: error.message });
  }
}
