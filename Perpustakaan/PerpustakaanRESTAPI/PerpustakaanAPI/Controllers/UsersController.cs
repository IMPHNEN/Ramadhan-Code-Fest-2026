using PerpustakaanAPI.Models;
using PerpustakaanAPI.Filters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;

namespace PerpustakaanAPI.Controllers
{
    public class UsersController : ApiController
    {
        PerpustakaanDBEntities db = new PerpustakaanDBEntities();

        // GET: Daftar semua user (Admin & Petugas)
        // Untuk Admin saja
        [CustomAuthorize(Roles = "admin")]
        [System.Web.Http.HttpGet]
        [System.Web.Http.Route("api/users")]
        public IHttpActionResult GetUsers()
        {
            var data = db.users.Select(u => new UsersDTO
            {
                id_user = u.id_user,
                username = u.username,
                nama_lengkap = u.nama_lengkap,
                role = u.role
                // Password tidak ditampilkan untuk keamanan
            }).ToList();

            return Ok(data);
        }

        // GET: User by ID
        [CustomAuthorize(Roles = "admin")]
        [System.Web.Http.HttpGet]
        [System.Web.Http.Route("api/users/{id}")]
        public IHttpActionResult GetUserById(int id)
        {
            var user = db.users.Find(id);
            if (user == null)
            {
                return NotFound();
            }

            var dto = new UsersDTO
            {
                id_user = user.id_user,
                username = user.username,
                nama_lengkap = user.nama_lengkap,
                role = user.role
            };

            return Ok(dto);
        }

        // GET: Daftar Petugas saja
        [CustomAuthorize(Roles = "admin,petugas")]
        [System.Web.Http.HttpGet]
        [System.Web.Http.Route("api/users/petugas")]
        public IHttpActionResult GetPetugas()
        {
            var data = db.users
                .Where(u => u.role == "petugas")
                .Select(u => new UsersDTO
                {
                    id_user = u.id_user,
                    username = u.username,
                    nama_lengkap = u.nama_lengkap,
                    role = u.role
                }).ToList();

            return Ok(data);
        }

        // POST: Register User Baru (Admin buat akun petugas)
        [CustomAuthorize(Roles = "admin")]
        [System.Web.Http.HttpPost]
        [System.Web.Http.Route("api/users/register")]
        public IHttpActionResult RegisterUser(UserRegisterDTO dto)
        {
            if (dto == null)
            {
                return BadRequest("Data user tidak boleh kosong");
            }

            // Validasi input
            if (string.IsNullOrEmpty(dto.username))
            {
                return BadRequest("Username tidak boleh kosong");
            }

            if (string.IsNullOrEmpty(dto.password))
            {
                return BadRequest("Password tidak boleh kosong");
            }

            // Validasi role (hanya admin atau petugas)
            if (dto.role != "admin" && dto.role != "petugas")
            {
                return BadRequest("Role harus 'admin' atau 'petugas'");
            }

            // Cek apakah username sudah ada
            var existingUser = db.users.FirstOrDefault(u => u.username == dto.username);
            if (existingUser != null)
            {
                return BadRequest("Username sudah digunakan");
            }

            // Buat user baru
            users newUser = new users
            {
                username = dto.username,
                password = dto.password,
                nama_lengkap = dto.nama_lengkap,
                role = dto.role ?? "petugas"
            };

            db.users.Add(newUser);
            db.SaveChanges();

            return Ok(new
            {
                message = "User berhasil didaftarkan",
                id_user = newUser.id_user,
                username = newUser.username,
                role = newUser.role
            });
        }

        // PUT: Update User (Edit profil atau ganti password)
        [CustomAuthorize(Roles = "admin")]
        [System.Web.Http.HttpPut]
        [System.Web.Http.Route("api/users/{id}")]
        public IHttpActionResult UpdateUser(int id, UserRegisterDTO dto)
        {
            var user = db.users.Find(id);
            if (user == null)
            {
                return NotFound();
            }

            // Update data
            if (!string.IsNullOrEmpty(dto.username))
            {
                // Cek username baru tidak bentrok dengan user lain
                var existingUser = db.users
                    .FirstOrDefault(u => u.username == dto.username && u.id_user != id);
                if (existingUser != null)
                {
                    return BadRequest("Username sudah digunakan");
                }
                user.username = dto.username;
            }

            if (!string.IsNullOrEmpty(dto.password))
            {
                user.password = dto.password;
            }

            if (!string.IsNullOrEmpty(dto.nama_lengkap))
            {
                user.nama_lengkap = dto.nama_lengkap;
            }

            if (!string.IsNullOrEmpty(dto.role))
            {
                if (dto.role != "admin" && dto.role != "petugas")
                {
                    return BadRequest("Role harus 'admin' atau 'petugas'");
                }
                user.role = dto.role;
            }

            db.SaveChanges();

            return Ok("User berhasil diupdate");
        }

        // DELETE: Hapus User
        [CustomAuthorize(Roles = "admin")]
        [System.Web.Http.HttpDelete]
        [System.Web.Http.Route("api/users/{id}")]
        public IHttpActionResult DeleteUser(int id)
        {
            var user = db.users.Find(id);
            if (user == null)
            {
                return NotFound();
            }

            var adaTransaksi = db.peminjaman.Any(p => p.id_user == id);
            if (adaTransaksi)
            {
                return BadRequest("User tidak dapat dihapus karena memiliki riwayat transaksi. Anda bisa nonaktifkan user ini.");
            }

            db.users.Remove(user);
            db.SaveChanges();

            return Ok("User berhasil dihapus");
        }

        // POST: Ganti Password (User ganti password sendiri)
        [CustomAuthorize(Roles = "admin,petugas")]
        [System.Web.Http.HttpPost]
        [System.Web.Http.Route("api/users/change-password")]
        public IHttpActionResult ChangePassword(ChangePasswordDTO dto)
        {
            if (dto == null)
            {
                return BadRequest("Data tidak boleh kosong");
            }

            // Cari user berdasarkan username
            var user = db.users.FirstOrDefault(u => u.username == dto.username);
            if (user == null)
            {
                return NotFound();
            }

            // Validasi password lama
            if (user.password != dto.old_password)
            {
                return BadRequest("Password lama salah");
            }

            // Update password baru
            user.password = dto.new_password;

            db.SaveChanges();

            return Ok("Password berhasil diubah");
        }
    }

    // DTO untuk change password
    public class ChangePasswordDTO
    {
        public string username { get; set; }
        public string old_password { get; set; }
        public string new_password { get; set; }
    }
}
