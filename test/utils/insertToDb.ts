import { hash } from "bcryptjs";
import { getRepository } from "typeorm";
import { User } from "../../src/entity/User";
import { ActivationToken } from "../../src/entity/ActivationToken";
import moment = require("moment");
import { Admin } from "../../src/entity/Admin";
import { APIService } from "../../src/entity/APIService";
import { createEncryptionKey } from "../../src/utils/tokens";

export function insertUsers(users: Array<ITestUser>) {
  const promises = users.map(async (user, index) => {
    const saltRounds = 10;
    const hashedPassword = await hash(user.password, saltRounds);
    const newUser: User = {
      id: index + 1,
      uuid: user.uuid,
      surname: user.surname,
      forename: user.forename,
      phone: user.phone,
      email: user.email,
      password: hashedPassword,
      created: new Date(),
      updated: new Date(),
      activated: false,
      optInMarketing: false,
      encryptionKey: createEncryptionKey(),
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
      isUsed: token.used
    };
    return await getRepository(ActivationToken).insert(newToken);
  });
  return Promise.all(promises);
}

export async function insertAdmins(admins: ITestAdmin[]) {
  const promises = admins.map(async (admin, index) => {
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

export async function insertApiServices(apiServices: ITestApiService[]) {
  const promises = apiServices.map(async (service, index) => {
    const newService: APIService = {
      id: index + 1,
      name: service.name,
      token: service.token,
      isActive: service.active,
      expires: moment(service.expires).toDate(),
    };
    return await getRepository(APIService).insert(newService);
  });
  return Promise.all(promises);
}

export interface ITestUser {
  forename: string;
  surname: string;
  password: string;
  email: string;
  phone: string;
  uuid: string;
}

export interface ITestActivationToken {
  token: string;
  expires?: string;
  user: number;
  used: boolean;
}

export interface ITestAdmin {
  username: string;
  password: string;
  email: string;
  isSuperAdmin: boolean;
}

export interface ITestApiService {
  name: string;
  token: string;
  active: boolean;
  expires: string;
}
