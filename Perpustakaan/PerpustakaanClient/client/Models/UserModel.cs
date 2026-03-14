using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Serialization;

namespace client.Models
{
    [XmlRoot("UsersDTO", Namespace = "http://www.w3.org/2001/XMLSchema")]
    public class UserModel
    {
        [XmlElement(Order = 0)]
        public int id_user { get; set; }
        
        [XmlElement(Order = 1)]
        public string nama_lengkap { get; set; }
        
        [XmlElement(Order = 2)]
        public string role { get; set; }
        
        [XmlElement(Order = 3)]
        public string username { get; set; }
    }
}