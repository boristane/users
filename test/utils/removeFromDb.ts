import { getConnection } from "typeorm";
import { User } from "../../src/entity/User";

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
