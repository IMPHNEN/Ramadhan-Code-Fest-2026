using PerpustakaanAPI.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;

namespace PerpustakaanAPI.Controllers
{
    public class PeminjamanController : ApiController
    {
        PerpustakaanDBEntities db = new PerpustakaanDBEntities();
        public PeminjamanController()
        {
            db.Configuration.LazyLoadingEnabled = false;
            db.Configuration.ProxyCreationEnabled = false;
        }

        [System.Web.Http.HttpGet]
        [System.Web.Http.Route("api/peminjaman")]
        public IHttpActionResult GetPeminjaman()
        {
            var data = db.peminjaman.Select(p => new PeminjamanDTO
            {
                id_pinjam = p.id_pinjam,
                id_anggota = p.id_anggota,
                id_user = p.id_user,
                id_buku = p.id_buku,
                tanggal_pinjam = p.tanggal_pinjam.ToString(),
                tanggal_kembali = p.tanggal_kembali == null
                                  ? null
                                  : p.tanggal_kembali.ToString(),
                status = p.status,

                anggota = p.anggota == null ? null : new AnggotaDTO
                {
                    id_anggota = p.anggota.id_anggota,
                    nama_anggota = p.anggota.nama_anggota
                },

                petugas = p.users == null ? null : new UsersDTO
                {
                    id_user = p.users.id_user,
                    username = p.users.username,
                    nama_lengkap = p.users.nama_lengkap,
                    role = p.users.role
                },

                buku = p.buku == null ? null : new BukuDTO
                {
                    id_buku = p.buku.id_buku,
                    kode_buku = p.buku.kode_buku,
                    judul_buku = p.buku.judul_buku,
                    penulis = p.buku.penulis
                }
            }).ToList();

            return Ok(data);
        }

        [System.Web.Http.HttpPost]
        [System.Web.Http.Route("api/peminjaman")]
        public IHttpActionResult CreatePeminjaman(PeminjamanCreateDTO dto)
        {
            if (dto == null)
            {
                return BadRequest("Data peminjaman tidak lengkap");
            }

            var anggota = db.anggota.Find(dto.id_anggota);
            if (anggota == null)
            {
                return BadRequest("Anggota tidak ditemukan");
            }

            var petugas = db.users.Find(dto.id_user);
            if (petugas == null)
            {
                return BadRequest("Petugas tidak ditemukan");
            }

            var buku = db.buku.Find(dto.id_buku);
            if (buku == null)
            {
                return BadRequest("Buku tidak ditemukan");
            }

            if (buku.stok < 1)
            {
                return BadRequest($"Stok buku '{buku.judul_buku}' habis. Stok tersedia: {buku.stok}");
            }

            var adaPeminjamanAktif = db.peminjaman
                .Any(pm => pm.id_anggota == dto.id_anggota && 
                           pm.id_buku == dto.id_buku && 
                           pm.status == "Dipinjam");

            if (adaPeminjamanAktif)
            {
                return BadRequest($"Anggota masih meminjam buku '{buku.judul_buku}' dan belum mengembalikan");
            }

            DateTime? tanggalKembali = string.IsNullOrEmpty(dto.tanggal_kembali)
                ? (DateTime?)null
                : DateTime.Parse(dto.tanggal_kembali);

            peminjaman p = new peminjaman
            {
                id_anggota = dto.id_anggota,
                id_user = dto.id_user,
                id_buku = dto.id_buku,
                tanggal_pinjam = DateTime.Now,
                tanggal_kembali = tanggalKembali,
                status = "Dipinjam"
            };

            db.peminjaman.Add(p);
            
            buku.stok -= 1;
            
            db.SaveChanges();

            var response = new PeminjamanResponseDTO
            {
                message = "Peminjaman berhasil dibuat",
                id_pinjam = p.id_pinjam,
                id_anggota = dto.id_anggota,
                nama_anggota = anggota.nama_anggota,
                id_buku = dto.id_buku,
                judul_buku = buku.judul_buku,
                tanggal_pinjam = p.tanggal_pinjam.ToString(),
                tanggal_kembali = p.tanggal_kembali.HasValue ? p.tanggal_kembali.Value.ToString() : null,
                stok_tersisa = buku.stok
            };

            return Ok(response);
        }

        [System.Web.Http.HttpPut]
        [System.Web.Http.Route("api/peminjaman/kembalikan/{id}")]
        public IHttpActionResult KembalikanBuku(int id)
        {
            var peminjaman = db.peminjaman.Find(id);
            if (peminjaman == null)
            {
                return NotFound();
            }

            if (peminjaman.status == "Dikembalikan")
            {
                return BadRequest("Buku sudah dikembalikan sebelumnya");
            }

            peminjaman.status = "Dikembalikan";
            peminjaman.tanggal_kembali = DateTime.Now;

            var buku = db.buku.Find(peminjaman.id_buku);
            if (buku != null)
            {
                buku.stok += 1;
            }

            db.SaveChanges();

            var response = new KembalikanBukuResponseDTO
            {
                message = "Buku berhasil dikembalikan",
                id_pinjam = peminjaman.id_pinjam,
                judul_buku = buku.judul_buku,
                tanggal_kembali = peminjaman.tanggal_kembali.Value.ToString(),
                stok_sekarang = buku.stok ?? 0
            };

            return Ok(response);
        }

