using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Serialization;

namespace client.Models
{
    [XmlType("KategoriDTO")]
    public class KategoriModel
    {
        public int id_kategori { get; set; } // Sesuai kolom di SQL 
        public string nama_kategori { get; set; }
    }
}