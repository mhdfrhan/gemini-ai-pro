import { useQuery } from '@tanstack/react-query';
import {
  collection,
  query,
  where,
  onSnapshot,
  type QuerySnapshot,
  type DocumentData,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { queryTask } from '../services/api';
import type { Task } from '../types';

// Real-time tasks from Firestore
export function useTasks() {
  const { firebaseUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!firebaseUser) {
      setTasks([]);
      setLoading(false);
      return;
    }

    // Tidak pakai orderBy agar tidak butuh Composite Index di Firestore
    // Sorting dilakukan di client side
    const q = query(
      collection(db, 'user_tasks'),
      where('uid', '==', firebaseUser.uid),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const taskList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as unknown as Task[];

        // Sort by created_at descending (terbaru dulu)
        taskList.sort((a, b) => {
          const aTime = (a.created_at as any)?.toMillis?.() ?? new Date(a.created_at as any).getTime() ?? 0;
          const bTime = (b.created_at as any)?.toMillis?.() ?? new Date(b.created_at as any).getTime() ?? 0;
          return bTime - aTime;
        });

        setTasks(taskList);
        setLoading(false);
      },
      (err) => {
        console.error('useTasks Firestore error:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firebaseUser]);

  return { tasks, loading, error };
}

// Single task status polling
export function useTaskStatus(taskId: number | null) {
  return useQuery({
    queryKey: ['task', taskId],
    queryFn: () => queryTask(taskId!),
    enabled: !!taskId,
    refetchInterval: (query) => {
      const status = query.state.data?.task?.status;
      // Poll every 5 seconds if still pending/processing
      if (status === 'pending' || status === 'processing') return 5000;
      return false;
    },
    staleTime: 0,
  });
}
