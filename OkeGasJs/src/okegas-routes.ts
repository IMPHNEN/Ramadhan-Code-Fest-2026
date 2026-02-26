// This file is auto-generated. Do not edit.
import React from "react";
import Page_index from "./pages/index";
import Page_jokowi from "./pages/jokowi";
import Page_prabowo from "./pages/prabowo";
import Page_ssr_test from "./pages/ssr-test";
import App from "./pages/_app";

export const routes: Record<string, any> = {
  "/": Page_index,
  "/index": Page_index, // Server converts / to /index
  "/jokowi": Page_jokowi,
  "/prabowo": Page_prabowo,
  "/ssr-test": Page_ssr_test,
};

export const AppLayout = App;
