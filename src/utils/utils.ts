export function getfirstParam(path: string): string {
  const [, , id] = path.split("/");
  return id;
}


export enum MembershipTier {
  basic = 0,
  premium = 1,
}