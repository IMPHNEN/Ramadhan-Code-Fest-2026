using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Runtime.Serialization;

namespace PerpustakaanAPI.Models
{
    [DataContract]
    public class BukuResponseDTO
    {
        [DataMember(Order = 1)]
        public string message { get; set; }
        
        [DataMember(Order = 2)]
        public int id_buku { get; set; }
        
        [DataMember(Order = 3)]
        public string kode_buku { get; set; }
        
        [DataMember(Order = 4)]
        public string judul_buku { get; set; }
    }
}
