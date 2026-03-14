using client.Models;
using client.Filters;
using client.Scripts.service;
using client.helper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace client.Controllers
{
    public class HomeController : Controller
    {
        // GET: Home (Login Page)
        public ActionResult Index()
        {
            // Jika sudah login, redirect ke Dashboard
            if (Session["Username"] != null)
            {
                return RedirectToAction("Dashboard");
            }
            return View();
        }

        // POST: Login
        [HttpPost]
        public async Task<ActionResult> Login(UserLoginModel model)
        {
            try
            {
                HttpClient client = ApiService.GetClient();
                
                // Kirim request login ke API dengan JSON body
                var response = await client.PostAsJsonAsync("api/auth/login", new 
                { 
                    username = model.Username, 
                    password = model.Password 
                });
                
                if (response.IsSuccessStatusCode)
                {
                    // Baca response body (XML) untuk mendapatkan data user lengkap
                    string xml = await response.Content.ReadAsStringAsync();
                    
                    // Debug: Log XML response (hapus setelah testing)
                    System.Diagnostics.Debug.WriteLine("XML Response: " + xml);
                    
                    // Parse XML response ke UserModel
                    var user = XmlHelper.ToUser(xml);
                    
                    // Validasi bahwa user berhasil di-parse
                    if (user == null)
                    {
                        ViewBag.ErrorMessage = "Gagal membaca data user dari server. Format response tidak valid.";
                        return View("Index", model);
                    }
                    
                    // Baca custom headers dari response (optional - hanya untuk logging/debugging)
                    string userId = null;
                    string userRole = null;
                    
                    try
                    {
                        if (response.Headers.Contains("X-User-Id"))
                        {
                            userId = response.Headers.GetValues("X-User-Id").FirstOrDefault();
                        }
                        
                        if (response.Headers.Contains("X-User-Role"))
                        {
                            userRole = response.Headers.GetValues("X-User-Role").FirstOrDefault();
                        }
                    }
                    catch (Exception headerEx)
                    {
                        // Header parsing error tidak kritis, lanjutkan dengan data dari XML
                        System.Diagnostics.Debug.WriteLine("Header parsing error: " + headerEx.Message);
                    }
                    
                    // Simpan session menggunakan data dari XML response body
                    Session["Username"] = user.username;
                    Session["nama_user"] = user.nama_lengkap;
                    Session["id_user"] = user.id_user;
                    Session["Role"] = user.role;
                    
                    return RedirectToAction("Dashboard");
                }
                else
                {
                    // Login gagal - tampilkan error message
                    ViewBag.ErrorMessage = "Username atau password salah!";
                    return View("Index", model);
                }
            }
            catch (HttpRequestException httpEx)
            {
                // Error koneksi ke API
                ViewBag.ErrorMessage = $"Tidak dapat terhubung ke server: {httpEx.Message}";
                return View("Index", model);
            }
            catch (Exception ex)
            {
                // Tangani error lainnya
                ViewBag.ErrorMessage = $"Terjadi kesalahan saat login: {ex.Message}";
                System.Diagnostics.Debug.WriteLine("Login error: " + ex.ToString());
                return View("Index", model);
            }
        }

        // GET: Dashboard (setelah login) - PROTECTED
        [CustomAuthorize]
        public ActionResult Dashboard()
        {
            return View();
        }

        // GET: Logout
        public ActionResult Logout()
        {
            // Hapus session
            Session.Clear();
            Session.Abandon();
            
            return RedirectToAction("Index");
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }
    }
}