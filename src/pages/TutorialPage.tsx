import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CheckCircle2, AlertCircle, HelpCircle, KeyRound, Globe } from 'lucide-react';

type Lang = 'id' | 'en';

export default function TutorialPage() {
  const [lang, setLang] = useState<Lang>('id');

  const content = {
    id: {
      title: 'Tutorial & FAQ',
      desc: 'Panduan lengkap sebelum melakukan submission tugas',
      rulesTitle: 'Syarat & Aturan Akun',
      rules: [
        'Akun harus dibuat di atas tahun 2022 (bukan akun yang benar-benar baru dibuat) dan sedang tidak dalam masa berlangganan aktif.',
        'Pastikan akun email yang akan diklaim promo sudah ditautkan ke HP sebagai perangkat utama (primary device).',
        'Disarankan tidak menggunakan akun utama yang sudah terkait ke banyak aplikasi pribadi/penting.',
        'Email harus memiliki riwayat aktivitas, bukan email kosong yang benar-benar baru dibuat.',
        'Sistem hanya memerlukan kode Rahasia Autentikasi 2 Faktor (2FA Secret). Kami tidak memerlukan akses manual login Anda.',
        'Pembayaran dilakukan di awal. Namun, jika email yang diajukan gagal diproses (error/ditolak), poin/uang dijamin 100% dikembalikan otomatis.',
        'Pastikan Anda siap (stay) online selama proses jika suatu saat sistem mendeteksi kendala verifikasi keamanan tambahan.',
        'Tingkat keberhasilan proses adalah 80%. Sangat disarankan untuk menyiapkan akun cadangan (backup) jika akun pertama tidak berhasil.',
      ],
      flowTitle: 'Alur Mendapatkan Kode 2FA',
      flowSteps: [
        'Login ke akun Google Anda, buka menu Keamanan, lalu pilih Verifikasi 2 Langkah.',
        'Pilih menu Authenticator dan klik tombol "+ Siapkan pengautentikasi".',
        'Saat muncul popup QR Code, klik teks tautan "Tidak dapat memindainya?" di bawah gambar QR code.',
        'Salin/copy kode berisi 32 karakter (Kode Rahasia 2FA) yang muncul di layar poin nomor 2.',
        <span key="step-5">Buka website <a href="https://lay2fa.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>lay2fa.com</a> di tab baru, paste kode rahasia tadi di sana, lalu copy 6-digit kode verifikasi sementara yang muncul.</span>,
        'Kembali ke akun Google Anda, klik tombol Berikutnya, lalu masukkan 6-digit kode verifikasi tadi sebelum waktunya kadaluarsa (hitung mundur).',
        'Setelah selesai dan kembali ke menu, pastikan Anda menekan tombol "Aktifkan" (Turn On) untuk mengaktifkan fitur Verifikasi 2 Langkah secara penuh.',
        'Kembali ke Halaman Beli di Dashboard kami, dan masukkan email, password, serta paste-kan 32-karakter Kode Rahasia yang Anda salin di langkah 4.'
      ],
      faqTitle: 'FAQ (Tanya Jawab)',
      faqs: [
        {
          q: 'Mengapa link penawaran (offer link) mengatakan kupon sudah digunakan?',
          a: 'Anda harus menggunakan jendela browser incognito/private dan sign-in menggunakan akun yang terikat dengan offer link tersebut untuk menebusnya (redeem).'
        },
        {
          q: 'Mengapa saya mendapat pesan error "Operation timed out"?',
          a: 'Akun Anda mungkin memiliki hardware Passkey yang aktif, sehingga sistem kami tidak bisa login. Coba matikan hardware Passkey tersebut lalu jalankan ulang. Jika masih gagal, silakan gunakan akun yang berbeda.'
        },
        {
          q: 'Mengapa saya mendapat error "2FA not enabled"?',
          a: 'Pastikan Anda telah menambahkan Google Authenticator dan mendapatkan 32-karakter rahasia 2FA (2FA secret), kemudian pastikan Anda benar-benar mengaktifkan 2-Step Verification di akun Google Anda. Hanya menambahkan authenticator saja tidak cukup — fitur Verifikasi 2 Langkahnya juga harus dinyalakan (Turn On).'
        },
        {
          q: 'Kenapa task saya menunggu lebih dari sehari tanpa update status?',
          a: 'Jalur (channel) normal saat ini sangat padat — sering kali ada lebih dari 5.000 antrian, yang dapat memakan waktu 2 hari atau lebih. Gunakan jalur Fast Lane (6 Poin) jika Anda butuh diproses lebih cepat.'
        }
      ]
    },
    en: {
      title: 'Tutorial & FAQ',
      desc: 'Complete guide before submitting your task',
      rulesTitle: 'Account Requirements & Rules',
      rules: [
        'The account must be created before 2022 (not a brand new account) and must not be currently subscribed to any plan.',
        'Ensure the email account used to claim the promo is linked to a mobile phone as the primary device.',
        'It is highly recommended NOT to use your main account that is linked to many personal/important applications.',
        'The email must have activity history, not a completely empty or newly created email.',
        'The system only requires the 2-Factor Authentication Secret Code. We do not need your manual login access.',
        'Payment is made upfront. However, if the submitted email fails to be processed (error/rejected), your points/money is 100% guaranteed to be refunded automatically.',
        'Make sure you stay online during the process in case the system detects additional security verification hurdles.',
        'The current success rate is 80%. It is highly recommended to prepare a backup account in case the first one fails.',
      ],
      flowTitle: 'How to Get 2FA Secret',
      flowSteps: [
        'Log in to your Google Account, go to Security, then select 2-Step Verification.',
        'Scroll down to Authenticator app and click "+ Set up authenticator".',
        'When the QR code popup appears, click on "Can\'t scan it?" below the QR code.',
        'Copy the 32-character setup key (Secret Code) provided in step 2.',
        <span key="step-5-en">Open <a href="https://lay2fa.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>lay2fa.com</a> in a new tab, paste the secret code there to get the 6-digit verification code.</span>,
        'Go back to Google, click Next, and enter the 6-digit verification code before it expires.',
        'After verifying, ensure you click "Turn On" to activate 2-Step Verification entirely.',
        'Go back to our Dashboard Submit page, enter your email, password, and the 32-character Secret Code you copied earlier.'
      ],
      faqTitle: 'FAQ',
      faqs: [
        {
          q: 'Why does the offer link say the coupon has already been used?',
          a: 'You must use an incognito/private browser window and sign in with the account bound to the offer link to redeem it.'
        },
        {
          q: 'Why did I get an "Operation timed out" error?',
          a: 'Your account may have a hardware Passkey enabled, which prevents our system from signing in. Try disabling the hardware Passkey and resubmit. If it still fails, use a different account.'
        },
        {
          q: 'Why did I get a "2FA not enabled" error?',
          a: 'Make sure you have added Google Authenticator and obtained the 32-character 2FA secret, then enabled 2-Step Verification. Adding the authenticator alone is not enough — you must also turn on 2-Step Verification.'
        },
        {
          q: 'Why has my task been waiting for over a day with no update?',
          a: 'The normal channel is very congested — there are often close to 5,000 tasks in the queue, which can take two or more days. Use the Fast Lane if you need faster processing.'
        }
      ]
    }
  };

  const current = content[lang];

  return (
    <>
      <div className="topbar">
        <div>
          <h2 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <BookOpen size={18} color="var(--primary)" />
            {current.title}
          </h2>
          <p className="hide-on-mobile" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
            {current.desc}
          </p>
        </div>
        
        {/* Language Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '8px' }}>
          <Globe size={16} color="var(--text-muted)" style={{ marginLeft: 8 }} />
          <button
            onClick={() => setLang('id')}
            style={{
              background: lang === 'id' ? 'var(--primary)' : 'transparent',
              color: lang === 'id' ? '#fff' : 'var(--text-muted)',
              border: 'none', padding: '4px 12px', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer',
              fontWeight: lang === 'id' ? 'bold' : 'normal',
              transition: 'all 0.2s'
            }}
          >
            ID
          </button>
          <button
            onClick={() => setLang('en')}
            style={{
              background: lang === 'en' ? 'var(--primary)' : 'transparent',
              color: lang === 'en' ? '#fff' : 'var(--text-muted)',
              border: 'none', padding: '4px 12px', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer',
              fontWeight: lang === 'en' ? 'bold' : 'normal',
              transition: 'all 0.2s'
            }}
          >
            EN
          </button>
        </div>
      </div>

      <div className="page-content" style={{ maxWidth: 1200 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${lang}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', 
              gap: '24px',
              alignItems: 'start'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Syarat & Aturan Akun */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <AlertCircle size={20} color="var(--gold)" />
                  <h3 style={{ fontSize: '1.05rem', margin: 0 }}>{current.rulesTitle}</h3>
                </div>
                
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {current.rules.map((note, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <CheckCircle2 size={16} color="var(--primary-light)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-muted)' }}>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* FAQ */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                  <HelpCircle size={20} color="var(--info)" />
                  <h3 style={{ fontSize: '1.05rem', margin: 0 }}>💡 {current.faqTitle}</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {current.faqs.map((faq, idx) => (
                    <div key={idx} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                        <span style={{ fontWeight: 'bold', color: 'var(--text)' }}>❓</span>
                        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{faq.q}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <span style={{ fontWeight: 'bold', color: 'var(--gold)' }}>💡</span>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                          {faq.a}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Kanan: Alur Mendapatkan Kode 2FA */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <KeyRound size={20} color="var(--success)" />
                <h3 style={{ fontSize: '1.05rem', margin: 0 }}>{current.flowTitle}</h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {current.flowSteps.map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 12 }}>
                    <div style={{ 
                      width: 28, height: 28, borderRadius: '50%', 
                      background: 'var(--primary-glow)', color: 'var(--primary-light)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      fontWeight: 'bold', flexShrink: 0 
                    }}>
                      {idx + 1}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text)', fontWeight: 500, lineHeight: 1.5 }}>
                        {step}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
