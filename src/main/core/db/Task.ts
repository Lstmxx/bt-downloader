import { DataSource } from "typeorm";
import { db } from "./index";
import { TaskModel } from "./model";

//创建数据查询Modal
export interface TaskListDTO extends ListDTO {}
//列表查询基类
export interface ListDTO {
  pageNum: number;
  pageSize: number;
  sort: 1 | 2;
}

//实现TaskService
class TaskRepository {
  static instance: TaskRepository;
  dataSource: DataSource;

  //使用单例模式
  static getInstance() {
    if (!this.instance) {
      this.instance = new TaskRepository();
    }
    return this.instance;
  }

  constructor() {
    //创建数据库
    this.dataSource = db.dataSource;
  }

  //初始化主角进程监听事件

  //实现新增方法
  async create(tasks: TaskModel[]) {
    await this.dataSource.initialize();
    console.log("taskModels", tasks);
    const res = await this.dataSource.manager.save(tasks);
    console.log("res", res);
    await this.dataSource.destroy();
    return res;
  }

  async update(tasks: TaskModel) {
    await this.dataSource.initialize();
    const res = await this.dataSource.manager.save(tasks);
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
      // .take(options.pageSize)
      .getManyAndCount();
    await this.dataSource.destroy();
    return { list: listAndCount[0], count: listAndCount[1] };
  }
  close() {
    this.dataSource.destroy();
    console.log("TaskService closed");
  }
}

const taskRepository = new TaskRepository();

export default taskRepository;
