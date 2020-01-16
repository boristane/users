import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";
import { User } from "./User";

@Entity()
export class ActivationToken {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ unique: true })
  token!: string;

  @ManyToOne(type => User, user => user.activationTokens, {
    onDelete: "CASCADE"
  })
  user!: User;

  @Column({ type: "timestamp" })
  expires!: Date;

  @Column( {default: false} )
  isUsed!: boolean;

  @CreateDateColumn()
  created?: Date;

  @UpdateDateColumn()
  updated?: Date;
}
