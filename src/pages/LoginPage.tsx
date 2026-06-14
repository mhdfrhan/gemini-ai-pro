import { useState, useEffect } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Cpu, Zap, Star, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const schema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login, loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate({ to: '/dashboard' });
    }
  }, [user, navigate]);

  const {
    register, handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
      navigate({ to: '/dashboard' });
    } catch {
      toast.error('Login gagal', { description: 'Email atau password salah.' });
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      navigate({ to: '/dashboard' });
    } catch {
      toast.error('Login Google gagal');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-left">
        <div className="auth-left-bg" />
        <div style={{ position: 'relative', textAlign: 'center', maxWidth: 380 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 0 40px var(--primary-glow)',
          }} className="animate-glow">
            <Cpu size={32} color="white" />
          </div>
          <h2 style={{ marginBottom: 12 }}>
            Selamat Datang di <span className="gradient-text">Hanx Gemini Pro</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 40, lineHeight: 1.7 }}>
            Platform terpercaya untuk aktivasi Google AI Pro otomatis dan instan.
          </p>

          {[
            { icon: Zap, text: 'Proses otomatis dalam hitungan menit' },
            { icon: Shield, text: 'Data aman & terenkripsi end-to-end' },
            { icon: Star, text: 'Garansi refund jika gagal' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, textAlign: 'left' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: 'var(--primary-glow)',
                border: '1px solid rgba(99,102,241,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon size={16} color="var(--primary-light)" />
              </div>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-2)' }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - form */}
      <div className="auth-right">
        <motion.div
          className="auth-form-wrapper"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ marginBottom: 32 }}>
            <h1 className="auth-title">Masuk ke Akun</h1>
            <p className="auth-subtitle">Masukkan kredensial Anda untuk melanjutkan</p>
          </div>

          {/* Google login */}
          <Button
            variant="secondary"
            className="w-full"
            style={{ marginBottom: 4 }}
            onClick={handleGoogle}
            loading={googleLoading}
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              width={18} height={18} alt="Google"
            />
            Masuk dengan Google
          </Button>

          <div className="auth-divider">atau masuk dengan email</div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input
              id="login-email"
              label="Email"
              type="email"
              placeholder="email@example.com"
              iconRight={<Mail size={16} />}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              id="login-password"
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={isSubmitting}
              style={{ marginTop: 8 }}
            >
              <LogIn size={17} />
              Masuk Sekarang
            </Button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Belum punya akun?{' '}
            <Link to="/auth/register" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>
              Daftar gratis
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
