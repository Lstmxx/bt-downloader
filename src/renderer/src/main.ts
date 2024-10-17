import { createApp } from "vue";
import App from "./App.vue";

import "./assets/main.css";

import PrimeVue from "primevue/config";

import router from "./router";
import { CustomPreset } from "./core/theme";

import "primeicons/primeicons.css";

import store from "@renderer/store";

import ToastService from "primevue/toastservice";

// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
// import './demos/node'

const app = createApp(App);

app.use(PrimeVue, {
  theme: {
    preset: CustomPreset,
    options: {
      prefix: "p",
      darkModeSelector: ".app",
      cssLayer: false,
    },
  },
});

app.use(ToastService);

app.use(router);

app.use(store);

app.mount("#app").$nextTick(() => {
  postMessage(
    {
      payload: "removeLoading",
    },
    "*",
  );
});
