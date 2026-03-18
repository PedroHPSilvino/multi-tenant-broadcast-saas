import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { COLLECTIONS } from "../../constants/collections";
import type { Membership } from "../../types/membership";

type GetMembershipByUserIdParams = {
  userId: string;
};

export async function getMembershipByUserId({
  userId,
}: GetMembershipByUserIdParams): Promise<Membership | null> {
  const membershipReference = doc(db, COLLECTIONS.memberships, userId);
  const membershipSnapshot = await getDoc(membershipReference);

  if (!membershipSnapshot.exists()) {
    return null;
  }

  return {
    id: membershipSnapshot.id,
    ...(membershipSnapshot.data() as Omit<Membership, "id">),
  };
}