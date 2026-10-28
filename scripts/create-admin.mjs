// Buat atau reset akun admin langsung di database (tanpa endpoint publik).
//
//   Docker : docker compose exec app node scripts/create-admin.mjs <username> "<Nama Lengkap>"
//   Lokal  : node --env-file=.env.local scripts/create-admin.mjs <username> "<Nama Lengkap>"
//
// Password ditanya di terminal (tidak tampil). Untuk non-interaktif pakai env ADMIN_PASSWORD.
// Kalau username sudah ada: password di-reset, role jadi admin, akun diaktifkan lagi,
// dan semua sesi lama user itu dicabut. Jadi script ini sekaligus jalan pemulihan
// kalau semua admin terkunci.
import crypto from 'node:crypto';
import readline from 'node:readline';
import mysql from 'mysql2/promise';

const [username = '', displayName = ''] = process.argv.slice(2).map((s) => s.trim());
const normalized = username.toLowerCase();
if (!/^[a-z0-9._-]{3,80}$/.test(normalized) || !displayName) {
  console.error('Pemakaian: node scripts/create-admin.mjs <username> "<Nama Lengkap>"');
  console.error('Username 3-80 karakter: huruf kecil, angka, titik, garis bawah, atau strip.');
  process.exit(1);
}

function askHidden(prompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (s) => {
      if (s.includes(prompt)) process.stdout.write(s);
    };
    rl.question(prompt, (answer) => {
      rl.close();
      process.stdout.write('\n');
      resolve(answer);
    });
  });
}

let password = process.env.ADMIN_PASSWORD ?? '';
if (!password) {
  password = await askHidden('Password (min. 8 karakter): ');
  const again = await askHidden('Ulangi password: ');
  if (password !== again) {
    console.error('Password tidak sama.');
    process.exit(1);
  }
}
if (password.length < 8 || password.length > 128) {
  console.error('Password harus 8-128 karakter.');
  process.exit(1);
}

// Format sama persis dengan lib/auth.ts: "<salt hex>:<scrypt 64 byte hex>"
const salt = crypto.randomBytes(16).toString('hex');
const hash = `${salt}:${crypto.scryptSync(password, salt, 64).toString('hex')}`;

const conn = await mysql.createConnection({
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'timbangan_nasi',
});

try {
  const [rows] = await conn.query('SELECT id FROM users WHERE username = ? LIMIT 1', [normalized]);
  if (rows.length > 0) {
    const id = rows[0].id;
    await conn.query(
      "UPDATE users SET display_name=?, password_hash=?, role='admin', is_active=1 WHERE id=?",
      [displayName, hash, id]
    );
    await conn.query('DELETE FROM sessions WHERE user_id = ?', [id]);
    console.log(`Akun "${normalized}" sudah ada: password di-reset, role admin, sesi lama dicabut.`);
  } else {
    await conn.query(
      "INSERT INTO users (username, display_name, password_hash, role) VALUES (?,?,?, 'admin')",
      [normalized, displayName, hash]
    );
    console.log(`Admin "${normalized}" dibuat. Silakan login di /login.`);
  }
} catch (e) {
  console.error('Gagal: ' + (e.code === 'ER_NO_SUCH_TABLE' ? 'tabel users belum ada. Jalankan db/schema.sql dulu.' : e.message));
  process.exit(1);
} finally {
  await conn.end();
}
