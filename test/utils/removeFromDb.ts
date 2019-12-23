import { getConnection } from "typeorm";
import { User } from "../../src/entity/User";
import { Admin } from "../../src/entity/Admin";

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

export async function removeAllFromDB() {
  await removeUsersFromDB();
  await removeAdminsFromDB();
}
