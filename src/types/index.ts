export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  role: 'user' | 'admin';
  points: number;
}

export type TaskMode = 'extract_link' | 'direct_subscription';
export type TaskChannel = 'normal' | 'fast';
export type TaskStatus = 'pending' | 'processing' | 'success' | 'failed';

export interface Task {
  id: number;
  display_id: string;
  backend_task_id: number;
  email: string;
  task_mode: TaskMode;
  channel: TaskChannel;
  points_cost: number;
  status: TaskStatus;
  result_link: string | null;
  error_message: string;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  quota_refunded: boolean;
  // Firebase-specific
  uid?: string;
}

export interface Balance {
  balance_points: number;
  total_success_count: number;
  today_success_count: number;
  pending_task_count: number;
  daily_success_cap: number | null;
}

export interface SubmitTaskPayload {
  email: string;
  password: string;
  twofa_url: string;
  task_mode: TaskMode;
  channel: TaskChannel;
  callback_url?: string;
}

export interface SubmitTaskResponse {
  task: Task;
  balance: Balance;
  counts: {
    tasks_total: number;
    tasks_pending: number;
  };
}

export interface BalanceResponse {
  generated_at: string;
  user_id: number;
  balance: Balance;
}

export interface QueryTaskResponse {
  generated_at: string;
  tasks: Array<{ task: Task }>;
  missing_task_ids: number[];
  task?: Task;
}
