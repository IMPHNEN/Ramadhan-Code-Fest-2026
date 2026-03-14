using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Runtime.Serialization;

namespace PerpustakaanAPI.Models
{
    [DataContract]
    public class PeminjamanCreateDTO
    {
        [DataMember(Order = 1)]
        public int id_anggota { get; set; }
        
        [DataMember(Order = 2)]
        public int id_user { get; set; }
        
        [DataMember(Order = 3)]
        public int id_buku { get; set; }
        
        [DataMember(Order = 4)]
        public string tanggal_kembali { get; set; }
    }
}
