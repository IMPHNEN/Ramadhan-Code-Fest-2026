using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Runtime.Serialization;

namespace PerpustakaanAPI.Models
{
    [DataContract]
    public class AnggotaDTO
    {
        [DataMember(Order = 1)]
        public int id_anggota { get; set; }
        
        [DataMember(Order = 2)]
        public string nama_anggota { get; set; }
        
        [DataMember(Order = 3)]
        public string alamat { get; set; }
        
        [DataMember(Order = 4)]
        public string telp { get; set; }
        
        [DataMember(Order = 5)]
        public string tanggal_daftar { get; set; }
    }
}