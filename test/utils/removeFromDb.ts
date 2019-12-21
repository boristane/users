import { getConnection } from "typeorm";
import { User } from "../../src/model/User";

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
