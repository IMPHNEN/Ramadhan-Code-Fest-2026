using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Runtime.Serialization;

namespace PerpustakaanAPI.Models
{
    [DataContract]
    public class UsersDTO
    {
        [DataMember(Order = 1)]
        public int id_user { get; set; }
        
        [DataMember(Order = 2)]
        public string username { get; set; }
        
        [DataMember(Order = 3)]
        public string nama_lengkap { get; set; }
        
        [DataMember(Order = 4)]
        public string role { get; set; }
    }
}