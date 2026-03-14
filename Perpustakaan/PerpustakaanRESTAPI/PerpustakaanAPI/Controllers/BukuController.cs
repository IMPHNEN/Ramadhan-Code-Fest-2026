using PerpustakaanAPI.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;


namespace PerpustakaanAPI.Controllers
{
    public class BukuController : ApiController
    {
        PerpustakaanDBEntities db = new PerpustakaanDBEntities();

        [System.Web.Http.HttpGet]
        [System.Web.Http.Route("api/buku")]
        public IHttpActionResult GetBuku(string search = "")
        {
            var query = db.buku.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(b =>
                    b.judul_buku.Contains(search) ||
                    b.penulis.Contains(search) ||
                    b.kode_buku.Contains(search)
                );
            }

            var data = query.Select(b => new BukuDTO
            {
                id_buku = b.id_buku,
                kode_buku = b.kode_buku,
                judul_buku = b.judul_buku,
                penulis = b.penulis,
                stok = b.stok ?? 0,
                id_kategori = b.id_kategori,

                kategori = b.kategori == null ? null : new KategoriDTO
                {
                    id_kategori = b.kategori.id_kategori,
                    nama_kategori = b.kategori.nama_kategori
                }
            }).ToList();

            return Ok(data);
        }

        [System.Web.Http.HttpGet]
        [System.Web.Http.Route("api/buku/{id}")]
        public IHttpActionResult GetBukuById(int id)
        {
            var buku = db.buku.Find(id);
            if (buku == null)
            {
                return NotFound();
            }

            var data = new BukuDTO
            {
                id_buku = buku.id_buku,
                kode_buku = buku.kode_buku,
                judul_buku = buku.judul_buku,
                penulis = buku.penulis,
                stok = buku.stok ?? 0,
                id_kategori = buku.id_kategori,

                kategori = buku.kategori == null ? null : new KategoriDTO
                {
                    id_kategori = buku.kategori.id_kategori,
                    nama_kategori = buku.kategori.nama_kategori
                }
            };

            return Ok(data);
        }

        [System.Web.Http.HttpPost]
        [System.Web.Http.Route("api/buku")]
        public IHttpActionResult AddBuku(BukuDTO dto)
        {
            if (dto == null)
            {
                return BadRequest("Data buku kosong");
            }

            if (string.IsNullOrEmpty(dto.kode_buku))
            {
                return BadRequest("Kode buku wajib diisi");
            }

            if (string.IsNullOrEmpty(dto.judul_buku))
            {
                return BadRequest("Judul buku wajib diisi");
            }

            if (string.IsNullOrEmpty(dto.penulis))
            {
                return BadRequest("Penulis wajib diisi");
            }

            if (dto.id_kategori == null || dto.id_kategori == 0)
            {
                return BadRequest("Kategori wajib dipilih");
            }

            var kategoriExists = db.kategori.Any(k => k.id_kategori == dto.id_kategori);
            if (!kategoriExists)
            {
                return BadRequest($"Kategori dengan ID {dto.id_kategori} tidak ditemukan");
            }

            var kodeBukuExists = db.buku.Any(bk => bk.kode_buku == dto.kode_buku);
            if (kodeBukuExists)
            {
                return BadRequest($"Kode buku '{dto.kode_buku}' sudah digunakan");
            }

            buku b = new buku
            {
                kode_buku = dto.kode_buku,
                judul_buku = dto.judul_buku,
                penulis = dto.penulis,
                id_kategori = dto.id_kategori,
                stok = dto.stok
            };

            db.buku.Add(b);
            db.SaveChanges();

            var response = new BukuResponseDTO
            {
                message = "Buku berhasil ditambahkan",
                id_buku = b.id_buku,
                kode_buku = b.kode_buku,
                judul_buku = b.judul_buku
            };

            return Ok(response);
        }

        [System.Web.Http.HttpPut]
        [System.Web.Http.Route("api/buku/{id}")]
        public IHttpActionResult UpdateBuku(int id, BukuDTO dto)
        {
            var buku = db.buku.Find(id);
            if (buku == null)
            {
                return NotFound();
            }

            buku.kode_buku = dto.kode_buku;
            buku.judul_buku = dto.judul_buku;
            buku.penulis = dto.penulis;
            buku.id_kategori = dto.id_kategori;
            buku.stok = dto.stok;

            db.SaveChanges();

            return Ok("Buku berhasil diupdate");
        }

        [System.Web.Http.HttpDelete]
        [System.Web.Http.Route("api/buku/{id}")]
        public IHttpActionResult DeleteBuku(int id)
        {
            var buku = db.buku.Find(id);
            if (buku == null)
            {
                return NotFound();
            }

            // Cek apakah buku sedang dipinjam
            var sedangDipinjam = db.peminjaman
                .Any(p => p.id_buku == id && p.status == "Dipinjam");

            if (sedangDipinjam)
            {
                return BadRequest("Buku sedang dipinjam, tidak dapat dihapus");
            }

            db.buku.Remove(buku);
            db.SaveChanges();

            return Ok("Buku berhasil dihapus");
        }
    }
}