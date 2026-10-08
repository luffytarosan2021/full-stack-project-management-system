import { randomBytes, randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { signToken } from "../utils/jwt.js";
import { publicUserSelect, serializeUser } from "../utils/serializers.js";

const BCRYPT_COST = 12;

// Compared against when the email is unknown, so login timing does not reveal whether it exists.
// Computed at startup so the first unknown-email login is not slower than the rest.
const dummyHashPromise = bcrypt.hash(randomBytes(32).toString("hex"), BCRYPT_COST);

const invalidCredentials = () =>
  new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password.");

const authResult = (user) => ({ token: signToken(user.id), user: serializeUser(user) });

export async function registerUser({ fullName, email, password }) {
  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

  try {
    const user = await prisma.users.create({
      data: { id: randomUUID(), full_name: fullName, email, password_hash: passwordHash },
      select: publicUserSelect,
    });
    return authResult(user);
  } catch (err) {
    if (err?.code === "P2002") {
      throw new AppError(409, "CONFLICT", "An account with this email already exists.");
    }
    throw err;
  }
}

export async function loginUser({ email, password }) {
  const user = await prisma.users.findUnique({
    where: { email },
    select: { ...publicUserSelect, password_hash: true },
  });

  const passwordMatches = await bcrypt.compare(password, user?.password_hash ?? (await dummyHashPromise));
  if (!user || !passwordMatches) throw invalidCredentials();

  return authResult(user);
}

export async function findPublicUserById(id) {
  const user = await prisma.users.findUnique({ where: { id }, select: publicUserSelect });
  return user ? serializeUser(user) : null;
}
