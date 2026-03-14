using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Runtime.Serialization;

namespace PerpustakaanAPI.Models
{
    [DataContract]
    public class AnggotaResponseDTO
    {
        [DataMember(Order = 1)]
        public string message { get; set; }
        
        [DataMember(Order = 2)]
        public int id_anggota { get; set; }
        
        [DataMember(Order = 3)]
        public string nama_anggota { get; set; }
        
        [DataMember(Order = 4)]
        public string tanggal_daftar { get; set; }
    }
}
