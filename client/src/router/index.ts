import { Pages } from "../utils/pages";
import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

const Registration = () => import('../pages/auth/Registration.vue');
const Login = () => import('../pages/auth/Login.vue');
const UserPage = () => import('../pages/UserPage.vue');
const Messages = () => import('../pages/Messages.vue');
const AllUsersPage = () => import('../pages/AllUsersPage.vue');
const Chats = () => import('../pages/Chats.vue');
const Home = () => import('../pages/Home.vue');

const routes: RouteRecordRaw[] = [
  { path: Pages.Registration.path, component: Registration, name: Pages.Registration.name },
  { path: Pages.Login.path, component: Login, name: Pages.Login.name },
  { path: Pages.UserPage.path, component: UserPage, name: Pages.UserPage.name },
  { path: Pages.Messages.path, component: Messages, name: Pages.Messages.name },
  { path: Pages.AllUsersPage.path, component: AllUsersPage, name: Pages.AllUsersPage.name },
  { path: Pages.Chats.path, component: Chats, name: Pages.Chats.name },
  { path: Pages.Home.path, component: Home, name: Pages.Home.name },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
