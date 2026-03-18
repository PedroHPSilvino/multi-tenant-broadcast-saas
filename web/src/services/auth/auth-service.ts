import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { createTenant } from "../tenants/tenant-service";
import { createMembership } from "../memberships/membership-service";

interface RegisterUserInput {
  email: string;
  password: string;
  tenantName: string;
}

export const registerUser = async ({
  email,
  password,
  tenantName,
}: RegisterUserInput) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  const userId = userCredential.user.uid;

  const tenantId = await createTenant({
    name: tenantName,
    ownerUserId: userId,
  });

  await createMembership({
    tenantId,
    userId,
  });

  return {
    user: userCredential.user,
    tenantId,
  };
};