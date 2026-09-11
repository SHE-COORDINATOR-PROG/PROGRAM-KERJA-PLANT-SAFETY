-- Jalankan sekali di Neon SQL Editor (atau psql) sebelum deploy pertama kali.

CREATE TABLE IF NOT EXISTS komisioning_unit (
  id                    SERIAL PRIMARY KEY,
  nama_unit             TEXT NOT NULL,
  nomor_unit            TEXT NOT NULL,
  kategori              TEXT,
  lokasi_area           TEXT,
  petugas_komisioning   TEXT NOT NULL,
  no_sertifikat         TEXT NOT NULL,
  tanggal_komisioning   DATE NOT NULL,
  tanggal_berakhir      DATE NOT NULL,
  file_dokumen          TEXT,
  catatan               TEXT,
  created_at            TIMESTAMP DEFAULT now()
);

-- Index bantu untuk pencarian & filter yang sering dipakai dashboard
CREATE INDEX IF NOT EXISTS idx_komisioning_nomor_unit ON komisioning_unit (nomor_unit);
CREATE INDEX IF NOT EXISTS idx_komisioning_kategori ON komisioning_unit (kategori);
CREATE INDEX IF NOT EXISTS idx_komisioning_lokasi ON komisioning_unit (lokasi_area);
CREATE INDEX IF NOT EXISTS idx_komisioning_tgl_berakhir ON komisioning_unit (tanggal_berakhir);
