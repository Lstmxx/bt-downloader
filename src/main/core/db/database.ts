// src\main\service\database.ts
import path from "path";
import { DataSource } from "typeorm";
import { app } from "electron";
// import { is } from "@electron-toolkit/utils";
import { BetterSqlite3ConnectionOptions } from "typeorm/driver/better-sqlite3/BetterSqlite3ConnectionOptions";
import { TaskModel, FileModel } from "./model";

export class DataBase {
  dataSource: DataSource;

  //初始化数据库文件
  constructor(database: string) {
    //使用该方法获取缓存目录从而实现软件升级或卸载数据保留
    // 例：windows下文件存储位置
    // C:\Users\WHWAN\AppData\Roaming\pc-client\data\message.db
    const basePath = path.join(app.getPath("appData"), app.getName(), `./${database}.sql`);
    const options: BetterSqlite3ConnectionOptions = {
      type: "better-sqlite3",
      entities: [TaskModel, FileModel],
      database: basePath,
      synchronize: true,
    };
    this.dataSource = new DataSource(options);
    console.log("db_path", basePath, this.dataSource);
  }

  close() {
    this.dataSource.destroy();
  }
}
