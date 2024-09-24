import { db } from "../db";
import { TaskService } from "./task";

export const initService = () => {
  console.log("Service initialized");
  new TaskService();
};

export const closeService = () => {
  console.log("Service closed");
  db.close();
};
