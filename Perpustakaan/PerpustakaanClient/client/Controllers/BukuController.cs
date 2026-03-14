using System.Net.Http; // Untuk HttpClient
using System.Threading.Tasks; // Untuk Task/Async
using System.Net.Http.Formatting; // WAJIB untuk PostAsXmlAsync
using client.helper;
using client.Models;
using client.Scripts.service;
using client.Filters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;


namespace client.Controllers
{
    [CustomAuthorize]
    public class BukuController : Controller
    {
        // Fungsi untuk mengambil data kategori dari API untuk Dropdown List
        private async Task LoadKategori()
        {
            HttpClient client = ApiService.GetClient();
            var response = await client.GetAsync("api/kategori");
            string xml = await response.Content.ReadAsStringAsync();
            var listKategori = XmlHelper.ToKategoriList(xml);
            // Simpan di ViewBag agar bisa dibaca di View (Create.cshtml)
            ViewBag.KategoriList = new SelectList(listKategori, "id_kategori", "nama_kategori");
        }

        // GET: Buku (Tampil Semua Buku)
        public async Task<ActionResult> Index(string search)
        {
            try
            {
                HttpClient client = ApiService.GetClient();
                
                // Jika ada parameter search, gunakan endpoint search
                string url = string.IsNullOrEmpty(search) 
                    ? "api/buku" 
                    : $"api/buku?search={search}";
                
                var response = await client.GetAsync(url);
                
                if (!response.IsSuccessStatusCode)
                {
                    TempData["ErrorMessage"] = "Gagal mengambil data buku dari server.";
                    return View(new List<BukuModel>());
                }
                
                string xml = await response.Content.ReadAsStringAsync();
                var data = XmlHelper.ToBukuList(xml);
                
                // Simpan search keyword untuk ditampilkan di view
                ViewBag.SearchKeyword = search;
                
                return View(data);
            }
            catch (Exception ex)
            {
                TempData["ErrorMessage"] = $"Terjadi kesalahan: {ex.Message}";
                return View(new List<BukuModel>());
            }
        }

        // GET: Buku/Edit/5
        public async Task<ActionResult> Edit(int id)
        {
            HttpClient client = ApiService.GetClient();
            var response = await client.GetAsync($"api/buku/{id}");
            
            if (!response.IsSuccessStatusCode)
            {
                return HttpNotFound();
            }
            
            string xml = await response.Content.ReadAsStringAsync();
            var buku = XmlHelper.ToBuku(xml);
            
            await LoadKategori();
            return View(buku);
        }

        // POST: Buku/Edit/5
        [HttpPost]
        public async Task<ActionResult> Edit(int id, BukuModel m)
        {
            try
            {
                HttpClient client = ApiService.GetClient();
                var response = await client.PutAsJsonAsync($"api/buku/{id}", m);
                
                if (response.IsSuccessStatusCode)
                {
                    TempData["SuccessMessage"] = "Buku berhasil diupdate!";
                    return RedirectToAction("Index");
                }
                else
                {
                    // Baca error message dari API response
                    string errorContent = await response.Content.ReadAsStringAsync();
                    ViewBag.ErrorMessage = ErrorHelper.FormatErrorMessage("Mengupdate buku", response.StatusCode, errorContent);
                }
            }
            catch (Exception ex)
            {
                ViewBag.ErrorMessage = $"Terjadi kesalahan: {ex.Message}";
            }
            
            await LoadKategori();
            return View(m);
        }

        // GET: Buku/Create
        public async Task<ActionResult> Create()
        {
            await LoadKategori(); // Panggil fungsi dropdown
            return View();
        }

        // POST: Buku/Create
        [HttpPost]
        public async Task<ActionResult> Create(BukuModel m)
        {
            try
            {
                HttpClient client = ApiService.GetClient();
                var response = await client.PostAsJsonAsync("api/buku", m);
                
                if (response.IsSuccessStatusCode)
                {
                    TempData["SuccessMessage"] = "Buku berhasil ditambahkan!";
                    return RedirectToAction("Index");
                }
                else
                {
                    // Baca error message dari API response
                    string errorContent = await response.Content.ReadAsStringAsync();
                    ViewBag.ErrorMessage = ErrorHelper.FormatErrorMessage("Menambahkan buku", response.StatusCode, errorContent);
                }
            }
            catch (Exception ex)
            {
                ViewBag.ErrorMessage = $"Terjadi kesalahan: {ex.Message}";
            }
            
            await LoadKategori();
            return View(m);
        }

        // POST: Buku/Delete/5
        [HttpPost]
        public async Task<ActionResult> DeleteConfirmed(int id)
        {
            try
            {
                HttpClient client = ApiService.GetClient();
                var response = await client.DeleteAsync($"api/buku/{id}");
                
                if (response.IsSuccessStatusCode)
                {
                    TempData["SuccessMessage"] = "Buku berhasil dihapus!";
                }
                else
                {
                    TempData["ErrorMessage"] = "Gagal menghapus buku. Silakan coba lagi.";
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