import { Pages } from "../utils/pages";
import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

const Registration = () => import("../pages/auth/Registration.vue");
const Login = () => import("../pages/auth/Login.vue");
const UserPage = () => import("../pages/UserPage.vue");

const routes: RouteRecordRaw[] = [
  { path: Pages.Registration.path, component: Registration, name: Pages.Registration.name },
  { path: Pages.Login.path, component: Login, name: Pages.Login.name },
  { path: Pages.UserPage.path, component: UserPage, name: Pages.UserPage.name },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
