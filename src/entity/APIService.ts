import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";

@Entity()
export class APIService {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ unique: true })
  name!: string;

  @Column({ unique: true })
  token!: string;

  @Column({ type: "timestamp" })
  expires!: Date;

  @Column({ default: true })
  isActive?: boolean;

  @Column({ type: "timestamp", nullable: true })
  lastUsed?: Date;

  @CreateDateColumn()
  created?: Date;

  @UpdateDateColumn()
  updated?: Date;
}