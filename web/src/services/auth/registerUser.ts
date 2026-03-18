import { createUserWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { COLLECTIONS } from "../../constants/collections";
import { MEMBERSHIP_ROLES } from "../../constants/membership-roles";

type RegisterUserParams = {
  email: string;
  password: string;
  tenantName: string;
};

export async function registerUser({
  email,
  password,
  tenantName,
}: RegisterUserParams): Promise<void> {
  const trimmedEmail = email.trim();
  const trimmedTenantName = tenantName.trim();

  if (!trimmedEmail) {
    throw new Error("Email is required.");
  }

  if (!password) {
    throw new Error("Password is required.");
  }

  if (password.length < 6) {
    throw new Error("Password must have at least 6 characters.");
  }

  if (!trimmedTenantName) {
    throw new Error("Tenant name is required.");
  }

  const credential = await createUserWithEmailAndPassword(
    auth,
    trimmedEmail,
    password
  );

  const userId = credential.user.uid;
  const now = Timestamp.now();

  const tenantReference = await addDoc(collection(db, COLLECTIONS.tenants), {
    name: trimmedTenantName,
    ownerUserId: userId,
    createdAt: now,
    updatedAt: now,
  });

  await setDoc(doc(db, COLLECTIONS.memberships, userId), {
    tenantId: tenantReference.id,
    userId,
    role: MEMBERSHIP_ROLES.owner,
    createdAt: now,
  });
}