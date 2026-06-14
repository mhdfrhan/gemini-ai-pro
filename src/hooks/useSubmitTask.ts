import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { submitTask } from '../services/api';
import type { SubmitTaskPayload } from '../types';

export function useSubmitTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, uid }: { payload: SubmitTaskPayload; uid: string }) => submitTask(payload, uid),
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      toast.success(`Task ${data.task.display_id} berhasil disubmit!`, {
        description: `Status: ${data.task.status} | Saldo terpotong 6 poin`,
      });
    },
    onError: (error: Error) => {
      // Error message translation based on FAQ
      let msg = error.message;
      if (msg.toLowerCase().includes('timed out')) {
        msg = "Operasi Timeout: Akun mungkin mengaktifkan Hardware Passkey. Tolong matikan Passkey dan submit ulang.";
      } else if (msg.toLowerCase().includes('already been used')) {
        msg = "Link sudah digunakan: Harap gunakan browser Incognito/Private saat membuka link promo.";
      } else if (msg.toLowerCase().includes('2fa not enabled')) {
        msg = "2FA belum aktif: Anda harus menambahkan aplikasi Authenticator DAN menyalakan Verifikasi 2 Langkah.";
      } else if (msg.toLowerCase().includes('user not found')) {
        msg = "Poin tidak cukup. Silakan topup poin Anda di Dashboard.";
      }

      toast.error('Gagal submit task', {
        description: msg,
      });
    },
  });
}
