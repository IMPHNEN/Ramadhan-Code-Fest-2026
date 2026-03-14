using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Runtime.Serialization;

namespace PerpustakaanAPI.Models
{
    [DataContract]
    public class KategoriDTO
    {
        [DataMember(Order = 1)]
        public int id_kategori { get; set; }
        
        [DataMember(Order = 2)]
        public string nama_kategori { get; set; }
    }
}