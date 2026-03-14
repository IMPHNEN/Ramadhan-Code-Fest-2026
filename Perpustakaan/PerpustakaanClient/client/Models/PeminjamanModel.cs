using System;
using System.Globalization;
using System.Xml.Serialization;

namespace client.Models
{
    [XmlType("PeminjamanDTO")]
    public class PeminjamanModel
    {
        public int id_pinjam { get; set; }
        public int? id_anggota { get; set; }
        public int? id_user { get; set; }
        public int? id_buku { get; set; }
        
        // Property untuk XML serialization - tanggal_pinjam
        [XmlElement("tanggal_pinjam")]
        public string tanggal_pinjam_string 
        { 
            get 
            { 
                return tanggal_pinjam?.ToString("yyyy-MM-dd"); 
            } 
            set 
            {
                if (!string.IsNullOrEmpty(value))
                {
                    if (DateTime.TryParse(value, out DateTime result))
                    {
                        tanggal_pinjam = result;
                    }
                    else if (DateTime.TryParseExact(value, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out result))
                    {
                        tanggal_pinjam = result;
                    }
                }
            }
        }
        
        // Property untuk XML serialization - tanggal_kembali
        [XmlElement("tanggal_kembali")]
        public string tanggal_kembali_string 
        { 
            get 
            { 
                return tanggal_kembali?.ToString("yyyy-MM-dd"); 
            } 
            set 
            {
                if (!string.IsNullOrEmpty(value))
                {
                    if (DateTime.TryParse(value, out DateTime result))
                    {
                        tanggal_kembali = result;
                    }
                    else if (DateTime.TryParseExact(value, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out result))
                    {
                        tanggal_kembali = result;
                    }
                }
            }
        }
        
        // Property yang digunakan di aplikasi
        [XmlIgnore]
        public DateTime? tanggal_pinjam { get; set; }
        
        [XmlIgnore]
        public DateTime? tanggal_kembali { get; set; }
        
        public string status { get; set; }
        
        // Nested objects dari API
        [XmlElement("anggota")]
        public AnggotaModel anggota { get; set; }
        
        [XmlElement("petugas")]
        public UserModel petugas { get; set; }
        
        [XmlElement("buku")]
        public BukuModel buku { get; set; }
    }
}
