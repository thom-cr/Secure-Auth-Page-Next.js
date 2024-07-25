import { Authenticator } from "../auth/authenticator";
import { sessionStorage } from "./sessions.server";
import { WebAuthnStrategy } from "../auth/server";
import { PrismaClient, Authenticator as AuthenticatorModel, Account } from '@prisma/client';

const prisma = new PrismaClient();

export let authenticator = new Authenticator<Account>(sessionStorage);

export async function getAuthenticatorById(id: string) {
  return await prisma.authenticator.findUnique({
    where: { credentialID: id },
  });
}

export async function getAuthenticators(user: Account | null) {
  if (!user) return [];

  return await prisma.authenticator.findMany({
    where: { userId: user.id },
  });
}

export async function getUserByUsername(email: string) {
  return await prisma.account.findUnique({
    where: { email: email },
  });
}

export async function getUserById(id: string) {
  return await prisma.account.findUnique({
    where: { id: id },
  });
}

export async function createAuthenticator(
  authenticator: Omit<AuthenticatorModel, 'userId'>,
  userId: string
) {
  return await prisma.authenticator.create({
    data: {
      credentialID: authenticator.credentialID,
      userId: userId,
      credentialPublicKey: authenticator.credentialPublicKey,
      counter: authenticator.counter,
      credentialDeviceType: authenticator.credentialDeviceType,
      credentialBackedUp: authenticator.credentialBackedUp,
      transports: authenticator.transports,
      aaguid: authenticator.aaguid,
    },
  });
}

export async function createUser(email: string) {
  return await prisma.account.create({
    data: { email: email },
  });
}

export const webAuthnStrategy = new WebAuthnStrategy<Account>(
    {
      // The human-readable name of your app
      // Type: string | (response:Response) => Promise<string> | string
      rpName: "DEMO APP AUTH",
      // The hostname of the website, determines where passkeys can be used
      // See https://www.w3.org/TR/webauthn-2/#relying-party-identifier
      // Type: string | (response:Response) => Promise<string> | string
      rpID: (request: { url: string | URL; }) => new URL(request.url).hostname,
      // Website URL (or array of URLs) where the registration can occur
      origin: (request: { url: string | URL; }) => new URL(request.url).origin,
      // Return the list of authenticators associated with this user. You might
      // need to transform a CSV string into a list of strings at this step.
      getUserAuthenticators: async (user: Account | null) => {
        const authenticators = await getAuthenticators(user);
  
        return authenticators.map((authenticator) => ({
          ...authenticator,
          transports: authenticator.transports.split(","),
        }));
      },
      // Transform the user object into the shape expected by the strategy.
      // You can use a regular username, the users email address, or something else.
      getUserDetails: (user) =>
        user ? { id: user.id, username: user.email } : null,
      // Find a user in the database with their username/email.
      getUserByUsername: (username: string) => getUserByUsername(username),
      getAuthenticatorById: (id: string) => getAuthenticatorById(id),
    },
    async function verify({ authenticator, type, username }) {
      let user: Account | null = null;
      const savedAuthenticator = await getAuthenticatorById(
        authenticator.credentialID
      );
      if (type === "registration") {
        // Check if the authenticator exists in the database
        if (savedAuthenticator) {
          throw new Error("Authenticator has already been registered.");
        } else {
          // Username is null for authentication verification,
          // but required for registration verification.
          // It is unlikely this error will ever be thrown,
          // but it helps with the TypeScript checking
          if (!username) throw new Error("Username is required.");
          user = await getUserByUsername(username);
  
          // Don't allow someone to register a passkey for
          // someone elses account.
          if (user) throw new Error("User already exists.");
  
          // HANDLE NEW PASSKEY FOR EXISTING USER
          // Create a new user and authenticator
          user = await createUser(username);
          await createAuthenticator({
            credentialID: authenticator.credentialID,
            credentialPublicKey: authenticator.credentialPublicKey,
            counter: authenticator.counter,
            credentialDeviceType: authenticator.credentialDeviceType,
            credentialBackedUp: authenticator.credentialBackedUp,
            transports: authenticator.transports,
            aaguid: authenticator.aaguid,
          }, user.id);
        }
      } else if (type === "authentication") {
        if (!savedAuthenticator) throw new Error("Authenticator not found");
        user = await getUserById(savedAuthenticator.userId);
      }
  
      if (!user) throw new Error("User not found");
      return user;
    }
  );
  
authenticator.use(webAuthnStrategy);