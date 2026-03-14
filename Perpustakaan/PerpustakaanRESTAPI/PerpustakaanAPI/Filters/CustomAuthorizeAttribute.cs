using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Http.Controllers;

namespace PerpustakaanAPI.Filters
{
    /// <summary>
    /// Custom Authorization Filter untuk Role-Based Access Control
    /// Penggunaan: [CustomAuthorize(Roles = "admin,petugas")]
    /// </summary>
    public class CustomAuthorizeAttribute : AuthorizeAttribute
    {
        public string Roles { get; set; }

        protected override bool IsAuthorized(HttpActionContext actionContext)
        {
            // Cek apakah ada data user di session/header
            var request = actionContext.Request;
            
            // Cek header "X-User-Id" dan "X-User-Role" yang dikirim dari client
            IEnumerable<string> userIdHeader;
            IEnumerable<string> userRoleHeader;

            if (request.Headers.TryGetValues("X-User-Id", out userIdHeader) &&
                request.Headers.TryGetValues("X-User-Role", out userRoleHeader))
            {
                var userId = userIdHeader.FirstOrDefault();
                var userRole = userRoleHeader.FirstOrDefault();

                if (!string.IsNullOrEmpty(userId) && !string.IsNullOrEmpty(userRole))
                {
                    // Cek apakah role user sesuai dengan yang diizinkan
                    if (!string.IsNullOrEmpty(Roles))
                    {
                        var allowedRoles = Roles.Split(',');
                        return allowedRoles.Contains(userRole);
                    }

                    // Jika tidak ada role specified, cukup login saja
                    return true;
                }
            }

            return false;
        }

        protected override void HandleUnauthorizedRequest(HttpActionContext actionContext)
        {
            actionContext.Response = actionContext.Request.CreateResponse(
                HttpStatusCode.Unauthorized,
                new { message = "Unauthorized. Anda tidak memiliki akses ke resource ini." }
            );
        }
    }
}
