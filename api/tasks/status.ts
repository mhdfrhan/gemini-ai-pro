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
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { task_id } = req.query;
  if (!task_id) {
    return res.status(400).json({ message: 'task_id is required' });
  }

  try {
    const PIXEL_API_KEY = process.env.VITE_PIXEL_API_KEY || process.env.PIXEL_API_KEY;
    if (!PIXEL_API_KEY) throw new Error('PIXEL_API_KEY is missing');

    const response = await fetch(`https://pixel.wxie.de/api/v1/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PIXEL_API_KEY}`,
      },
      body: JSON.stringify({ task_id: Number(task_id) })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch task from Pixel API');
    }

    const data = await response.json();
    const taskData = data.task || (data.tasks && data.tasks[0]?.task);

    if (!taskData) {
      throw new Error('Task not found in Pixel API');
    }

    const stringStatus = taskData.status; // e.g. "pending", "processing", "failed", "success"

    const db = getDb();
    const taskDocRef = db.collection('user_tasks').doc(String(task_id));
    const taskDoc = await taskDocRef.get();

    if (taskDoc.exists) {
      const dbData = taskDoc.data();
      const uid = dbData?.uid;

      // Check if we need to refund
      if (stringStatus === 'failed' && !dbData?.refunded && uid) {
        const userRef = db.collection('users').doc(uid);
        await userRef.update({
          points: FieldValue.increment(6)
        });

        await taskDocRef.update({
          status: 'failed',
          refunded: true,
          error_message: taskData.error_message || 'Task Failed',
          result_link: taskData.result_link || null,
        });
        
        return res.status(200).json({ 
          message: 'Status updated to failed and points refunded', 
          task: { ...dbData, status: 'failed', error_message: taskData.error_message } 
        });
      } else {
        // Just update status if changed
        if (dbData?.status !== stringStatus || dbData?.result_link !== taskData.result_link) {
          await taskDocRef.update({
            status: stringStatus,
            error_message: taskData.error_message || null,
            result_link: taskData.result_link || null,
          });
        }
        return res.status(200).json({ 
          message: 'Status checked', 
          task: { ...dbData, status: stringStatus, result_link: taskData.result_link } 
        });
      }
    }

    return res.status(404).json({ message: 'Task not found in local database' });
  } catch (error: any) {
    console.error('Check Status API Error:', error);
    return res.status(500).json({ message: error.message });
  }
}
