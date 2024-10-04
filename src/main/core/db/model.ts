import { TaskStatus } from "@shared/enum";
import { Entity, PrimaryColumn, Column, OneToMany, ManyToOne } from "typeorm";

@Entity()
export class TaskModel {
  @PrimaryColumn({ type: "int" })
  id: number;

  @Column({ type: "text", nullable: false })
  infoHash: string;

  @Column({ type: "text", nullable: false })
  magnetURI: string;

  @Column({ type: "text", enum: TaskStatus, default: TaskStatus.Pending, nullable: false })
  status: string;

  @Column({ type: "date", nullable: false })
  createTime: Date;

  @Column({ type: "text", nullable: false })
  path: string;

  @Column({ type: "text", nullable: false })
  name: string;

  @Column({ type: "bigint", nullable: false })
  progress: number;

  @Column({ type: "bigint", nullable: false })
  length: number;

  @OneToMany(() => FileModel, (file) => file.task)
  files: FileModel[];
}

@Entity()
export class FileModel {
  @PrimaryColumn({ type: "int" })
  id: number;

  @Column({ type: "text", nullable: false })
  name: string;

  @Column({ type: "bigint", nullable: false })
  length: number;

  @Column({ type: "boolean", nullable: false })
  isSelected: boolean;

  @Column({ type: "text", nullable: false })
  path: string;

  @Column({ type: "boolean", nullable: false })
  downloaded: boolean;

  @ManyToOne(() => TaskModel, (task) => task.files)
  task: TaskModel;
}
