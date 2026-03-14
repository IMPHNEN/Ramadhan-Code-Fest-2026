using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Runtime.Serialization;

namespace PerpustakaanAPI.Models
{
    [DataContract]
    public class KembalikanBukuResponseDTO
    {
        [DataMember(Order = 1)]
        public string message { get; set; }
        
        [DataMember(Order = 2)]
        public int id_pinjam { get; set; }
        
        [DataMember(Order = 3)]
        public string judul_buku { get; set; }
        
        [DataMember(Order = 4)]
        public string tanggal_kembali { get; set; }
        
        [DataMember(Order = 5)]
        public int stok_sekarang { get; set; }
    }
}
