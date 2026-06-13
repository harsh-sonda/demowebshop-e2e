import fs from "fs";
import path from "path";

export interface RegisteredUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  gender: string;
  registeredAt: string;
}

const CREDENTIALS_PATH = path.resolve(
  process.cwd(),
  "support/testData/registeredUser.json"
);

export function saveRegisteredUser(
  user: Omit<RegisteredUser, "registeredAt">
): RegisteredUser {
  const record: RegisteredUser = {
    ...user,
    registeredAt: new Date().toISOString(),
  };

  fs.mkdirSync(path.dirname(CREDENTIALS_PATH), { recursive: true });
  fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(record, null, 2), "utf-8");

  return record;
}

export function loadRegisteredUser(): RegisteredUser | null {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    return null;
  }

  return JSON.parse(
    fs.readFileSync(CREDENTIALS_PATH, "utf-8")
  ) as RegisteredUser;
}
