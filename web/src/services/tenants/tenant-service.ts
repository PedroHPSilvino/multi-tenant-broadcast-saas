import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { COLLECTIONS } from "../../constants/collections";

interface CreateTenantInput {
  name: string;
  ownerUserId: string;
}

export const createTenant = async ({
  name,
  ownerUserId,
}: CreateTenantInput) => {
  const tenantReference = await addDoc(collection(db, COLLECTIONS.tenants), {
    name,
    ownerUserId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return tenantReference.id;
};