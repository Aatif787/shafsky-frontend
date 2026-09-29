/**
 * Clerk sign-up orchestration for the installed future API.
 *
 * Email verification uses verifications.sendEmailCode / verifyEmailCode,
 * which is this SDK's email_code strategy. The FastAPI exchange runs only
 * after Clerk reports status "complete" and a session token exists.
 */

import { establishApplicationSession, type EstablishedSession } from "./clerkSession";

export interface ClerkSignUpAttempt {
  status: string;
  missingFields?: string[];
  unverifiedFields?: string[];
}

export interface ClerkSignUpClient {
  create: (params: {
    emailAddress: string;
    password: string;
    username: string;
    firstName?: string;
  }) => Promise<{ error: Error | null; attempt: ClerkSignUpAttempt }>;
  sendEmailCode: () => Promise<{ error: Error | null; attempt: ClerkSignUpAttempt }>;
  verifyEmailCode: (code: string) => Promise<{ error: Error | null; attempt: ClerkSignUpAttempt }>;
  finalize: () => Promise<{ error: Error | null; attempt: ClerkSignUpAttempt }>;
  getSessionToken: () => Promise<string | null>;
}

export interface SignUpFlowResult {
  error: Error | null;
  verificationRequired: boolean;
  session?: EstablishedSession;
}

async function establishWhenComplete(
  client: ClerkSignUpClient,
  attempt: ClerkSignUpAttempt,
): Promise<SignUpFlowResult> {
  if (attempt.status !== "complete") {
    return {
      error: new Error("Sign-up is not complete."),
      verificationRequired: (attempt.unverifiedFields || []).includes("email_address"),
    };
  }
  const finalized = await client.finalize();
  if (finalized.error) {
    return { error: finalized.error, verificationRequired: false };
  }
  if (finalized.attempt.status !== "complete") {
    return { error: new Error("Sign-up is not complete."), verificationRequired: true };
  }
  const clerkToken = await client.getSessionToken();
  if (!clerkToken) {
    return { error: new Error("Clerk session token was not issued."), verificationRequired: false };
  }
  const established = await establishApplicationSession(clerkToken);
  if (established.error || !established.session) {
    return {
      error: established.error || new Error("Application session could not be created."),
      verificationRequired: false,
    };
  }
  return { error: null, verificationRequired: false, session: established.session };
}

function clerkUsernameFromEmail(email: string): string {
  const local = email.trim().toLowerCase().split("@")[0]?.split("+")[0] ?? "";
  let name = local.replace(/[^a-z0-9]/g, "");
  if (!/[a-z]/.test(name)) name = `user${name}`;
  if (name.length < 4) name = `${name}user`;
  return name.slice(0, 32);
}

export async function beginClerkSignUp(
  client: ClerkSignUpClient,
  input: { email: string; password: string; fullName: string },
): Promise<SignUpFlowResult> {
  const created = await client.create({
    emailAddress: input.email.trim().toLowerCase(),
    password: input.password,
    username: clerkUsernameFromEmail(input.email),
    firstName: input.fullName.trim() || undefined,
  });
  if (created.error) {
    return { error: created.error, verificationRequired: false };
  }
  if (created.attempt.status === "complete") {
    return establishWhenComplete(client, created.attempt);
  }

  const sent = await client.sendEmailCode();
  if (sent.error) {
    return { error: sent.error, verificationRequired: false };
  }
  if (sent.attempt.status === "complete") {
    return establishWhenComplete(client, sent.attempt);
  }
  return { error: null, verificationRequired: true };
}

export async function verifyClerkEmailCode(
  client: ClerkSignUpClient,
  code: string,
): Promise<SignUpFlowResult> {
  const trimmed = code.trim();
  if (!trimmed) {
    return { error: new Error("Enter the email verification code."), verificationRequired: true };
  }
  const verified = await client.verifyEmailCode(trimmed);
  if (verified.error) {
    return { error: verified.error, verificationRequired: true };
  }
  if (verified.attempt.status !== "complete") {
    return { error: new Error("Sign-up is not complete."), verificationRequired: true };
  }
  return establishWhenComplete(client, verified.attempt);
}
