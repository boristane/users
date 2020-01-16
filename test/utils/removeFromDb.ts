import { getConnection } from "typeorm";
import { User } from "../../src/entity/User";
import { Admin } from "../../src/entity/Admin";
import { APIService } from "../../src/entity/APIService";
import { ActivationToken } from "../../src/entity/ActivationToken";

export function removeUsersFromDB() {
  const promises = [];
  promises.push(
    getConnection()
      .createQueryBuilder()
      .delete()
      .from(User)
      .execute()
  );
  return Promise.all(promises);
}

export function removeAdminsFromDB() {
  const promises = [];
  promises.push(
    getConnection()
      .createQueryBuilder()
      .delete()
      .from(Admin)
      .execute()
  );
  return Promise.all(promises);
}

export function removeApiServicesFromDB() {
  const promises = [];
  promises.push(
    getConnection()
      .createQueryBuilder()
      .delete()
      .from(APIService)
      .execute()
  );
  return Promise.all(promises);
}

export function removeActivationTokensFromDB() {
  const promises = [];
  promises.push(
    getConnection()
      .createQueryBuilder()
      .delete()
      .from(ActivationToken)
      .execute()
  );
  return Promise.all(promises);
}

export async function removeAllFromDB() {
  await removeActivationTokensFromDB();
  await removeUsersFromDB();
  await removeAdminsFromDB();
  await removeApiServicesFromDB();
}
