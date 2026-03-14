using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Runtime.Serialization;

namespace PerpustakaanAPI.Models
{
    [DataContract]
    public class BukuDTO
    {
        [DataMember(Order = 1)]
        public int id_buku { get; set; }
        
        [DataMember(Order = 2)]
        public int? id_kategori { get; set; }
        
        [DataMember(Order = 3)]
        public string kode_buku { get; set; }
        
        [DataMember(Order = 4)]
        public string judul_buku { get; set; }
        
        [DataMember(Order = 5)]
        public string penulis { get; set; }
        
        [DataMember(Order = 6)]
        public int stok { get; set; }
        
        [DataMember(Order = 7)]
        public KategoriDTO kategori { get; set; }
    }
}