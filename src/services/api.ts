import type { BalanceResponse, QueryTaskResponse, SubmitTaskPayload, SubmitTaskResponse } from '../types';

const API_KEY = import.meta.env.VITE_PIXEL_API_KEY;

// Gunakan relative path agar Vite Proxy bisa meneruskan request ini secara otomatis ke https://pixel.wxie.de/api/v1
const BASE_URL = '/api/v1';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = 'API Error';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {}
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function submitTask(payload: SubmitTaskPayload, uid: string): Promise<SubmitTaskResponse> {
  const response = await fetch('/api/tasks/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid, payload }),
  });
  if (!response.ok) {
    let errorMessage = 'Gagal submit task';
    try {
      const errData = await response.json();
      errorMessage = errData.message || errorMessage;
    } catch {}
    throw new Error(errorMessage);
  }
  return response.json();
}

export async function queryTask(taskId: number): Promise<QueryTaskResponse> {
  return fetchWithAuth('/query', {
    method: 'POST',
    body: JSON.stringify({ task_id: taskId }),
  });
}

export async function queryTasks(taskIds: number[]): Promise<QueryTaskResponse> {
  return fetchWithAuth('/query', {
    method: 'POST',
    body: JSON.stringify({ task_ids: taskIds }),
  });
}

export async function getBalance(): Promise<BalanceResponse> {
  return fetchWithAuth('/balance');
}
