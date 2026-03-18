import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { COLLECTIONS } from "../../constants/collections";
import { MEMBERSHIP_ROLES } from "../../constants/membership-roles";

interface CreateMembershipInput {
  tenantId: string;
  userId: string;
}

export const createMembership = async ({
  tenantId,
  userId,
}: CreateMembershipInput) => {
  const membershipId = `${userId}_${tenantId}`;

  await setDoc(doc(db, COLLECTIONS.memberships, membershipId), {
    tenantId,
    userId,
    role: MEMBERSHIP_ROLES.owner,
    createdAt: serverTimestamp(),
  });

  return membershipId;
};