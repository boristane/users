import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";

@Entity()
export class Admin {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  username!: string;

  @Column()
  password!: string;

  @Column({ unique: true, nullable: false })
  email!: string;

  @CreateDateColumn()
  created?: Date;

  @UpdateDateColumn()
  updated?: Date;

  @Column({
    default: false
  })
  isSuperAdmin!: boolean;
}