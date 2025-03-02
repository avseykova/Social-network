import { type Router } from "vue-router";
import { type IPage } from "../models/page";

let router: Router | null = null;

export const setRouter = (instance: Router): void => {
  router = instance;
};

interface NavigateOptions {
  params?: Record<string, any>;
  query?: Record<string, any>;
}

export const navigateTo = (page: IPage, options?: NavigateOptions): void => {
  if (router) {
    console.log('dsfds', options?.params);
    router.push({
      name: page.name,
      params: options?.params,
      query: options?.query
    });
  } else {
    console.error('Router is not initialized');
  }
};

