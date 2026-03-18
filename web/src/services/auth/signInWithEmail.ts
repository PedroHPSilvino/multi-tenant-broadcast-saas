import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";

type SignInWithEmailParams = {
  email: string;
  password: string;
};

export async function signInWithEmail({
  email,
  password,
}: SignInWithEmailParams): Promise<void> {
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    throw new Error("Email is required.");
  }

  if (!password) {
    throw new Error("Password is required.");
  }

  await signInWithEmailAndPassword(auth, trimmedEmail, password);
}