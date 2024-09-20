import type { IRouteConfig } from "@renderer/router/type";

const routers: IRouteConfig[] = [
  {
    path: "/task",
    name: "Task",
    component: () => import("@renderer/layouts/main/index.vue"),
    meta: {
      title: "任务",
      icon: "pi-list",
    },
    redirect: "/task/list",
    children: [
      {
        path: "list",
        name: "TaskList",
        component: () => import("./views/list.vue"),
        meta: {
          activeMenu: "Task",
        },
      },
    ],
  },
];

export default routers;
