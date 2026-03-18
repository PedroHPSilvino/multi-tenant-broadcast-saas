import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { COLLECTIONS } from "../../constants/collections";
import type { Tenant } from "../../types/tenant";

type SubscribeToTenantParams = {
  tenantId: string;
  onData: (tenant: Tenant | null) => void;
  onError?: (error: Error) => void;
};

export function subscribeToTenant({
  tenantId,
  onData,
  onError,
}: SubscribeToTenantParams): () => void {
  const tenantReference = doc(db, COLLECTIONS.tenants, tenantId);

  return onSnapshot(
    tenantReference,
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(null);
        return;
      }

      onData({
        id: snapshot.id,
        ...(snapshot.data() as Omit<Tenant, "id">),
      });
    },
    (firestoreError) => {
      if (onError) {
        onError(firestoreError);
      }
    }
  );
}