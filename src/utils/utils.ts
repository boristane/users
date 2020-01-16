export function getfirstParam(path: string): string {
  const [, , id] = path.split("/");
  return id;
}