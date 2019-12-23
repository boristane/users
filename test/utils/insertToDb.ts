import { hash } from "bcryptjs";
import { getRepository } from "typeorm";
import { User } from "../../src/entity/User";
import { ActivationToken } from "../../src/entity/ActivationToken";
import moment = require("moment");
import { Admin } from "../../src/entity/Admin";

export function insertUsers(users: Array<ITestUser>) {
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
    return await getRepository(User).insert(newUser);
  });
  return Promise.all(promises);
}

export async function insertActivationTokens(tokens: ITestActivationToken[]) {
  const promises = tokens.map(async (token, index) => {
    const user = await getRepository(User).findOneOrFail({ id: token.user });
    const newToken: ActivationToken = {
      id: index + 1,
      token: token.token,
      user,
      expires: token.expires ? new Date(token.expires) : moment().add(2, "days").toDate(),
    };
    return await getRepository(ActivationToken).insert(newToken);
  });
  return Promise.all(promises);
}

export async function insertAdmins(tokens: ITestAdmin[]) {
  const promises = tokens.map(async (admin, index) => {
    const hashedPassword = await hash(admin.password, 10);
    const newAdmin: Admin = {
      id: index + 1,
      username: admin.username,
      email: admin.email,
      password: hashedPassword,
      isSuperAdmin: admin.isSuperAdmin
    };
    return await getRepository(Admin).insert(newAdmin);
  });
  return Promise.all(promises);
}

export interface ITestUser {
  forename: string;
  surname: string;
  password: string;
  email: string;
  phone: string;
}

export interface ITestActivationToken {
  token: string;
  expires?: string;
  user: number;
}

export interface ITestAdmin {
  username: string;
  password: string;
  email: string;
  isSuperAdmin: boolean;
}
