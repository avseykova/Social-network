import { Pages } from '../utils/pages';
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

const Registration = () => import("../pages/auth/Registration.vue");
const Login = () => import("../pages/auth/Login.vue");

const routes: RouteRecordRaw[] = [
  { path: Pages.Rgistration.path, component: Registration, name: Pages.Rgistration.name },
  { path: Pages.Login.path, component: Login, name: Pages.Login.name }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
