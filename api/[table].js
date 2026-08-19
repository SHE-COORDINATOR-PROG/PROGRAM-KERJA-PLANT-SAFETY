const { Pool } = require('pg');

let pool;
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
  }
  return pool;
}

// Whitelist nama tabel yang boleh diakses (mencegah SQL injection lewat nama tabel)
const ALLOWED = ['inspeksi', 'program', 'upload'];

// Kolom yang boleh diinsert per tabel, sesuai yang dikirim index.html
const COLUMNS = {
  inspeksi: ['jenis', 'tgl', 'nama', 'lokasi', 'unit', 'jam', 'checklist', 'fotos'],
  program: ['no', 'title', 'nama', 'tgl', 'catatan', 'ringkas'],
  upload: ['no', 'title', 'file_name', 'file_type', 'tgl_upload']
};

module.exports = async function handler(req, res) {
  const { table } = req.query;

  if (!ALLOWED.includes(table)) {
    return res.status(400).json({ error: 'Tabel tidak dikenal: ' + table });
  }

  const pool = getPool();

  try {
    if (req.method === 'GET') {
      const result = await pool.query(
        `SELECT * FROM ${table} ORDER BY created_at DESC LIMIT 500`
      );
      return res.status(200).json({ data: result.rows });
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const cols = COLUMNS[table].filter((c) => body[c] !== undefined);

      if (!cols.length) {
        return res.status(400).json({ error: 'Tidak ada data valid untuk disimpan' });
      }

      const values = cols.map((c) => body[c]);
      const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
      const sql = `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders}) RETURNING *`;

      const result = await pool.query(sql, values);
      return res.status(200).json({ data: result.rows[0] });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Method tidak diizinkan' });
  } catch (e) {
    console.error(`[api/${table}]`, e);
    return res.status(500).json({ error: e.message });
  }
};
