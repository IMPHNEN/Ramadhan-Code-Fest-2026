using System;
using System.Web;
using System.Web.Mvc;

namespace client.Filters
{
    public class CustomAuthorizeAttribute : AuthorizeAttribute
    {
        protected override bool AuthorizeCore(HttpContextBase httpContext)
        {
            // Cek apakah user sudah login (ada session Username)
            if (httpContext.Session["Username"] != null)
            {
                return true; // User sudah login, allow access
            }
            return false; // User belum login, deny access
        }

        protected override void HandleUnauthorizedRequest(AuthorizationContext filterContext)
        {
            // Redirect ke halaman login jika belum login
            filterContext.Result = new RedirectResult("~/Home/Index");
        }
    }
}
