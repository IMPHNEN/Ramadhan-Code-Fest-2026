using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web;

namespace client.Scripts.service
{
    public class ApiService
    {
        public static HttpClient GetClient()
        {
            HttpClient client = new HttpClient();
            // PENTING: Ganti localhost:50257 dengan port API teman Anda
            client.BaseAddress = new Uri("https://localhost:44357/");
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(
                new MediaTypeWithQualityHeaderValue("application/xml")
            );
            return client;
        }
    }
}