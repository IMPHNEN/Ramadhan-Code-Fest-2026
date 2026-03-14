using PerpustakaanAPI.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;

namespace PerpustakaanAPI.Controllers
{
    public class AuthController : ApiController
    {
        PerpustakaanDBEntities db = new PerpustakaanDBEntities();

        [System.Web.Http.HttpPost]
        [System.Web.Http.Route("api/auth/login")]
        public IHttpActionResult Login(UserLoginDTO login)
        {
            // Validasi input
            if (login == null)
                return BadRequest("Data login tidak boleh kosong");
            var user = db.users
            .FirstOrDefault(u =>
            u.username == login.username &&
            u.password == login.password);
            if (user == null)
                return Unauthorized(); // akan dibalas 401
                                       // Mapping ke DTO
            UsersDTO dto = new UsersDTO
            {
                id_user = user.id_user,
                username = user.username,
                nama_lengkap = user.nama_lengkap,
                role = user.role
            };
            return Ok(dto);
        }
      }
    }