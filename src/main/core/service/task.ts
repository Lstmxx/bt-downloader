// src\main\service\TaskService.ts
import { ipcMain } from "electron";
import { DataSource } from "typeorm";
import { db } from "../db";
import { TaskModel } from "../db/model";

//创建数据查询Modal
export interface TaskListDTO extends ListDTO {}
//列表查询基类
export interface ListDTO {
  pageNum: number;
  pageSize: number;
  sort: number;
}

//实现TaskService
export class TaskService {
  static instance: TaskService;
  dataSource: DataSource;

  //使用单例模式
  static getInstance() {
    if (!this.instance) {
      this.instance = new TaskService();
    }
    return this.instance;
  }

  constructor() {
    //创建数据库
    this.dataSource = db.dataSource;
    this.dataSource.initialize();
    this.init();
  }

  //初始化主角进程监听事件
  init() {
    //新增数据监听
    ipcMain.handle("create-task", async (_, data: { task: TaskModel }) => {
      const task = new TaskModel();
      Object.keys(data.task).forEach((key) => {
        task[key] = data.task[key];
      });
      const res = await this.create(task);

      return res;
    });
  }

  //实现新增方法
  async create(task: TaskModel) {
    await this.dataSource.initialize();
    const res = await this.dataSource.manager.save(task);
    await this.dataSource.destroy();
    return res;
  }

  //实现分页查询
  async getList(options: TaskListDTO) {
    await this.dataSource.initialize();
    const skip = options.pageSize * options.pageNum - options.pageSize;
    const sort = options.sort === 2 ? "ASC" : "DESC";
    const listAndCount = await this.dataSource
      .createQueryBuilder(TaskModel, "task")
      .orderBy("task.id", sort)
      .skip(skip)
      .take(options.pageSize)
      .getManyAndCount();
    await this.dataSource.destroy();
    return { list: listAndCount[0], count: listAndCount[1] };
  }
  close() {
    console.log("TaskService closed");
  }
}
