using PerpustakaanAPI.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;

namespace PerpustakaanAPI.Controllers
{
    public class LaporanController : ApiController
    {
        PerpustakaanDBEntities db = new PerpustakaanDBEntities();

        // Laporan buku dengan stok menipis
        [System.Web.Http.HttpGet]
        [System.Web.Http.Route("api/laporan/stok-menipis")]
        public IHttpActionResult GetStokMenipis()
        {
            var data = db.buku
                .Where(b => b.stok <= 5)
                .Select(b => new BukuDTO
                {
                    id_buku = b.id_buku,
                    kode_buku = b.kode_buku,
                    judul_buku = b.judul_buku,
                    penulis = b.penulis,
                    stok = b.stok ?? 0,
                    kategori = b.kategori == null ? null : new KategoriDTO
                    {
                        id_kategori = b.kategori.id_kategori,
                        nama_kategori = b.kategori.nama_kategori
                    }
                }).ToList();

            return Ok(data);
        }

        // Laporan buku paling populer (paling banyak dipinjam)
        [System.Web.Http.HttpGet]
        [System.Web.Http.Route("api/laporan/buku-populer")]
        public IHttpActionResult GetBukuPopuler()
        {
            var data = db.peminjaman
                .GroupBy(p => new { p.id_buku, p.buku.judul_buku, p.buku.penulis, p.buku.kode_buku })
                .Select(g => new BukuPopulerDTO
                {
                    id_buku = g.Key.id_buku,
                    kode_buku = g.Key.kode_buku,
                    judul_buku = g.Key.judul_buku,
                    penulis = g.Key.penulis,
                    total_dipinjam = g.Count()
                })
                .OrderByDescending(x => x.total_dipinjam)
                .Take(10)
                .ToList();

            return Ok(data);
        }

        // Laporan riwayat peminjaman per anggota
        [System.Web.Http.HttpGet]
        [System.Web.Http.Route("api/laporan/riwayat-anggota/{idAnggota}")]
        public IHttpActionResult GetRiwayatAnggota(int idAnggota)
        {
            var anggota = db.anggota.Find(idAnggota);
            if (anggota == null)
            {
                return NotFound();
            }

            var data = db.peminjaman
                .Where(p => p.id_anggota == idAnggota)
                .Select(p => new PeminjamanDTO
                {
                    id_pinjam = p.id_pinjam,
                    id_buku = p.id_buku,
                    tanggal_pinjam = p.tanggal_pinjam.ToString(),
                    tanggal_kembali = p.tanggal_kembali == null
                                      ? null
                                      : p.tanggal_kembali.ToString(),
                    status = p.status,
                    buku = p.buku == null ? null : new BukuDTO
                    {
                        id_buku = p.buku.id_buku,
                        kode_buku = p.buku.kode_buku,
                        judul_buku = p.buku.judul_buku,
                        penulis = p.buku.penulis
                    },
                    petugas = p.users == null ? null : new UsersDTO
                    {
                        id_user = p.users.id_user,
                        nama_lengkap = p.users.nama_lengkap
                    }
                })
                .OrderByDescending(p => p.tanggal_pinjam)
                .ToList();

            var response = new RiwayatAnggotaResponseDTO
            {
                anggota = new AnggotaDTO
                {
                    id_anggota = anggota.id_anggota,
                    nama_anggota = anggota.nama_anggota,
                    alamat = anggota.alamat,
                    telp = anggota.telp
                },
                riwayat_peminjaman = data
            };

            return Ok(response);
        }

        // Dashboard: Statistik perpustakaan
        [System.Web.Http.HttpGet]
        [System.Web.Http.Route("api/laporan/dashboard")]
        public IHttpActionResult GetDashboard()
        {
            var totalBuku = db.buku.Count();
            var totalAnggota = db.anggota.Count();
            var peminjamanAktif = db.peminjaman.Count(p => p.status == "Dipinjam");
            var totalPeminjaman = db.peminjaman.Count();
            var bukuStokMenipis = db.buku.Count(b => b.stok <= 5);

            var response = new DashboardResponseDTO
            {
                total_buku = totalBuku,
                total_anggota = totalAnggota,
                peminjaman_aktif = peminjamanAktif,
                total_peminjaman = totalPeminjaman,
                buku_stok_menipis = bukuStokMenipis
            };

            return Ok(response);
        }
    }
}
