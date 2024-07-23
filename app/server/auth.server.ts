import { Authenticator } from "../auth/authenticator";
import { sessionStorage } from "./sessions.server";
import { WebAuthnStrategy } from "../auth/server";
import {
    getAuthenticators,
    getUserByUsername,
    getAuthenticatorById,
    type User,
    createUser,
    createAuthenticator,
    getUserById,
} from "./db.server";

export let authenticator = new Authenticator<User>(sessionStorage);

export const webAuthnStrategy = new WebAuthnStrategy<User>(
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
      getUserAuthenticators: async (user: User | null) => {
        const authenticators = await getAuthenticators(user);
  
        return authenticators.map((authenticator) => ({
          ...authenticator,
          transports: authenticator.transports.split(","),
        }));
      },
      // Transform the user object into the shape expected by the strategy.
      // You can use a regular username, the users email address, or something else.
      getUserDetails: (user) =>
        user ? { id: user.id, username: user.username } : null,
      // Find a user in the database with their username/email.
      getUserByUsername: (username: string) => getUserByUsername(username),
      getAuthenticatorById: (id: string) => getAuthenticatorById(id),
    },
    async function verify({ authenticator, type, username }) {
      let user: User | null = null;
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
          await createAuthenticator(authenticator, user.id);
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