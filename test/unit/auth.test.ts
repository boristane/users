import { User } from "../../src/entity/User";
import { getTokenPayload, verify, adminAuth } from "../../src/auth/auth";
import { sign } from "jsonwebtoken";
import { Admin } from "../../src/entity/Admin";
require("dotenv").config();


it("should return the correct payload for the authentication token for users", () => {
  const user = new User();
  user.uuid = "1111-1111-1111-1111";
  const payload = getTokenPayload(user);
  expect(payload).toEqual({
    uuid: user.uuid,
  });
});

it("should return the correct payload for the authentication token for admins", () => {
  const admin = new Admin();
  admin.id = 1;
  admin.email = "test@test.com"
  const payload = getTokenPayload(admin);
  expect(payload).toEqual({
    id: admin.id,
    email: admin.email,
  });
});

describe("Token verification", () => {
  it("should appropriately verify the token for users", () => {
    const token = sign("email@email.com", process.env.JWT_USERS_KEY || "");
    const userVerification = () => verify(token, "USER");
    expect(userVerification).toBeTruthy();
  });
  it("should reject a fake token for users", () => {
    const token = "fake-efubvfnvefk";
    const userVerification = () => verify(token, "USER");
    expect(userVerification).toThrow();
  });
  it("should reject a valid ADMIN token for user", () => {
    const token = sign("email@email.com", process.env.JWT_ADMINS_KEY || "");
    const userVerification = () => verify(token, "USER");
    expect(userVerification).toThrow();
  });

  it("should appropriately verify the token for admin", () => {
    const token = sign("email@email.com", process.env.JWT_ADMINS_KEY || "");
    const userVerification = () => verify(token, "ADMIN");
    expect(userVerification).toBeTruthy();
  });
  it("should reject a fake token for users", () => {
    const token = "fake-efubvfnvefk";
    const userVerification = () => verify(token, "ADMINS");
    expect(userVerification).toThrow();
  });
  it("should reject a valid USER token for admin", () => {
    const token = sign("email@email.com", process.env.JWT_USERS_KEY || "");
    const userVerification = () => verify(token, "ADMIN");
    expect(userVerification).toThrow();
  });
});
