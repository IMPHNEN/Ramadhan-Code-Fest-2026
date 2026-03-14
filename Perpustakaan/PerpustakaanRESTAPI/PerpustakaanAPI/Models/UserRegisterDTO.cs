using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace PerpustakaanAPI.Models
{
    public class UserRegisterDTO
    {
        public string username { get; set; }
        public string password { get; set; }
        public string nama_lengkap { get; set; }
        public string role { get; set; }
    }
}
