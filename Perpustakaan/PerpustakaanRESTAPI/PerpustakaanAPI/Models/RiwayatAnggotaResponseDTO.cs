using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Runtime.Serialization;

namespace PerpustakaanAPI.Models
{
    [DataContract]
    public class RiwayatAnggotaResponseDTO
    {
        [DataMember(Order = 1)]
        public AnggotaDTO anggota { get; set; }
        
        [DataMember(Order = 2)]
        public List<PeminjamanDTO> riwayat_peminjaman { get; set; }
    }
}
