import { IRouteConfig } from "./type";

const routers: IRouteConfig[] = [
  {
    path: "",
    name: "Index",
    component: () => import("@renderer/layouts/main/index.vue"),
    redirect: "/task",
    children: [],
  },
];

export default routers;
