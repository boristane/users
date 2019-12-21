import { createToken } from "../../src/utils/activation-tokens"

describe("Activation token generation", () => {
  it("Generates a valid token string", () => {
    const result = createToken();
    expect(result.token).toBeTruthy();
    expect(result.token.length).toEqual(16);
    expect(result.expires).toBeInstanceOf(Date);
  });

  it("Generates a token that expires in two hours", () => {
    const result = createToken();
    const now = new Date();
    expect(result.expires.getHours()).toEqual(now.getHours() + 2);
  });
})