using System; // Untuk Exception
using System.Collections.Generic; // Untuk List
using System.Net.Http; // Untuk HttpClient
using System.Threading.Tasks; // Untuk Task/Async
using System.Net.Http.Formatting; // WAJIB untuk PostAsXmlAsync
using client.helper;
using client.Models;
using client.Scripts.service;
using client.Filters;
using System.Web.Mvc;

namespace client.Controllers
{
    [CustomAuthorize]
    public class KategoriController : Controller
    {
        // TAMPIL SEMUA KATEGORI
        public async Task<ActionResult> Index(string search)
        {
            try
            {
                HttpClient client = ApiService.GetClient();
                
                string url = string.IsNullOrEmpty(search) 
                    ? "api/kategori" 
                    : $"api/kategori?search={search}";
                
                var response = await client.GetAsync(url);
                
                if (!response.IsSuccessStatusCode)
                {
                    TempData["ErrorMessage"] = "Gagal mengambil data kategori dari server.";
                    return View(new List<KategoriModel>());
                }
                
                string xml = await response.Content.ReadAsStringAsync();
                var data = XmlHelper.ToKategoriList(xml);
                
                ViewBag.SearchKeyword = search;
                return View(data);
            }
            catch (Exception ex)
            {
                TempData["ErrorMessage"] = $"Terjadi kesalahan: {ex.Message}";
                return View(new List<KategoriModel>());
            }
        }

        // TAMBAH KATEGORI (VIEW)
        public ActionResult Create()
        {
            return View();
        }

        // TAMBAH KATEGORI (POST)
        [HttpPost]
        public async Task<ActionResult> Create(KategoriModel m)
        {
            try
            {
                HttpClient client = ApiService.GetClient();
                var response = await client.PostAsJsonAsync("api/kategori", m);
                
                if (response.IsSuccessStatusCode)
                {
                    TempData["SuccessMessage"] = "Kategori berhasil ditambahkan!";
                    return RedirectToAction("Index");
                }
                else
                {
                    // Baca error message dari API response
                    string errorContent = await response.Content.ReadAsStringAsync();
                    ViewBag.ErrorMessage = ErrorHelper.FormatErrorMessage("Menambahkan kategori", response.StatusCode, errorContent);
                }
            }
            catch (Exception ex)
            {
                ViewBag.ErrorMessage = $"Terjadi kesalahan: {ex.Message}";
            }
            
            return View(m);
        }

        // EDIT KATEGORI (VIEW)
        public async Task<ActionResult> Edit(int id)
        {
            HttpClient client = ApiService.GetClient();
            var response = await client.GetAsync($"api/kategori/{id}");
            
            if (!response.IsSuccessStatusCode)
            {
                return HttpNotFound();
            }
            
            string xml = await response.Content.ReadAsStringAsync();
            var kategori = XmlHelper.ToKategori(xml);
            
            return View(kategori);
        }

        // EDIT KATEGORI (POST)
        [HttpPost]
        public async Task<ActionResult> Edit(int id, KategoriModel m)
        {
            try
            {
                HttpClient client = ApiService.GetClient();
                var response = await client.PutAsJsonAsync($"api/kategori/{id}", m);
                
                if (response.IsSuccessStatusCode)
                {
                    TempData["SuccessMessage"] = "Kategori berhasil diupdate!";
                    return RedirectToAction("Index");
                }
                else
                {
                    // Baca error message dari API response
                    string errorContent = await response.Content.ReadAsStringAsync();
                    ViewBag.ErrorMessage = ErrorHelper.FormatErrorMessage("Mengupdate kategori", response.StatusCode, errorContent);
                }
            }
            catch (Exception ex)
            {
                ViewBag.ErrorMessage = $"Terjadi kesalahan: {ex.Message}";
            }
            
            return View(m);
        }

        // HAPUS KATEGORI
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                HttpClient client = ApiService.GetClient();
                var response = await client.DeleteAsync($"api/kategori/{id}");
                
                if (response.IsSuccessStatusCode)
                {
                    TempData["SuccessMessage"] = "Kategori berhasil dihapus!";
                }
                else
                {
                    TempData["ErrorMessage"] = "Gagal menghapus kategori. Silakan coba lagi.";
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