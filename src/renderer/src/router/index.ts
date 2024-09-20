import { createRouter, createWebHistory } from "vue-router";
import asyncRoute from "./async-route";
import constantRoute from "./constant-route";

export const routes = [...constantRoute, ...asyncRoute];

const router = createRouter({
  scrollBehavior: () => ({ left: 0, top: 0 }),
  history: createWebHistory(),
  routes,
});

export default router;