import { hash } from "bcryptjs";
import { getConnection } from "typeorm";
import { User } from "../../src/model/User";

export function insertUsers(users: Array<IUser>) {
  const promises = users.map(async (user, index) => {
    const saltRounds = 10;
    const hashedPassword = await hash(user.password, saltRounds);
    const newUser: User = {
      id: index + 1,
      surname: user.surname,
      forename: user.forename,
      phone: user.phone,
      email: user.email,
      password: hashedPassword,
      created: new Date(),
      updated: new Date(),
      activated: false,
      optInMarketing: false,
    };
    const result = await getConnection()
      .createQueryBuilder()
      .insert()
      .orIgnore()
      .into(User)
      .values(newUser)
      .execute();
    return result;
  });
  return Promise.all(promises);
}

export interface IUser {
  forename: string;
  surname: string;
  password: string;
  email: string;
  phone: string;
}