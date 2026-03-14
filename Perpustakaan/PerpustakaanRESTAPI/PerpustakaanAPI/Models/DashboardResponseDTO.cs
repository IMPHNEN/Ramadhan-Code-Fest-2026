using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Runtime.Serialization;

namespace PerpustakaanAPI.Models
{
    [DataContract]
    public class DashboardResponseDTO
    {
        [DataMember(Order = 1)]
        public int total_buku { get; set; }
        
        [DataMember(Order = 2)]
        public int total_anggota { get; set; }
        
        [DataMember(Order = 3)]
        public int peminjaman_aktif { get; set; }
        
        [DataMember(Order = 4)]
        public int total_peminjaman { get; set; }
        
        [DataMember(Order = 5)]
        public int buku_stok_menipis { get; set; }
    }
}
