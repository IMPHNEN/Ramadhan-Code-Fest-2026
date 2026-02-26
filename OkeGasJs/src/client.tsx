import React from "react";
import { hydrateRoot } from "react-dom/client";
import { routes, AppLayout } from "./okegas-routes";
import { RouterProvider, useRouter } from "./lib/router";

// Main Client Application that reacts to Route Changes
const ClientApp = () => {
  const { page, props } = useRouter();
  const PageComponent = routes[page] || routes["/404"];

  if (!PageComponent) return <div>Page Not Found</div>;

  let App = <PageComponent {...props.pageProps} />;

  if (AppLayout) {
    App = <AppLayout Component={PageComponent} pageProps={props.pageProps} />;
  }
  return App;
};

// Define the shape of our injected data
interface OkeGasData {
  props: { pageProps: any };
  page: string;
  query: any;
  params: any;
}

declare global {
  interface Window {
    __OKEGAS_DATA__: OkeGasData;
  }
}

if (document.getElementById("__okegasjs")) {
  const dataScript = document.getElementById("_OKEGAS_DATA_");
  const data = dataScript ? JSON.parse(dataScript.textContent || "{}") : {};

  console.log("[OkeGas Client] Hydrating SPA...", data.page);

  const container = document.getElementById("__okegasjs")!;
  hydrateRoot(
    container,
    <RouterProvider initialData={data}>
      <ClientApp />
    </RouterProvider>
  );
}
