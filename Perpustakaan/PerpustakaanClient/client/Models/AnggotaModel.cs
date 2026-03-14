using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web;
using System.Xml.Serialization;

namespace client.Models
{
    [XmlType("AnggotaDTO")]
    public class AnggotaModel
    {
        public int id_anggota { get; set; } // Sesuai kolom di SQL 
        public string nama_anggota { get; set; }
        public string alamat { get; set; }
        public string telp { get; set; }
        
        // Property untuk XML serialization
        [XmlElement("tanggal_daftar")]
        public string tanggal_daftar_string 
        { 
            get 
            { 
                return tanggal_daftar?.ToString("yyyy-MM-dd"); 
            } 
            set 
            {
                if (!string.IsNullOrEmpty(value))
                {
                    // Try parse berbagai format datetime
                    if (DateTime.TryParse(value, out DateTime result))
                    {
                        tanggal_daftar = result;
                    }
                    else if (DateTime.TryParseExact(value, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out result))
                    {
                        tanggal_daftar = result;
                    }
                }
            }
        }
        
        // Property yang digunakan di aplikasi
        [XmlIgnore]
        public DateTime? tanggal_daftar { get; set; }
    }
}