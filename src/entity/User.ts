import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";
import { ActivationToken } from "./ActivationToken";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  forename!: string;

  @Column()
  surname!: string;

  @Column()
  password!: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ unique: true, nullable: false })
  email!: string;

  @Column({ unique: true, nullable: false })
  uuid!: string;

  @CreateDateColumn()
  created?: Date;

  @UpdateDateColumn()
  updated?: Date;

  @Column({
    default: false
  })
  activated!: boolean;

  @Column({
    default: false
  })
  optInMarketing!: boolean;

  @OneToMany(type => ActivationToken, token => token.user, {
    onDelete: "CASCADE"
  })
  activationTokens?: ActivationToken[];
}
