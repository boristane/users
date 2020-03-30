import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne
} from "typeorm";
import { User } from "./User";
import { MembershipTier } from "../utils/utils";

@Entity()
export class Membership {
  @PrimaryGeneratedColumn()
  id?: number;

  @ManyToOne(type => User, user => user.activationTokens, {
    onDelete: "CASCADE"
  })
  user?: User;

  @Column({ type: "enum", enum: MembershipTier, default: MembershipTier.basic })
  tier!: MembershipTier;

  @CreateDateColumn()
  startDate?: Date;

  @Column({ type: "timestamp" })
  expirationDate!: Date;

  @Column( {default: false} )
  isActive!: boolean;

  @CreateDateColumn()
  created?: Date;

  @UpdateDateColumn()
  updated?: Date;
}
