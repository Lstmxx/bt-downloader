// src\main\service\TaskService.ts
import { DataSource } from "typeorm";
import { db } from "./index";
import { TaskModel } from "./model";

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
  }

  //初始化主角进程监听事件

  //实现新增方法
  async create(task: TaskModel[]) {
    await this.dataSource.initialize();
    const res = await this.dataSource.manager.save(task);
    await this.dataSource.destroy();
    return res;
  }

  async update(task: TaskModel) {
    await this.dataSource.initialize();
    const res = await this.dataSource.manager.save(task);
    await this.dataSource.destroy();
    return res;
  }

  //实现分页查询
  async getList(options: TaskListDTO) {
    await this.dataSource.initialize();
    // const skip = options.pageSize * options.pageNum - options.pageSize;
    const sort = options.sort === 2 ? "ASC" : "DESC";
    const listAndCount = await this.dataSource
      .createQueryBuilder(TaskModel, "task")
      .orderBy("task.createTime", sort)
      // .skip(skip)
      .take(options.pageSize)
      .getManyAndCount();
    await this.dataSource.destroy();
    return { list: listAndCount[0], count: listAndCount[1] };
  }
  close() {
    this.dataSource.destroy();
    console.log("TaskService closed");
  }
}
