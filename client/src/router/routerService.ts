import { type Router } from 'vue-router';
import { type IPage } from "../models/page";

let router: Router | null = null;

export const setRouter = (instance: Router): void => {
  router = instance;
};

export const navigateTo = (page: IPage): void => {
  if (router) {
    router.push(page.path);
  } else {
    console.error('Router is not initialized');
  }
};
