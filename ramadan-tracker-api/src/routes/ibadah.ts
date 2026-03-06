import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import db from "../db";

const ibadah = new Hono();

const ibadahSchema = z.object({
  tanggal: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal: YYYY-MM-DD"),
  jenis: z.enum([
    "subuh",
    "dzuhur",
    "ashar",
    "maghrib",
    "isya",
    "tarawih",
    "tahajud",
    "tilawah",
    "dzikir",
  ]),
  status: z.boolean(),
  jumlah: z.string().nullable().optional(),
  catatan: z.string().optional(),
});

// GET /api/worship — All worship history
ibadah.get("/", (c) => {
  const data = db.query("SELECT * FROM ibadah ORDER BY tanggal DESC").all();
  return c.json({ success: true, data });
});

// GET /api/worship/today — Today's worship
ibadah.get("hari-ini", (c) => {
  const today = new Date().toLocaleDateString("sv-SE");
  const data = db.query("SELECT * FROM ibadah WHERE tanggal = ?").all(today);

  const jenisList = [
    "subuh",
    "dzuhur",
    "ashar",
    "maghrib",
    "isya",
    "tarawih",
    "tahajud",
    "tilawah",
    "dzikir",
  ];
  const sudahDicatat = (data as any[]).map((d) => d.jenis);
  const belumDicatat = jenisList.filter((j) => !sudahDicatat.includes(j));

  return c.json({
    success: true,
    data: {
      tanggal: today,
      ibadah: data,
      sudah_dicatat: sudahDicatat,
      belum_dicatat: belumDicatat,
    },
  });
});

// GET /api/ibadah/rekap/:date — Recap of worship by date
ibadah.get("/rekap/:tanggal", (c) => {
  const tanggal = c.req.param("tanggal");
  const data = db
    .query("SELECT * FROM ibadah WHERE tanggal = ? ORDER BY jenis")
    .all(tanggal);

  if (!data.length)
    return c.json(
      { success: false, message: "Tidak ada data pada tanggal ini" },
      404,
    );

  const total = (data as any[]).length;
  const selesai = (data as any[]).filter((d) => d.status === 1).length;

  return c.json({
    success: true,
    data: {
      tanggal,
      ibadah: data,
      ringkasan: {
        total,
        selesai,
        belum: total - selesai,
        persentase: Math.round((selesai / total) * 100),
      },
    },
  });
});

// POST /api/worship — Record worship
ibadah.post("/", zValidator("json", ibadahSchema), (c) => {
  const { tanggal, jenis, status, jumlah, catatan } = c.req.valid("json");

  // check for duplicates date and type
  const existing = db
    .query("SELECT * FROM ibadah WHERE tanggal = ? AND jenis = ?")
    .get(tanggal, jenis);

  if (existing) {
    return c.json(
      {
        success: false,
        message: `Ibadah ${jenis} pada ${tanggal} sudah dicatat`,
      },
      409,
    );
  }

  const result = db.run(
    "INSERT INTO ibadah (tanggal, jenis, status, jumlah, catatan) VALUES (?, ?, ?, ?, ?)",
    [tanggal, jenis, status ? 1 : 0, jumlah ?? null, catatan ?? null],
  );

  const data = db
    .query("SELECT * FROM ibadah WHERE id = ?")
    .get(result.lastInsertRowid);
  return c.json(
    { success: true, message: "Ibadah berhasil dicatat", data },
    201,
  );
});

// PUT /api/ibadah/:id — Update worship records
ibadah.put("/:id", zValidator("json", ibadahSchema.partial()), (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");

  const existing = db.query("SELECT * FROM ibadah WHERE id = ?").get(id) as any;
  if (!existing)
    return c.json({ success: false, message: "Data tidak ditemukan" }, 404);

  const updated = { ...existing, ...body };
  db.run(
    "UPDATE ibadah SET tanggal = ?, jenis = ?, status = ?, jumlah = ?, catatan = ? WHERE id = ?",
    [
      updated.tanggal,
      updated.jenis,
      updated.status ? 1 : 0,
      updated.jumlah ?? null,
      updated.catatan ?? null,
      id,
    ],
  );

  const data = db.query("SELECT * FROM ibadah WHERE id = ?").get(id);
  return c.json({
    success: true,
    message: "Catatan ibadah berhasil diupdate",
    data,
  });
});

// DELETE /api/ibadah/:id — Delete worship record
ibadah.delete("/:id", (c) => {
  const id = c.req.param("id");
  const existing = db.query("SELECT * FROM ibadah WHERE id = ?").get(id);
  if (!existing)
    return c.json({ success: false, message: "Data tidak ditemukan" }, 404);

  db.run("DELETE FROM ibadah WHERE id = ?", [id]);
  return c.json({ success: true, message: "Catatan ibadah berhasil dihapus" });
});

export default ibadah;
