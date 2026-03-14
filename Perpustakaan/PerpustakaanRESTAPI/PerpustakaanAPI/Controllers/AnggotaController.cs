using PerpustakaanAPI.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;

namespace PerpustakaanAPI.Controllers
{
    public class AnggotaController : ApiController
    {
        PerpustakaanDBEntities db = new PerpustakaanDBEntities();

        [System.Web.Http.HttpGet]
        [System.Web.Http.Route("api/anggota")]
        public IHttpActionResult GetAnggota(string search = "")
        {
            var query = db.anggota.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(a =>
                    a.nama_anggota.Contains(search) ||
                    a.alamat.Contains(search) ||
                    a.telp.Contains(search)
                );
            }

            var data = query.Select(a => new AnggotaDTO
            {
                id_anggota = a.id_anggota,
                nama_anggota = a.nama_anggota,
                alamat = a.alamat,
                telp = a.telp,
                tanggal_daftar = a.tanggal_daftar.ToString()
            }).ToList();

            return Ok(data);
        }

        [System.Web.Http.HttpGet]
        [System.Web.Http.Route("api/anggota/{id}")]
        public IHttpActionResult GetAnggotaById(int id)
        {
            var anggota = db.anggota.Find(id);
            if (anggota == null)
            {
                return NotFound();
            }

            var data = new AnggotaDTO
            {
                id_anggota = anggota.id_anggota,
                nama_anggota = anggota.nama_anggota,
                alamat = anggota.alamat,
                telp = anggota.telp,
                tanggal_daftar = anggota.tanggal_daftar.ToString()
            };

            return Ok(data);
        }

        [System.Web.Http.HttpPost]
        [System.Web.Http.Route("api/anggota")]
        public IHttpActionResult AddAnggota(AnggotaDTO dto)
        {
            if (dto == null)
            {
                return BadRequest("Data anggota kosong");
            }

            if (string.IsNullOrEmpty(dto.nama_anggota))
            {
                return BadRequest("Nama anggota wajib diisi");
            }

            if (string.IsNullOrEmpty(dto.alamat))
            {
                return BadRequest("Alamat wajib diisi");
            }

            if (string.IsNullOrEmpty(dto.telp))
            {
                return BadRequest("Nomor telepon wajib diisi");
            }

            // Validasi nomor telepon (hanya angka)
            if (!System.Text.RegularExpressions.Regex.IsMatch(dto.telp, @"^\d+$"))
            {
                return BadRequest("Nomor telepon hanya boleh berisi angka");
            }

            // Validasi panjang nomor telepon (minimal 10 digit, maksimal 15 digit)
            if (dto.telp.Length < 10 || dto.telp.Length > 15)
            {
                return BadRequest("Nomor telepon harus memiliki 10-15 digit");
            }

            anggota a = new anggota
            {
                nama_anggota = dto.nama_anggota,
                alamat = dto.alamat,
                telp = dto.telp,
                tanggal_daftar = DateTime.Now
            };

            db.anggota.Add(a);
            db.SaveChanges();

            var response = new AnggotaResponseDTO
            {
                message = "Anggota berhasil ditambahkan",
                id_anggota = a.id_anggota,
                nama_anggota = a.nama_anggota,
                tanggal_daftar = a.tanggal_daftar.ToString()
            };

            return Ok(response);
        }

        [System.Web.Http.HttpPut]
        [System.Web.Http.Route("api/anggota/{id}")]
        public IHttpActionResult UpdateAnggota(int id, AnggotaDTO dto)
        {
            var anggota = db.anggota.Find(id);
            if (anggota == null)
            {
                return NotFound();
            }

            if (string.IsNullOrEmpty(dto.nama_anggota))
            {
                return BadRequest("Nama anggota wajib diisi");
            }

            if (string.IsNullOrEmpty(dto.alamat))
            {
                return BadRequest("Alamat wajib diisi");
            }

            if (string.IsNullOrEmpty(dto.telp))
            {
                return BadRequest("Nomor telepon wajib diisi");
            }

            // Validasi nomor telepon (hanya angka)
            if (!System.Text.RegularExpressions.Regex.IsMatch(dto.telp, @"^\d+$"))
            {
                return BadRequest("Nomor telepon hanya boleh berisi angka");
            }

            // Validasi panjang nomor telepon (minimal 10 digit, maksimal 15 digit)
            if (dto.telp.Length < 10 || dto.telp.Length > 15)
            {
                return BadRequest("Nomor telepon harus memiliki 10-15 digit");
            }

            anggota.nama_anggota = dto.nama_anggota;
            anggota.alamat = dto.alamat;
            anggota.telp = dto.telp;

            if (!string.IsNullOrEmpty(dto.tanggal_daftar))
            {
                anggota.tanggal_daftar = System.DateTime.Parse(dto.tanggal_daftar);
            }

            db.SaveChanges();

            return Ok("Anggota berhasil diupdate");
        }

        [System.Web.Http.HttpDelete]
        [System.Web.Http.Route("api/anggota/{id}")]
        public IHttpActionResult DeleteAnggota(int id)
        {
            var anggota = db.anggota.Find(id);
            if (anggota == null)
            {
                return NotFound();
            }

            // Cek apakah anggota memiliki peminjaman aktif
            var adaPeminjamanAktif = db.peminjaman
                .Any(p => p.id_anggota == id && p.status == "Dipinjam");

            if (adaPeminjamanAktif)
            {
                return BadRequest("Anggota masih memiliki peminjaman aktif, tidak dapat dihapus");
            }

            db.anggota.Remove(anggota);
            db.SaveChanges();

            return Ok("Anggota berhasil dihapus");
        }
    }
}