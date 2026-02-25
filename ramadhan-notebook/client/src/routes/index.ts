import { createWebHistory, createRouter } from "vue-router";

import HomeView from "../pages/HomeView.vue";
import MenuView from "../pages/MenuView.vue";
import RecipeView from "../pages/RecipeView.vue";

const routes = [
  {
    path: "/",
    component: HomeView,
  },
  {
    path: "/menu",
    component: MenuView,
  },
  {
    path: "/resep",
    component: RecipeView,
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
