import React from "react";
import { useRouter } from "./router";

export const Link = ({ href, children, className }: any) => {
  // Check if router context is available (client-side only)
  let navigate: ((url: string) => void) | null = null;

  try {
    const router = useRouter();
    navigate = router.navigate;
  } catch (e) {
    // Router context not available (SSR), will use regular anchor behavior
  }

  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        if (navigate) {
          e.preventDefault();
          navigate(href);
        }
        // If no navigate function, let the browser handle the navigation normally
      }}
    >
      {children}
    </a>
  );
};
