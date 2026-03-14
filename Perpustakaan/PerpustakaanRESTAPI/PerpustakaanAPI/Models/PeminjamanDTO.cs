using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Runtime.Serialization;

namespace PerpustakaanAPI.Models
{
    [DataContract]
    public class PeminjamanDTO
    {
        [DataMember(Order = 1)]
        public int id_pinjam { get; set; }
        
        [DataMember(Order = 2)]
        public int id_anggota { get; set; }
        
        [DataMember(Order = 3)]
        public int id_user { get; set; }
        
        [DataMember(Order = 4)]
        public int id_buku { get; set; }
        
        [DataMember(Order = 5)]
        public string tanggal_pinjam { get; set; }
        
        [DataMember(Order = 6)]
        public string tanggal_kembali { get; set; }
        
        [DataMember(Order = 7)]
        public string status { get; set; }

        [DataMember(Order = 8)]
        public AnggotaDTO anggota { get; set; }
        
        [DataMember(Order = 9)]
        public UsersDTO petugas { get; set; }
        
        [DataMember(Order = 10)]
        public BukuDTO buku { get; set; }
    }
}