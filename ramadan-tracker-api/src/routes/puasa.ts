import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import db from "../db";

const puasa = new Hono();

const puasaSchema = z.object({
  tanggal: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal: YYYY-MM-DD"),
  status: z.enum(["penuh", "qadha", "batal"]),
  catatan: z.string().optional(),
});

// GET /api/fast — All fast records
puasa.get("/", (c) => {
  const data = db.query("SELECT * FROM puasa ORDER BY tanggal DESC").all();
  return c.json({ success: true, data });
});

// GET /api/fast/summary — Summary of the fast
puasa.get("/summary", (c) => {
  const total = db.query("SELECT COUNT(*) as total FROM puasa").get() as any;
  const penuh = db
    .query("SELECT COUNT(*) as total FROM puasa WHERE status = 'penuh'")
    .get() as any;
  const qadha = db
    .query("SELECT COUNT(*) as total FROM puasa WHERE status = 'qadha'")
    .get() as any;
  const batal = db
    .query("SELECT COUNT(*) as total FROM puasa WHERE status = 'batal'")
    .get() as any;

  return c.json({
    success: true,
    data: {
      total_hari: total.total,
      penuh: penuh.total,
      qadha: qadha.total,
      batal: batal.total,
      persentase:
        total.total > 0 ? Math.round((penuh.total / total.total) * 100) : 0,
    },
  });
});

// GET /api/puasa/:id — Fasting details
puasa.get("/:id", (c) => {
  const id = c.req.param("id");
  const data = db.query("SELECT * FROM puasa WHERE id = ?").get(id);

  if (!data)
    return c.json({ success: false, message: "Data tidak ditemukan" }, 404);
  return c.json({ success: true, data });
});

// POST /api/fasting — Add fasting record
puasa.post("/", zValidator("json", puasaSchema), (c) => {
  const { tanggal, status, catatan } = c.req.valid("json");

  try {
    const result = db.run(
      "INSERT INTO puasa ( tanggal, status, catatan) VALUES (?, ?, ?)",
      [tanggal, status, catatan ?? null],
    );
    const data = db
      .query("SELECT * FROM puasa WHERE id = ?")
      .get(result.lastInsertRowid);
    return c.json(
      { success: true, message: "Catatan puasa berhasil ditambahkan", data },
      201,
    );
  } catch (e: any) {
    if (e.message.includes("UNIQUE")) {
      return c.json(
        { success: false, message: `Tanggal ${tanggal} sudah dicatat` },
        409,
      );
    }
    return c.json({ success: false, message: "Gagal menyimpan data" }, 500);
  }
});

// PUT /api/puasa/:id — Update fasting records
puasa.put("/:id", zValidator("json", puasaSchema.partial()), (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");

  const existing = db.query("SELECT * FROM puasa WHERE id = ?").get(id) as any;
  if (!existing)
    return c.json({ success: false, message: "Data tidak ditemukan" }, 404);

  const updated = { ...existing, ...body };
  db.run("UPDATE puasa SET tanggal = ?, status = ?, catatan = ? WHERE id = ?", [
    updated.tanggal,
    updated.status,
    updated.catatan ?? null,
    id,
  ]);

  const data = db.query("SELECT * FROM puasa WHERE id = ?").get(id);
  return c.json({
    success: true,
    message: "Catatan puasa berhasil diupdate",
    data,
  });
});

// DELETE /api/puasa/:id — Delete fasting record
puasa.delete("/:id", (c) => {
  const id = c.req.param("id");
  const existing = db.query("SELECT * FROM puasa WHERE id = ?").get(id);
  if (!existing)
    return c.json({ success: false, message: "Data tidak ditemukan" }, 404);

  db.run("DELETE FROM puasa WHERE id = ?", [id]);
  return c.json({ success: true, message: "Catatan puasa berhasil dihapus" });
});

export default puasa;
