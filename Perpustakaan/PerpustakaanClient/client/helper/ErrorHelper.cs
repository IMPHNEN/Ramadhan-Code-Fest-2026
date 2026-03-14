using System;
using System.Text.RegularExpressions;
using System.Xml.Linq;

namespace client.helper
{
    public class ErrorHelper
    {
        /// <summary>
        /// Parse error message dari API response (XML atau text)
        /// </summary>
        public static string ParseApiError(string errorContent, System.Net.HttpStatusCode statusCode)
        {
            if (string.IsNullOrEmpty(errorContent))
            {
                return $"Error {(int)statusCode}: {statusCode}";
            }

            try
            {
                // Coba parse sebagai XML
                XDocument doc = XDocument.Parse(errorContent);
                
                // Cari element message atau error
                var messageElement = doc.Root?.Element("message") 
                                  ?? doc.Root?.Element("Message")
                                  ?? doc.Root?.Element("error")
                                  ?? doc.Root?.Element("Error");
                
                if (messageElement != null)
                {
                    return messageElement.Value;
                }
                
                // Jika root element sendiri adalah message
                if (doc.Root != null && !string.IsNullOrWhiteSpace(doc.Root.Value))
                {
                    return doc.Root.Value;
                }
            }
            catch
            {
                // Jika bukan XML, coba bersihkan HTML tags
                string cleaned = Regex.Replace(errorContent, @"<[^>]+>", "");
                cleaned = cleaned.Replace("&lt;", "<").Replace("&gt;", ">").Replace("&quot;", "\"");
                
                // Ambil 200 karakter pertama jika terlalu panjang
                if (cleaned.Length > 200)
                {
                    cleaned = cleaned.Substring(0, 200) + "...";
                }
                
                return cleaned;
            }

            return errorContent;
        }

        /// <summary>
        /// Format error message yang user-friendly
        /// </summary>
        public static string FormatErrorMessage(string operation, System.Net.HttpStatusCode statusCode, string apiError)
        {
            string parsedError = ParseApiError(apiError, statusCode);
            
            // Mapping status code ke pesan yang lebih friendly
            switch (statusCode)
            {
                case System.Net.HttpStatusCode.BadRequest: // 400
                    return $"Data tidak valid: {parsedError}";
                
                case System.Net.HttpStatusCode.Unauthorized: // 401
                    return "Sesi Anda telah berakhir. Silakan login kembali.";
                
                case System.Net.HttpStatusCode.Forbidden: // 403
                    return "Anda tidak memiliki akses untuk melakukan operasi ini.";
                
                case System.Net.HttpStatusCode.NotFound: // 404
                    return $"Data tidak ditemukan: {parsedError}";
                
                case System.Net.HttpStatusCode.Conflict: // 409
                    return $"Konflik data: {parsedError}";
                
                case System.Net.HttpStatusCode.InternalServerError: // 500
                    return $"Terjadi kesalahan di server: {parsedError}";
                
                default:
                    return $"{operation} gagal ({statusCode}): {parsedError}";
            }
        }
    }
}
