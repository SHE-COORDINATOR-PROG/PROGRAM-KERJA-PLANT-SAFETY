// api/komisioning.js
// Vercel Serverless Function — CRUD untuk tabel komisioning_unit di Neon (Postgres).
//
// Endpoint:
//   GET    /api/komisioning              -> daftar semua unit (mendukung ?status=&kategori=&lokasi=&q=)
//   POST   /api/komisioning              -> tambah unit baru (body: JSON)
//   PUT    /api/komisioning?id=ID        -> update unit (body: JSON)
//   DELETE /api/komisioning?id=ID        -> hapus unit
//
// Status (Aktif / Mendekati Kadaluarsa / Kadaluarsa) DIHITUNG DI SINI setiap
// kali GET dipanggil, dibandingkan dengan tanggal hari ini — bukan disimpan
// statis di kolom, supaya selalu akurat.

const { Pool } = require('pg');

let pool;
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false } // Neon wajib SSL
    });
  }
  return pool;
}

const MASA_BULAN = 6;   // masa aktif komisioning
const H_WARNING  = 30;  // ambang "Mendekati Kadaluarsa"

function hitungStatus(tanggalBerakhir) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const akhir = new Date(tanggalBerakhir);
  akhir.setHours(0, 0, 0, 0);
  const diffDays = Math.round((akhir - today) / 86400000);
  if (diffDays < 0) return 'Kadaluarsa';
  if (diffDays <= H_WARNING) return 'Mendekati Kadaluarsa';
  return 'Aktif';
}

function tambahBulan(tanggalISO, n) {
  const d = new Date(tanggalISO);
  const nd = new Date(d.getFullYear(), d.getMonth() + n, d.getDate());
  const mm = String(nd.getMonth() + 1).padStart(2, '0');
  const dd = String(nd.getDate()).padStart(2, '0');
  return `${nd.getFullYear()}-${mm}-${dd}`;
}

module.exports = async function handler(req, res) {
  // CORS dasar (aman untuk dipanggil dari domain Vercel yang sama;
  // longgarkan/perketat sesuai kebutuhan bila frontend di domain lain)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const client = getPool();

  try {
    if (req.method === 'GET') {
      const { status, kategori, lokasi, q } = req.query;
      let sql = 'SELECT * FROM komisioning_unit WHERE 1=1';
      const params = [];

      if (kategori) { params.push(kategori); sql += ` AND kategori = $${params.length}`; }
      if (lokasi)   { params.push(lokasi);   sql += ` AND lokasi_area = $${params.length}`; }
      if (q) {
        params.push(`%${q}%`);
        sql += ` AND (nama_unit ILIKE $${params.length} OR nomor_unit ILIKE $${params.length})`;
      }
      sql += ' ORDER BY tanggal_berakhir ASC';

      const result = await client.query(sql, params);
      let rows = result.rows.map(r => ({
        ...r,
        status: hitungStatus(r.tanggal_berakhir)
      }));

      if (status) rows = rows.filter(r => r.status === status);

      return res.status(200).json({ data: rows });
    }

    if (req.method === 'POST') {
      const b = req.body || {};
      if (!b.nama_unit || !b.nomor_unit || !b.tanggal_komisioning || !b.petugas_komisioning || !b.no_sertifikat) {
        return res.status(400).json({ error: 'Field wajib belum lengkap (nama_unit, nomor_unit, tanggal_komisioning, petugas_komisioning, no_sertifikat).' });
      }
      const tanggalBerakhir = b.tanggal_berakhir || tambahBulan(b.tanggal_komisioning, MASA_BULAN);

      const result = await client.query(
        `INSERT INTO komisioning_unit
          (nama_unit, nomor_unit, kategori, lokasi_area, petugas_komisioning, no_sertifikat,
           tanggal_komisioning, tanggal_berakhir, file_dokumen, catatan)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         RETURNING *`,
        [b.nama_unit, b.nomor_unit, b.kategori || null, b.lokasi_area || null,
         b.petugas_komisioning, b.no_sertifikat, b.tanggal_komisioning, tanggalBerakhir,
         b.file_dokumen || null, b.catatan || null]
      );
      const row = result.rows[0];
      row.status = hitungStatus(row.tanggal_berakhir);
      return res.status(201).json({ data: row });
    }

    if (req.method === 'PUT') {
      const id = req.query.id;
      if (!id) return res.status(400).json({ error: 'Parameter id wajib diisi (?id=...).' });
      const b = req.body || {};
      const tanggalBerakhir = b.tanggal_berakhir ||
        (b.tanggal_komisioning ? tambahBulan(b.tanggal_komisioning, MASA_BULAN) : null);

      const result = await client.query(
        `UPDATE komisioning_unit SET
           nama_unit = COALESCE($1, nama_unit),
           nomor_unit = COALESCE($2, nomor_unit),
           kategori = COALESCE($3, kategori),
           lokasi_area = COALESCE($4, lokasi_area),
           petugas_komisioning = COALESCE($5, petugas_komisioning),
           no_sertifikat = COALESCE($6, no_sertifikat),
           tanggal_komisioning = COALESCE($7, tanggal_komisioning),
           tanggal_berakhir = COALESCE($8, tanggal_berakhir),
           file_dokumen = COALESCE($9, file_dokumen),
           catatan = COALESCE($10, catatan)
         WHERE id = $11
         RETURNING *`,
        [b.nama_unit, b.nomor_unit, b.kategori, b.lokasi_area, b.petugas_komisioning,
         b.no_sertifikat, b.tanggal_komisioning, tanggalBerakhir, b.file_dokumen, b.catatan, id]
      );
      if (!result.rows.length) return res.status(404).json({ error: 'Data tidak ditemukan.' });
      const row = result.rows[0];
      row.status = hitungStatus(row.tanggal_berakhir);
      return res.status(200).json({ data: row });
    }

    if (req.method === 'DELETE') {
      const id = req.query.id;
      if (!id) return res.status(400).json({ error: 'Parameter id wajib diisi (?id=...).' });
      await client.query('DELETE FROM komisioning_unit WHERE id = $1', [id]);
      return res.status(200).json({ data: { id, deleted: true } });
    }

    return res.status(405).json({ error: 'Method tidak didukung.' });
  } catch (err) {
    console.error('api/komisioning error:', err);
    return res.status(500).json({ error: err.message || 'Terjadi kesalahan server.' });
  }
};
