const { onCall, onRequest, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const axios = require('axios').default;

admin.initializeApp();
const db = admin.firestore();

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const PIXEL_API_BASE = 'https://pixel.wxie.de';
const PIXEL_API_KEY = 'pg_live_jxVR61JhiekXACc6r_Rji6mJ_nvLNFEc8b-nEAWZChc';

const pixelHeaders = {
  Authorization: `Bearer ${PIXEL_API_KEY}`,
  'Content-Type': 'application/json',
};

// ─── Helper: verify auth ──────────────────────────────────────────────────────
function requireAuth(context) {
  if (!context.auth) {
    throw new HttpsError('unauthenticated', 'Login terlebih dahulu.');
  }
  return context.auth.uid;
}

// ─── getBalance ───────────────────────────────────────────────────────────────
exports.getBalance = onCall({ region: 'asia-southeast1' }, async (request) => {
  requireAuth(request);
  try {
    const resp = await axios.get(`${PIXEL_API_BASE}/api/v1/balance`, {
      headers: pixelHeaders,
    });
    return resp.data;
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    throw new HttpsError('internal', `Pixel API error: ${msg}`);
  }
});

// ─── submitTask ───────────────────────────────────────────────────────────────
exports.submitTask = onCall({ region: 'asia-southeast1' }, async (request) => {
  const uid = requireAuth(request);
  const { email, password, twofa_url, task_mode, channel, callback_url } = request.data;

  // Validation
  if (!email || !password || !twofa_url || !task_mode || !channel) {
    throw new HttpsError('invalid-argument', 'Field wajib tidak lengkap.');
  }
  if (!['extract_link', 'direct_subscription'].includes(task_mode)) {
    throw new HttpsError('invalid-argument', 'task_mode tidak valid.');
  }
  if (!['normal', 'fast'].includes(channel)) {
    throw new HttpsError('invalid-argument', 'channel tidak valid.');
  }

  try {
    const payload = { email, password, twofa_url, task_mode, channel };
    if (callback_url) payload.callback_url = callback_url;

    const resp = await axios.post(`${PIXEL_API_BASE}/api/v1/submit`, payload, {
      headers: pixelHeaders,
    });

    const data = resp.data;
    const task = data.task;

    // Save task to Firestore (without sensitive fields)
    await db.collection('tasks').doc(String(task.id)).set({
      uid,
      id: task.id,
      display_id: task.display_id,
      backend_task_id: task.backend_task_id,
      email: task.email,
      task_mode: task.task_mode,
      channel: task.channel,
      points_cost: task.points_cost,
      status: task.status,
      result_link: task.result_link,
      error_message: task.error_message || '',
      created_at: task.created_at,
      started_at: task.started_at,
      finished_at: task.finished_at,
      quota_refunded: task.quota_refunded,
    });

    return data;
  } catch (err) {
    if (err instanceof HttpsError) throw err;
    const msg = err.response?.data?.message || err.message;
    throw new HttpsError('internal', `Pixel API error: ${msg}`);
  }
});

// ─── queryTask ────────────────────────────────────────────────────────────────
exports.queryTask = onCall({ region: 'asia-southeast1' }, async (request) => {
  const uid = requireAuth(request);
  const { task_id, task_ids } = request.data;

  if (!task_id && !task_ids) {
    throw new HttpsError('invalid-argument', 'Berikan task_id atau task_ids.');
  }

  try {
    const payload = task_id ? { task_id } : { task_ids };
    const resp = await axios.post(`${PIXEL_API_BASE}/api/v1/query`, payload, {
      headers: pixelHeaders,
    });

    const data = resp.data;
    const tasksToUpdate = data.tasks || (data.task ? [{ task: data.task }] : []);

    // Update Firestore task docs
    const batch = db.batch();
    for (const { task } of tasksToUpdate) {
      // Security: verify ownership
      const docRef = db.collection('tasks').doc(String(task.id));
      const existing = await docRef.get();
      if (!existing.exists || existing.data().uid !== uid) continue;

      batch.update(docRef, {
        status: task.status,
        result_link: task.result_link,
        error_message: task.error_message || '',
        started_at: task.started_at,
        finished_at: task.finished_at,
        quota_refunded: task.quota_refunded,
      });
    }
    await batch.commit();

    return data;
  } catch (err) {
    if (err instanceof HttpsError) throw err;
    const msg = err.response?.data?.message || err.message;
    throw new HttpsError('internal', `Pixel API error: ${msg}`);
  }
});

// ─── webhookReceiver (HTTP trigger) ───────────────────────────────────────────
exports.webhookReceiver = onRequest({ region: 'asia-southeast1' }, async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const payload = req.body;
    if (payload.event !== 'task.finished' || !payload.task?.id) {
      res.status(400).json({ error: 'Invalid payload' });
      return;
    }

    const task = payload.task;
    const docRef = db.collection('tasks').doc(String(task.id));
    const existing = await docRef.get();

    if (!existing.exists) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    await docRef.update({
      status: task.status,
      result_link: task.result_link,
      error_message: task.error_message || '',
      started_at: task.started_at,
      finished_at: task.finished_at,
      quota_refunded: task.quota_refunded,
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});