        [System.Web.Http.HttpGet]
        [System.Web.Http.Route("api/peminjaman/aktif")]
        public IHttpActionResult GetPeminjamanAktif()
        {
            var data = db.peminjaman
                .Where(p => p.status == "Dipinjam")
                .Select(p => new PeminjamanDTO
                {
                    id_pinjam = p.id_pinjam,
                    id_anggota = p.id_anggota,
                    id_user = p.id_user,
                    id_buku = p.id_buku,
                    tanggal_pinjam = p.tanggal_pinjam.ToString(),
                    tanggal_kembali = p.tanggal_kembali == null
                                      ? null
                                      : p.tanggal_kembali.ToString(),
                    status = p.status,

                    anggota = p.anggota == null ? null : new AnggotaDTO
                    {
                        id_anggota = p.anggota.id_anggota,
                        nama_anggota = p.anggota.nama_anggota
                    },

                    petugas = p.users == null ? null : new UsersDTO
                    {
                        id_user = p.users.id_user,
                        username = p.users.username,
                        nama_lengkap = p.users.nama_lengkap,
                        role = p.users.role
                    },

                    buku = p.buku == null ? null : new BukuDTO
                    {
                        id_buku = p.buku.id_buku,
                        kode_buku = p.buku.kode_buku,
                        judul_buku = p.buku.judul_buku,
                        penulis = p.buku.penulis
                    }
                }).ToList();

            return Ok(data);
        }

        [System.Web.Http.HttpGet]
        [System.Web.Http.Route("api/peminjaman/{id}")]
        public IHttpActionResult GetPeminjamanById(int id)
        {
            var peminjaman = db.peminjaman.Find(id);
            if (peminjaman == null)
            {
                return NotFound();
            }

            var data = new PeminjamanDTO
            {
                id_pinjam = peminjaman.id_pinjam,
                id_anggota = peminjaman.id_anggota,
                id_user = peminjaman.id_user,
                id_buku = peminjaman.id_buku,
                tanggal_pinjam = peminjaman.tanggal_pinjam.ToString(),
                tanggal_kembali = peminjaman.tanggal_kembali == null
                                  ? null
                                  : peminjaman.tanggal_kembali.ToString(),
                status = peminjaman.status,

                anggota = peminjaman.anggota == null ? null : new AnggotaDTO
                {
                    id_anggota = peminjaman.anggota.id_anggota,
                    nama_anggota = peminjaman.anggota.nama_anggota,
                    alamat = peminjaman.anggota.alamat,
                    telp = peminjaman.anggota.telp,
                    tanggal_daftar = peminjaman.anggota.tanggal_daftar.ToString()
                },

                petugas = peminjaman.users == null ? null : new UsersDTO
                {
                    id_user = peminjaman.users.id_user,
                    username = peminjaman.users.username,
                    nama_lengkap = peminjaman.users.nama_lengkap,
                    role = peminjaman.users.role
                },

                buku = peminjaman.buku == null ? null : new BukuDTO
                {
                    id_buku = peminjaman.buku.id_buku,
                    kode_buku = peminjaman.buku.kode_buku,
                    judul_buku = peminjaman.buku.judul_buku,
                    penulis = peminjaman.buku.penulis,
                    stok = peminjaman.buku.stok ?? 0,
                    id_kategori = peminjaman.buku.id_kategori,
                    kategori = peminjaman.buku.kategori == null ? null : new KategoriDTO
                    {
                        id_kategori = peminjaman.buku.kategori.id_kategori,
                        nama_kategori = peminjaman.buku.kategori.nama_kategori
                    }
                }
            };

            return Ok(data);
        }

        [System.Web.Http.HttpDelete]
        [System.Web.Http.Route("api/peminjaman/{id}")]
        public IHttpActionResult DeletePeminjaman(int id)
        {
            var peminjaman = db.peminjaman.Find(id);
            if (peminjaman == null)
            {
                return NotFound();
            }

            // Jika status masih "Dipinjam", kembalikan stok buku terlebih dahulu
            if (peminjaman.status == "Dipinjam")
            {
                var buku = db.buku.Find(peminjaman.id_buku);
                if (buku != null)
                {
                    buku.stok += 1;
                }
            }

            // Simpan info untuk response
            var judulBuku = peminjaman.buku != null ? peminjaman.buku.judul_buku : "Unknown";
            var namaAnggota = peminjaman.anggota != null ? peminjaman.anggota.nama_anggota : "Unknown";
            var statusSebelumnya = peminjaman.status;

            // Hapus peminjaman
            db.peminjaman.Remove(peminjaman);
            db.SaveChanges();

            var response = new DeletePeminjamanResponseDTO
            {
                message = "Data peminjaman berhasil dihapus",
                id_pinjam = id,
                judul_buku = judulBuku,
                nama_anggota = namaAnggota,
                status_sebelumnya = statusSebelumnya
            };

            return Ok(response);
        }
    }
}
