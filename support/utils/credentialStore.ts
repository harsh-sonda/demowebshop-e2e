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
  // If credentials are provided via environment variables, prefer them
  const envEmail = process.env.REGISTER_EMAIL;
  const envPassword = process.env.REGISTER_PASSWORD;

  const record: RegisteredUser = {
    ...user,
    email: envEmail ?? user.email,
    password: envPassword ?? user.password,
    registeredAt: new Date().toISOString(),
  };

  try {
    fs.mkdirSync(path.dirname(CREDENTIALS_PATH), { recursive: true });
    // Do not persist the password to disk — remove it from the written record
    const fileRecord = { ...record } as Partial<RegisteredUser>;
    delete fileRecord.password;

    fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(fileRecord, null, 2), "utf-8");
  } catch (err) {
    // Log and continue — do not block test flow due to saving failure
    // eslint-disable-next-line no-console
    console.error("Failed to save registered user to disk:", err);
  }

  return record;
}

export function loadRegisteredUser(): RegisteredUser | null {
  try {
    if (!fs.existsSync(CREDENTIALS_PATH)) {
      return null;
    }

    const file = JSON.parse(
      fs.readFileSync(CREDENTIALS_PATH, "utf-8")
    ) as RegisteredUser;

    // Override with env values if present so `.env` always takes precedence
    const envEmail = process.env.REGISTER_EMAIL;
    const envPassword = process.env.REGISTER_PASSWORD;

    return {
      ...file,
      email: envEmail ?? file.email,
      password: envPassword ?? file.password ?? "",
    } as RegisteredUser;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to load registered user from disk:", err);
    return null;
  }
}
