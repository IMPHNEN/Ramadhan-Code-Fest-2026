import React, { createContext, useContext, useState, useEffect } from "react";
import { routes } from "../okegas-routes";

interface RouterState {
  page: string;
  props: any;
}

interface RouterContextType extends RouterState {
  navigate: (url: string) => void;
}

const RouterContext = createContext<RouterContextType | null>(null);

export const RouterProvider = ({ initialData, children }: any) => {
  const [state, setState] = useState<RouterState>({
    page: initialData.page,
    props: initialData.props,
  });

  const navigate = async (url: string) => {
    // 1. Push State
    window.history.pushState({}, "", url);

    // 2. Fetch Data
    try {
      const res = await fetch(url, { headers: { "x-okegas-data": "1" } });
      const data = await res.json();

      // 3. Update State
      setState({
        page: data.page,
        props: data.props,
      });
    } catch (e) {
      console.error("Navigation failed", e);
      window.location.href = url; // Fallback to full reload
    }
  };

  useEffect(() => {
    const onPopState = () => {
      // Handle back button by re-fetching the target state
      navigate(window.location.pathname + window.location.search);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return (
    <RouterContext.Provider value={{ ...state, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) throw new Error("useRouter must be used within RouterProvider");
  return context;
};
