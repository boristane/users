import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";
import { ActivationToken } from "./ActivationToken";
import { Membership } from "./Membership";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  forename!: string;

  @Column({ nullable: true })
  surname?: string;

  @Column()
  password!: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ unique: true, nullable: false })
  email!: string;

  @Column({ unique: true, nullable: false })
  uuid!: string;

  @Column({ nullable: false })
  encryptionKey!: string;

  @CreateDateColumn()
  created?: Date;

  @UpdateDateColumn()
  updated?: Date;

  @Column({
    default: false
  })
  activated!: boolean;

  @OneToMany(type => ActivationToken, token => token.user, {
    onDelete: "CASCADE",
    cascade: true,
  })
  activationTokens?: ActivationToken[];

  @OneToMany(type => Membership, sub => sub.user, {
    onDelete: "CASCADE",
    cascade: true,
    nullable: false,
  })
  memberships!: Membership[];
}
