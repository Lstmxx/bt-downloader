import type { IRouteConfig } from "@renderer/router/type";

const routers: IRouteConfig[] = [
  {
    path: "/setting",
    name: "Setting",
    component: () => import("@renderer/layouts/main/index.vue"),
    meta: {
      title: "设置",
      icon: "pi-cog",
    },
    redirect: "/setting/base-setting",
    children: [
      {
        path: "base-setting",
        name: "BaseSetting",
        component: () => import("./views/base-setting.vue"),
        meta: {
          activeMenu: "Setting",
        },
      },
    ],
  },
];

export default routers;
