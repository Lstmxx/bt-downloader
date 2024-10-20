import { TASK_STATUS } from "@shared/enum";
import { Entity, PrimaryColumn, Column, OneToMany, ManyToOne, CreateDateColumn } from "typeorm";

@Entity()
export class TaskModel {
  @PrimaryColumn({ type: "text" })
  id: string;

  @Column({ type: "text", nullable: false })
  infoHash: string;

  @Column({ type: "text", nullable: false })
  magnetURI: string;

  @Column({ type: "text", enum: TASK_STATUS, default: TASK_STATUS.PAUSED, nullable: false })
  status: string;

  @CreateDateColumn({ type: "date", nullable: false })
  createTime: Date;

  @Column({ type: "text", nullable: false })
  path: string;

  @Column({ type: "text", nullable: false })
  name: string;

  @Column({ type: "bigint", nullable: false })
  progress: number;

  @Column({ type: "bigint", nullable: false })
  length: number;

  @Column({ type: "int", nullable: false })
  downloaded: number;

  @OneToMany(() => FileModel, (file) => file.task)
  files: FileModel[];
}

@Entity()
export class FileModel {
  @PrimaryColumn({ type: "text" })
  id: string;

  @Column({ type: "text", nullable: false })
  name: string;

  @Column({ type: "bigint", nullable: false })
  length: number;

  @Column({ type: "text", nullable: false })
  path: string;

  @Column({ type: "int", nullable: false })
  downloaded: number;

  @Column({ type: "int", nullable: false })
  progress: number;

  @ManyToOne(() => TaskModel, (task) => task.files)
  task: TaskModel;
}
