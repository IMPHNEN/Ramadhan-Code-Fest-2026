using System; // Untuk Exception
using System.Collections.Generic; // Untuk List
using System.Net.Http; // Untuk HttpClient
using System.Threading.Tasks; // Untuk Task/Async
using client.helper;
using client.Models;
using client.Scripts.service;
using client.Filters;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace client.Controllers
{
    [CustomAuthorize]
    public class AnggotaController : Controller
    {
        // Tampil Daftar Anggota
        public async Task<ActionResult> Index(string search)
        {
            try
            {
                HttpClient client = ApiService.GetClient();
                
                string url = string.IsNullOrEmpty(search) 
                    ? "api/anggota" 
                    : $"api/anggota?search={search}";
                
                var response = await client.GetAsync(url);
                
                if (!response.IsSuccessStatusCode)
                {
                    TempData["ErrorMessage"] = "Gagal mengambil data anggota dari server.";
                    return View(new List<AnggotaModel>());
                }
                
                string xml = await response.Content.ReadAsStringAsync();
                var data = XmlHelper.ToAnggotaList(xml);
                
                ViewBag.SearchKeyword = search;
                return View(data);
            }
            catch (Exception ex)
            {
                TempData["ErrorMessage"] = $"Terjadi kesalahan: {ex.Message}";
                return View(new List<AnggotaModel>());
            }
        }

        public ActionResult Create()
        {
            return View();
        }

        [HttpPost]
        public async Task<ActionResult> Create(AnggotaModel m)
        {
            try
            {
                HttpClient client = ApiService.GetClient();
                var response = await client.PostAsJsonAsync("api/anggota", m);
                
                if (response.IsSuccessStatusCode)
                {
                    TempData["SuccessMessage"] = "Anggota berhasil ditambahkan!";
                    return RedirectToAction("Index");
                }
                else
                {
                    // Baca error message dari API response
                    string errorContent = await response.Content.ReadAsStringAsync();
                    ViewBag.ErrorMessage = ErrorHelper.FormatErrorMessage("Menambahkan anggota", response.StatusCode, errorContent);
                }
            }
            catch (Exception ex)
            {
                ViewBag.ErrorMessage = $"Terjadi kesalahan: {ex.Message}";
            }
            
            return View(m);
        }

        // GET: Anggota/Edit/5
        public async Task<ActionResult> Edit(int id)
        {
            HttpClient client = ApiService.GetClient();
            var response = await client.GetAsync($"api/anggota/{id}");
            
            if (!response.IsSuccessStatusCode)
            {
                return HttpNotFound();
            }
            
            string xml = await response.Content.ReadAsStringAsync();
            var anggota = XmlHelper.ToAnggota(xml);
            
            return View(anggota);
        }

        // POST: Anggota/Edit/5
        [HttpPost]
        public async Task<ActionResult> Edit(int id, AnggotaModel m)
        {
            try
            {
                HttpClient client = ApiService.GetClient();
                var response = await client.PutAsJsonAsync($"api/anggota/{id}", m);
                
                if (response.IsSuccessStatusCode)
                {
                    TempData["SuccessMessage"] = "Anggota berhasil diupdate!";
                    return RedirectToAction("Index");
                }
                else
                {
                    // Baca error message dari API response
                    string errorContent = await response.Content.ReadAsStringAsync();
                    ViewBag.ErrorMessage = ErrorHelper.FormatErrorMessage("Mengupdate anggota", response.StatusCode, errorContent);
                }
            }
            catch (Exception ex)
            {
                ViewBag.ErrorMessage = $"Terjadi kesalahan: {ex.Message}";
            }
            
            return View(m);
        }

        [HttpPost]
        public async Task<ActionResult> DeleteConfirmed(int id)
        {
            try
            {
                HttpClient client = ApiService.GetClient();
                var response = await client.DeleteAsync($"api/anggota/{id}");
                
                if (response.IsSuccessStatusCode)
                {
                    TempData["SuccessMessage"] = "Anggota berhasil dihapus!";
                }
                else
                {
                    TempData["ErrorMessage"] = "Gagal menghapus anggota. Silakan coba lagi.";
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