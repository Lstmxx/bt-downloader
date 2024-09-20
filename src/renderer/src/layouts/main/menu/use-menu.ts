import { computed, ref } from "vue";
import { useRoute } from "vue-router";

import asyncRoutes from "@renderer/router/async-route";

export type MenuItem = {
  label: string;
  svg: string;
  routeName: string;
};

export function useMenu() {
  const route = useRoute();

  const menuList = ref<MenuItem[]>(
    asyncRoutes
      .filter((r) => r.meta && r.meta.icon)
      .map((r) => {
        return {
          label: r.meta!.title!,
          svg: r.meta!.icon!,
          routeName: (r.name as string) || "",
        };
      }),
  );
  const currentMenu = computed(() => {
    const { activeMenu } = route.meta;
    return activeMenu || "";
  });
  return {
    menuList,
    currentMenu,
  };
}
