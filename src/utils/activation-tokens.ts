export function createToken(): { token: string; expires: Date } {
  const validForHours = 2;
  const expires = new Date();
  expires.setHours(expires.getHours() + validForHours);
  const token = {
    expires,
    token: generateRandomAlphaNumString(16),
  };
  return token;
}

export function generateRandomAlphaNumString(length: number) {
  const chars =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let s = "";
  for (let i = length; i > 0; --i) {
    s += chars[Math.round(Math.random() * (chars.length - 1))];
  }
  return s;
}
