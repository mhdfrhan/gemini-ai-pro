import { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import nodemailer from 'nodemailer';

const PIXEL_API_KEY = process.env.VITE_PIXEL_API_KEY || process.env.PIXEL_API_KEY;

function getDb() {
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
  // CORS Setup
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { uid, payload } = req.body;

  if (!uid || !payload) {
    return res.status(400).json({ message: 'Missing uid or payload' });
  }

  try {
    const db = getDb();

    // 1. Cek saldo Pixel API terlebih dahulu
    const balanceRes = await fetch('https://pixel.wxie.de/api/v1/balance', {
      headers: { 'Authorization': `Bearer ${PIXEL_API_KEY}` }
    });
    const balanceData = await balanceRes.json();
    const pixelPoints = balanceData?.balance?.balance_points || 0;

    if (pixelPoints < 6) {
      // Saldo bot habis
      const systemRef = db.collection('system').doc('status');
      const systemDoc = await systemRef.get();
      const lastEmailSentAt = systemDoc.data()?.lastEmailSentAt;
      const lastEmailSent = lastEmailSentAt?.toMillis ? lastEmailSentAt.toMillis() : 0;
      const now = Date.now();

      if (now - lastEmailSent > 1000 * 60 * 60 * 12) {
        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
          try {
            const transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
            });
            await transporter.sendMail({
              from: `"Hanx Gemini Pro" <${process.env.SMTP_USER}>`,
              to: 'hi.mhdfarhan@gmail.com',
              subject: '🚨 URGENT: Saldo API Pixel Habis!',
              text: `Saldo API Pixel Anda saat ini: ${pixelPoints} poin. Transaksi gagal diproses. Segera isi ulang saldo!`
            });
            await systemRef.set({ lastEmailSentAt: FieldValue.serverTimestamp() }, { merge: true });
            console.log('Email peringatan dikirim ke hi.mhdfarhan@gmail.com');
          } catch (emailErr) {
            console.error('Gagal mengirim email peringatan:', emailErr);
          }
        }
      }

      throw new Error('Sistem sedang maintenance. Silakan coba beberapa saat lagi.');
    }

    const userRef = db.collection('users').doc(uid);

    // Gunakan Transaction untuk memastikan sinkronisasi poin (hindari manipulasi)
    const transactionResult = await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const currentPoints = userData?.points || 0;

      if (currentPoints < 6) {
        throw new Error('Poin tidak cukup. Silakan Topup Poin di Dashboard.');
      }

      // Potong 6 poin
      transaction.update(userRef, { points: currentPoints - 6 });
      return true;
    });

    if (transactionResult) {
      const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
      const protocol = req.headers['x-forwarded-proto'] || (host.includes('localhost') ? 'http' : 'https');
      
      const apiPayload: any = {
        ...payload,
        channel: 'fast',
        task_mode: 'extract_link',
      };

      // Pixel API menolak webhook localhost, jadi abaikan jika berjalan di lokal
      if (!host.includes('localhost')) {
        apiPayload.callback_url = payload.callback_url || `${protocol}://${host}/api/tasks/webhook`;
      }

      const response = await fetch('https://pixel.wxie.de/api/v1/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PIXEL_API_KEY}`,
        },
        body: JSON.stringify(apiPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Refund 6 poin karena API Pixel gagal
        await userRef.update({ points: FieldValue.increment(6) });
        throw new Error(errorData.message || 'API Pixel Error');
      }

      const responseData = await response.json();

      // Simpan data task lengkap ke Firestore untuk ditampilkan di Riwayat
      if (responseData.task && responseData.task.id) {
        const taskData = responseData.task;
        await db.collection('user_tasks').doc(String(taskData.id)).set({
          uid: uid,
          // Data dari API Pixel
          task_id: taskData.id,
          display_id: taskData.display_id || `TASK-${taskData.id}`,
          email: taskData.email || payload.email,
          task_mode: taskData.task_mode || 'extract_link',
          channel: taskData.channel || 'fast',
          points_cost: taskData.points_cost || 6,
          status: taskData.status || 'pending',
          result_link: taskData.result_link || null,
          error_message: taskData.error_message || null,
          // Timestamps
          created_at: FieldValue.serverTimestamp(),
          started_at: taskData.started_at || null,
          finished_at: taskData.finished_at || null,
        });
      }

      return res.status(200).json(responseData);
    }

  } catch (error: any) {
    console.error('Submit Task Error:', error);
    return res.status(500).json({ message: error.message });
  }
}
