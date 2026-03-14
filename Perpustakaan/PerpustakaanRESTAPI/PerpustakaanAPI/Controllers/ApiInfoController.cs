using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;

namespace PerpustakaanAPI.Controllers
{
    /// <summary>
    /// API Documentation & Information Controller
    /// Akses: GET /api
    /// </summary>
    public class ApiInfoController : ApiController
    {
        // GET: api (Root endpoint - API Info)
        [HttpGet]
        [Route("api")]
        public IHttpActionResult GetApiInfo()
        {
            return Ok(new
            {
                api_name = "Perpustakaan API",
                version = "1.0.0",
                description = "REST API untuk Sistem Manajemen Perpustakaan",
                author = "Your Name",
                documentation = "/api/endpoints",
                base_url = Request.RequestUri.GetLeftPart(UriPartial.Authority),
                timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")
            });
        }

        // GET: api/endpoints (List semua endpoint)
        [HttpGet]
        [Route("api/endpoints")]
        public IHttpActionResult GetEndpoints()
        {
            var endpoints = new
            {
                authentication = new
                {
                    title = "Authentication",
                    endpoints = new[]
                    {
                        new { method = "POST", path = "/api/auth/login", description = "Login user (admin/petugas)", auth = "Public" }
                    }
                },
                
                users = new
                {
                    title = "User Management",
                    endpoints = new[]
                    {
                        new { method = "GET", path = "/api/users", description = "Daftar semua user", auth = "Admin" },
                        new { method = "GET", path = "/api/users/{id}", description = "Detail user by ID", auth = "Admin" },
                        new { method = "GET", path = "/api/users/petugas", description = "Daftar petugas", auth = "Admin, Petugas" },
                        new { method = "POST", path = "/api/users/register", description = "Register user baru", auth = "Admin" },
                        new { method = "PUT", path = "/api/users/{id}", description = "Update user", auth = "Admin" },
                        new { method = "DELETE", path = "/api/users/{id}", description = "Hapus user", auth = "Admin" },
                        new { method = "POST", path = "/api/users/change-password", description = "Ganti password", auth = "Admin, Petugas" }
                    }
                },

                kategori = new
                {
                    title = "Kategori Buku",
                    endpoints = new[]
                    {
                        new { method = "GET", path = "/api/kategori", description = "Daftar semua kategori (support search: ?search=nama)", auth = "Public" },
                        new { method = "GET", path = "/api/kategori/{id}", description = "Detail kategori by ID", auth = "Public" },
                        new { method = "POST", path = "/api/kategori", description = "Tambah kategori baru", auth = "Admin, Petugas" },
                        new { method = "PUT", path = "/api/kategori/{id}", description = "Update kategori", auth = "Admin, Petugas" },
                        new { method = "DELETE", path = "/api/kategori/{id}", description = "Hapus kategori", auth = "Admin" }
                    }
                },

                buku = new
                {
                    title = "Manajemen Buku",
                    endpoints = new[]
                    {
                        new { method = "GET", path = "/api/buku", description = "Daftar semua buku (support search: ?search=keyword)", auth = "Public" },
                        new { method = "GET", path = "/api/buku/{id}", description = "Detail buku by ID", auth = "Public" },
                        new { method = "POST", path = "/api/buku", description = "Tambah buku baru", auth = "Admin, Petugas" },
                        new { method = "PUT", path = "/api/buku/{id}", description = "Update buku", auth = "Admin, Petugas" },
                        new { method = "DELETE", path = "/api/buku/{id}", description = "Hapus buku", auth = "Admin" }
                    }
                },

                anggota = new
                {
                    title = "Manajemen Anggota",
                    endpoints = new[]
                    {
                        new { method = "GET", path = "/api/anggota", description = "Daftar semua anggota (support search: ?search=nama)", auth = "Admin, Petugas" },
                        new { method = "GET", path = "/api/anggota/{id}", description = "Detail anggota by ID", auth = "Admin, Petugas" },
                        new { method = "POST", path = "/api/anggota", description = "Tambah anggota baru", auth = "Admin, Petugas" },
                        new { method = "PUT", path = "/api/anggota/{id}", description = "Update anggota", auth = "Admin, Petugas" },
                        new { method = "DELETE", path = "/api/anggota/{id}", description = "Hapus anggota", auth = "Admin" }
                    }
                },

                peminjaman = new
                {
                    title = "Transaksi Peminjaman",
                    endpoints = new[]
                    {
                        new { method = "GET", path = "/api/peminjaman", description = "Daftar semua peminjaman", auth = "Admin, Petugas" },
                        new { method = "POST", path = "/api/peminjaman", description = "Buat peminjaman baru (1 transaksi = 1 buku)", auth = "Admin, Petugas" },
                        new { method = "GET", path = "/api/peminjaman/{id}", description = "Detail peminjaman", auth = "Admin, Petugas" },
                        new { method = "GET", path = "/api/peminjaman/aktif", description = "Daftar peminjaman aktif", auth = "Admin, Petugas" },
                        new { method = "PUT", path = "/api/peminjaman/kembalikan/{id}", description = "Proses pengembalian buku + restore stok", auth = "Admin, Petugas" },
                        new { method = "DELETE", path = "/api/peminjaman/{id}", description = "Hapus data peminjaman (auto restore stok jika masih dipinjam)", auth = "Admin, Petugas" }
                    }
                },

                laporan = new
                {
                    title = "Laporan & Dashboard",
                    endpoints = new[]
                    {
                        new { method = "GET", path = "/api/laporan/dashboard", description = "Dashboard statistik perpustakaan", auth = "Admin, Petugas" },
                        new { method = "GET", path = "/api/laporan/stok-menipis", description = "Laporan buku stok menipis", auth = "Admin, Petugas" },
                        new { method = "GET", path = "/api/laporan/buku-populer", description = "Top 10 buku paling sering dipinjam", auth = "Admin, Petugas" },
                        new { method = "GET", path = "/api/laporan/riwayat-anggota/{id}", description = "Riwayat peminjaman per anggota", auth = "Admin, Petugas" }
                    }
                }
            };

            return Ok(new
            {
                api_name = "Perpustakaan API - Endpoint List",
                total_endpoints = 38,
                categories = endpoints
            });
        }

        // GET: api/test (Test endpoint untuk cek API hidup)
        [HttpGet]
        [Route("api/test")]
        public IHttpActionResult TestConnection()
        {
            return Ok(new
            {
                status = "success",
                message = "API is running!",
                timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
                server_time = DateTime.Now
            });
        }
    }
}
