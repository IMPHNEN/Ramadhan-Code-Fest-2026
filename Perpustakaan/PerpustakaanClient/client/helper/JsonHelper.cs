using client.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace client.helper
{
    public class JsonHelper
    {
        // Untuk data Kategori Buku
        public static List<KategoriModel> ToKategoriList(string json)
        {
            try
            {
                return JsonConvert.DeserializeObject<List<KategoriModel>>(json);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("JSON Error: " + json);
                System.Diagnostics.Debug.WriteLine("Exception: " + ex.Message);
                throw new Exception("Error deserializing Kategori: " + ex.Message, ex);
            }
        }

        // Untuk data Buku (Penting untuk Perpustakaan)
        public static List<BukuModel> ToBukuList(string json)
        {
            try
            {
                return JsonConvert.DeserializeObject<List<BukuModel>>(json);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("JSON Error: " + json);
                System.Diagnostics.Debug.WriteLine("Exception: " + ex.Message);
                throw new Exception("Error deserializing Buku: " + ex.Message, ex);
            }
        }

        // Untuk data Anggota
        public static List<AnggotaModel> ToAnggotaList(string json)
        {
            try
            {
                return JsonConvert.DeserializeObject<List<AnggotaModel>>(json);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("JSON Error: " + json);
                System.Diagnostics.Debug.WriteLine("Exception: " + ex.Message);
                throw new Exception("Error deserializing Anggota: " + ex.Message, ex);
            }
        }
    }
}
