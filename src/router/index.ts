import { createRouter, createWebHashHistory, createWebHistory } from "vue-router";

import HomeView from "../views/home.vue";
import SigninView from "../views/signin.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => HomeView,
  },
  {
    path: "/signin",
    name: "Signin",
    component: () => SigninView,
  },
];

const router = createRouter({
  routes,
  history: createWebHistory(),
});

export default router;
