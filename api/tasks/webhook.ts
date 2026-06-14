import { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

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
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const payload = req.body;

    // Cek apakah ini webhook dari Pixel API (event: 'task.finished')
    if (payload.event === 'task.finished' && payload.task) {
      const taskId = payload.task.id;
      const status = payload.task.status; // 3 = failed, 4 = success

      const db = getDb();
      const taskDocRef = db.collection('user_tasks').doc(String(taskId));
      const taskDoc = await taskDocRef.get();

      if (taskDoc.exists) {
        const taskData = taskDoc.data();
        const uid = taskData?.uid;

        // Jika task gagal (status === 3) dan poin belum pernah di-refund
        if (status === 3 && !taskData?.refunded && uid) {
          const userRef = db.collection('users').doc(uid);
          await userRef.update({
            points: FieldValue.increment(6)
          });

          await taskDocRef.update({
            status: 'failed',
            refunded: true,
            error_message: payload.task.error_message || 'Task Failed'
          });
          console.log(`✅ Refund 6 poin ke UID ${uid} untuk Task gagal ${taskId}`);
        } else if (status === 4) {
          await taskDocRef.update({ status: 'success' });
          console.log(`✅ Task ${taskId} sukses, status diupdate`);
        }
      } else {
        console.warn(`Task Webhook untuk Task ID ${taskId} tidak ditemukan di user_tasks.`);
      }
    }

    // Selalu balas dengan 200 OK agar API Pixel tahu webhook sudah diterima
    return res.status(200).json({ message: 'OK' });
  } catch (error: any) {
    console.error('Task Webhook Error:', error);
    return res.status(500).json({ message: error.message });
  }
}
