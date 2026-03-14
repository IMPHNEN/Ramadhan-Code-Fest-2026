using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using client.Filters;
using client.helper;
using client.Models;
using client.Scripts.service;

namespace client.Controllers
{
    [CustomAuthorize]
    public class PeminjamanController : Controller
    {
        // API untuk autocomplete Anggota (mengembalikan JSON)
        [HttpGet]
        public async Task<JsonResult> SearchAnggota(string term)
        {
            try
            {
                HttpClient client = ApiService.GetClient();
                var response = await client.GetAsync($"api/anggota?search={term}");
                
                if (response.IsSuccessStatusCode)
                {
                    string xml = await response.Content.ReadAsStringAsync();
                    var listAnggota = XmlHelper.ToAnggotaList(xml);
                    
                    // Format untuk Select2
                    var result = listAnggota.Select(a => new
                    {
                        id = a.id_anggota,
                        text = $"{a.nama_anggota} - {a.telp}"
                    }).ToList();
                    
                    return Json(result, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception) { }
            
            return Json(new List<object>(), JsonRequestBehavior.AllowGet);
        }
        
        // API untuk autocomplete Buku (mengembalikan JSON)
        [HttpGet]
        public async Task<JsonResult> SearchBuku(string term)
        {
            try
            {
                HttpClient client = ApiService.GetClient();
                var response = await client.GetAsync($"api/buku?search={term}");
                
                if (response.IsSuccessStatusCode)
                {
                    string xml = await response.Content.ReadAsStringAsync();
                    var listBuku = XmlHelper.ToBukuList(xml);
                    
                    // Format untuk Select2
                    var result = listBuku.Select(b => new
                    {
                        id = b.id_buku,
                        text = $"{b.judul_buku} - {b.penulis}"
                    }).ToList();
                    
                    return Json(result, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception) { }
            
            return Json(new List<object>(), JsonRequestBehavior.AllowGet);
        }

        // Fungsi untuk load dropdown Anggota
        private async Task LoadAnggota()
        {
            try
            {
                HttpClient client = ApiService.GetClient();
                var response = await client.GetAsync("api/anggota");
                
                if (response.IsSuccessStatusCode)
                {
                    string xml = await response.Content.ReadAsStringAsync();
                    var listAnggota = XmlHelper.ToAnggotaList(xml);
                    ViewBag.AnggotaList = new SelectList(listAnggota, "id_anggota", "nama_anggota");
                }
            }
            catch (Exception)
            {
                ViewBag.AnggotaList = new SelectList(new List<AnggotaModel>(), "id_anggota", "nama_anggota");
            }
        }

        // Fungsi untuk load dropdown Buku
        private async Task LoadBuku()
        {
            try
            {
                HttpClient client = ApiService.GetClient();
                var response = await client.GetAsync("api/buku");
                
                if (response.IsSuccessStatusCode)
                {
                    string xml = await response.Content.ReadAsStringAsync();
                    var listBuku = XmlHelper.ToBukuList(xml);
                    ViewBag.BukuList = new SelectList(listBuku, "id_buku", "judul_buku");
                }
            }
            catch (Exception)
            {
                ViewBag.BukuList = new SelectList(new List<BukuModel>(), "id_buku", "judul_buku");
            }
        }

        // GET: Peminjaman (Tampil Semua Peminjaman)
        public async Task<ActionResult> Index(string search, string filter)
        {
            try
            {
                HttpClient client = ApiService.GetClient();
                
                // Tentukan endpoint berdasarkan filter
                string url;
                if (filter == "aktif")
                {
                    url = "api/peminjaman/aktif";
                }
                else
                {
                    url = string.IsNullOrEmpty(search) 
                        ? "api/peminjaman" 
                        : $"api/peminjaman?search={search}";
                }
                
                var response = await client.GetAsync(url);
                
                if (!response.IsSuccessStatusCode)
                {
                    TempData["ErrorMessage"] = "Gagal mengambil data peminjaman dari server.";
                    return View(new List<PeminjamanModel>());
                }
                
                string xml = await response.Content.ReadAsStringAsync();
                var data = XmlHelper.ToPeminjamanList(xml);
                
                ViewBag.SearchKeyword = search;
                ViewBag.FilterActive = filter; // Simpan filter aktif
                
                return View(data);
            }
            catch (Exception ex)
            {
                TempData["ErrorMessage"] = $"Terjadi kesalahan: {ex.Message}";
                return View(new List<PeminjamanModel>());
            }
        }

        // GET: Peminjaman/Create
        public async Task<ActionResult> Create()
        {
            await LoadAnggota();
            await LoadBuku();
            
            // Set tanggal hari ini untuk tanggal kembali (default 7 hari dari sekarang)
            var model = new PeminjamanModel
            {
                tanggal_pinjam = DateTime.Now,
                tanggal_kembali = DateTime.Now.AddDays(7)
            };
            
            return View(model);
        }

        // POST: Peminjaman/Create
        [HttpPost]
        public async Task<ActionResult> Create(PeminjamanModel m)
        {
            try
            {
                // Ambil id_user dari session (user yang login)
                if (Session["id_user"] != null)
                {
                    m.id_user = Convert.ToInt32(Session["id_user"]);
                }

                HttpClient client = ApiService.GetClient();
                var response = await client.PostAsJsonAsync("api/peminjaman", m);
                
                if (response.IsSuccessStatusCode)
                {
                    TempData["SuccessMessage"] = "Peminjaman berhasil ditambahkan!";
                    return RedirectToAction("Index");
                }
                else
                {
                    string errorContent = await response.Content.ReadAsStringAsync();
                    ViewBag.ErrorMessage = ErrorHelper.FormatErrorMessage("Menambahkan peminjaman", response.StatusCode, errorContent);
                }
            }
            catch (Exception ex)
            {
                ViewBag.ErrorMessage = $"Terjadi kesalahan: {ex.Message}";
            }
            
            await LoadAnggota();
            await LoadBuku();
            return View(m);
        }

        // POST: Peminjaman/Kembalikan - Proses pengembalian buku
        [HttpPost]
        public async Task<ActionResult> Kembalikan(int id)
        {
            try
            {
                HttpClient client = ApiService.GetClient();
                var response = await client.PutAsync($"api/peminjaman/kembalikan/{id}", null);
                
                if (response.IsSuccessStatusCode)
                {
                    TempData["SuccessMessage"] = "Buku berhasil dikembalikan!";
                }
                else
                {
                    string errorContent = await response.Content.ReadAsStringAsync();
                    TempData["ErrorMessage"] = ErrorHelper.FormatErrorMessage("Proses pengembalian", response.StatusCode, errorContent);
                }
            }
            catch (Exception ex)
            {
                TempData["ErrorMessage"] = $"Terjadi kesalahan: {ex.Message}";
            }
            
            return RedirectToAction("Index");
        }

        // POST: Peminjaman/DeleteConfirmed
        [HttpPost]
        public async Task<ActionResult> DeleteConfirmed(int id)
        {
            try
            {
                HttpClient client = ApiService.GetClient();
                var response = await client.DeleteAsync($"api/peminjaman/{id}");
                
                if (response.IsSuccessStatusCode)
                {
                    TempData["SuccessMessage"] = "Peminjaman berhasil dihapus!";
                }
                else
                {
                    string errorContent = await response.Content.ReadAsStringAsync();
                    TempData["ErrorMessage"] = ErrorHelper.FormatErrorMessage("Menghapus peminjaman", response.StatusCode, errorContent);
                }
            }
            catch (Exception ex)
            {
                TempData["ErrorMessage"] = $"Terjadi kesalahan: {ex.Message}";
            }
            
            return RedirectToAction("Index");
        }
    }
}
