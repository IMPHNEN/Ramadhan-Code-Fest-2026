using PerpustakaanAPI.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;

namespace PerpustakaanAPI.Controllers
{
    public class KategoriController : ApiController
    {
        PerpustakaanDBEntities db = new PerpustakaanDBEntities();

        //Get : api/kategori
        [System.Web.Http.HttpGet]
        [System.Web.Http.Route("api/kategori")]
        public IHttpActionResult GetKategori(string search = "")
        {
            var query = db.kategori.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(k => k.nama_kategori.Contains(search));
            }

            var data = query.Select(k => new KategoriDTO
            {
                id_kategori = k.id_kategori,
                nama_kategori = k.nama_kategori
            }).ToList();

            return Ok(data);
        }

        [System.Web.Http.HttpGet]
        [System.Web.Http.Route("api/kategori/{id}")]
        public IHttpActionResult GetKategoriById(int id)
        {
            var kategori = db.kategori.Find(id);
            if (kategori == null)
            {
                return NotFound();
            }

            var data = new KategoriDTO
            {
                id_kategori = kategori.id_kategori,
                nama_kategori = kategori.nama_kategori
            };

            return Ok(data);
        }

        [System.Web.Http.HttpPost]
        [System.Web.Http.Route("api/kategori")]
        public IHttpActionResult AddKategori(KategoriDTO dto)
        {
            kategori k = new kategori
            {
                nama_kategori = dto.nama_kategori
            };

            db.kategori.Add(k);
            db.SaveChanges();
            return Ok("Kategori ditambahkan");
        }

        [System.Web.Http.HttpPut]
        [System.Web.Http.Route("api/kategori/{id}")]
        public IHttpActionResult UpdateKategori(int id, KategoriDTO dto)
        {
            var data = db.kategori.Find(id);
            if (data == null) return NotFound();

            data.nama_kategori = dto.nama_kategori;
            db.SaveChanges();
            return Ok("Kategori diupdate");
        }

        [System.Web.Http.HttpDelete]
        [System.Web.Http.Route("api/kategori/{id}")]
        public IHttpActionResult DeleteKategori(int id)
        {
            var data = db.kategori.Find(id);
            if (data == null) return NotFound();

            db.kategori.Remove(data);
            db.SaveChanges();
            return Ok("Kategori dihapus");
        }
    }
}