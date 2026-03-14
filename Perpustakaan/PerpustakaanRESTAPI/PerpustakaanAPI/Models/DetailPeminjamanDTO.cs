using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace PerpustakaanAPI.Models
{
    public class DetailPeminjamanDTO
    {
        public int id_detail { get; set; }
        public int jumlah { get; set; }

        public BukuDTO buku { get; set; }
        public PeminjamanDTO peminjaman { get; set; }
    }
}