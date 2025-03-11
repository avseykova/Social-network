import { type Router } from "vue-router";
import { type IPage } from "../models/page";
import type { INavigateOptions } from "../models/navigateOptions";

let router: Router | null = null;

export const setRouter = (instance: Router): void => {
  router = instance;
};

export const navigateTo = (page: IPage, options?: INavigateOptions): void => {
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

