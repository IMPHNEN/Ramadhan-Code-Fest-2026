import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import db from "../db";

const target = new Hono();

const targetSchema = z.object({
  nama: z.string().min(1, "Nama target wajib diisi"),
  deskripsi: z.string().optional(),
  target_nilai: z.number().int().positive("Target nilai harus lebih dari 0"),
  satuan: z.string().min(1, "Satuan wajib diisi"),
});

const progressSchema = z.object({
  tambah_nilai: z.number().int().positive("Nilai harus lebih dari 0"),
});

// GET /api/target — All targets
target.get("/", (c) => {
  const data = db.query("SELECT * FROM target ORDER BY created_at DESC").all();
  return c.json({ success: true, data });
});

// GET /api/target/progress — Progress of all targets
target.get("/progress", (c) => {
  const data = db
    .query("SELECT * FROM target ORDER BY created_at DESC")
    .all() as any[];

  const result = data.map((t) => ({
    ...t,
    persentase: Math.min(
      Math.round((t.current_nilai / t.target_nilai) * 100),
      100,
    ),
    status: t.current_nilai >= t.target_nilai ? "Tercapai" : "On Progess",
    sisa: Math.max(t.target_nilai - t.current_nilai, 0),
  }));

  const tercapai = result.filter(
    (t) => t.current_nilai >= t.target_nilai,
  ).length;

  return c.json({
    success: true,
    data: {
      ringkasan: {
        total_target: result.length,
        tercapai,
        belum_tercapai: result.length - tercapai,
      },
      targets: result,
    },
  });
});

// GET /api/target/:id — Target details
target.get("/:id", (c) => {
  const id = c.req.param("id");
  const data = db.query("SELECT * FROM target WHERE id = ?").get(id) as any;

  if (!data)
    return c.json({ success: false, message: "Target tidak ditemukan" }, 404);

  return c.json({
    success: true,
    data: {
      ...data,
      persentase: Math.min(
        Math.round((data.current_nilai / data.target_nilai) * 100),
        100,
      ),
      status:
        data.current_nilai >= data.target_nilai ? "Tercapai" : "On Progress",
      sisa: Math.max(data.target_nilai - data.current_nilai, 0),
    },
  });
});

// POST /api/target — Create a new target
target.post("/", zValidator("json", targetSchema), (c) => {
  const { nama, deskripsi, target_nilai, satuan } = c.req.valid("json");

  const result = db.run(
    "INSERT INTO target (nama, deskripsi, target_nilai, satuan) VALUES (?, ?, ?, ?)",
    [nama, deskripsi ?? null, target_nilai, satuan],
  );

  const data = db
    .query("SELECT * FROM target WHERE id = ?")
    .get(result.lastInsertRowid);
  return c.json(
    { success: true, message: "Target berhasil dibuat", data },
    201,
  );
});

// PATCH /api/target/:id/progress — Update target progress
target.patch("/:id/progress", zValidator("json", progressSchema), (c) => {
  const id = c.req.param("id");
  const { tambah_nilai } = c.req.valid("json");

  const existing = db.query("SELECT * FROM target WHERE id = ?").get(id) as any;
  if (!existing)
    return c.json({ success: false, message: "Target tidak ditemukan" }, 404);

  const new_nilai = existing.current_nilai + tambah_nilai;
  db.run("UPDATE target SET current_nilai = ? WHERE id = ?", [new_nilai, id]);

  const data = db.query("SELECT * FROM target WHERE id = ?").get(id) as any;
  const tercapai = data.current_nilai >= data.target_nilai;

  return c.json({
    success: true,
    message: tercapai ? "Target tercapai!" : "Progress berhasil diupdate",
    data: {
      ...data,
      persentase: Math.min(
        Math.round((data.current_nilai / data.target_nilai) * 100),
        100,
      ),
      status: tercapai ? "Tercapai" : "On Progress",
    },
  });
});

// PUT /api/target/:id — Edit target
target.put("/:id", zValidator("json", targetSchema.partial()), (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");

  const existing = db.query("SELECT * FROM target WHERE id = ?").get(id) as any;
  if (!existing)
    return c.json({ success: false, message: "Target tidak ditemukan" }, 404);

  const updated = { ...existing, ...body };
  db.run(
    "UPDATE target SET nama = ?, deskripsi = ?, target_nilai = ?, satuan = ? WHERE id = ?",
    [
      updated.nama,
      updated.deskripsi ?? null,
      updated.target_nilai,
      updated.satuan,
      id,
    ],
  );

  const data = db.query("SELECT * FROM target WHERE id = ?").get(id);
  return c.json({ success: true, message: "Target berhasil diupdate", data });
});

// DELETE /api/target/:id — Delete target
target.delete("/:id", (c) => {
  const id = c.req.param("id");
  const existing = db.query("SELECT * FROM target WHERE id = ?").get(id);
  if (!existing)
    return c.json({ success: false, message: "Target tidak ditemukan" }, 404);

  db.run("DELETE FROM target WHERE id = ?", [id]);
  return c.json({ success: true, message: "Target berhasil ditemukan" });
});

export default target;
