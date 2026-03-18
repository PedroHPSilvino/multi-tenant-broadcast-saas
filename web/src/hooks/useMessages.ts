import { useEffect, useState } from "react";
import type { MessageStatus } from "../constants/message-statuses";
import { subscribeToMessages } from "../services/messages/subscribeToMessages";
import { reconcileScheduledMessages } from "../services/messages/reconcileScheduledMessages";
import type { Message } from "../types/message";

type UseMessagesParams = {
    tenantId: string | null;
    connectionId: string | null;
    status?: MessageStatus;
};

type UseMessagesResult = {
    messages: Message[];
    loading: boolean;
    error: string | null;
};

export function useMessages({
    tenantId,
    connectionId,
    status,
}: UseMessagesParams): UseMessagesResult {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!tenantId || !connectionId) {
            setMessages([]);
            setLoading(false);
            setError(null);
            return;
        }

        let isMounted = true;

        async function start() {

            if (!tenantId || !connectionId) {
                return;
            }
            
            try {
                await reconcileScheduledMessages({
                    tenantId,
                    connectionId,
                });
            } catch (reconcileError) {
                console.error(reconcileError);
            }

            if (!isMounted) {
                return;
            }

            const unsubscribe = subscribeToMessages({
                tenantId,
                connectionId,
                status,
                onData: (nextMessages) => {
                    setMessages(nextMessages);
                    setLoading(false);
                },
                onError: (nextError) => {
                    console.error(nextError);
                    setError("Failed to load messages.");
                    setLoading(false);
                },
            });

            return unsubscribe;
        }

        setLoading(true);
        setError(null);

        let unsubscribe: (() => void) | undefined;

        start().then((cleanup) => {
            unsubscribe = cleanup;
        });

        const interval = window.setInterval(() => {
            reconcileScheduledMessages({
                tenantId,
                connectionId,
            }).catch((reconcileError) => {
                console.error(reconcileError);
            });
        }, 30000);

        return () => {
            isMounted = false;
            window.clearInterval(interval);

            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [tenantId, connectionId, status]);

    return {
        messages,
        loading,
        error,
    };
}