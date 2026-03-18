export const ROUTES = {
  login: "/login",
  register: "/register",
  dashboard: "/",
  connections: "/connections",
  contacts: "/connections/:connectionId/contacts",
  messages: "/connections/:connectionId/messages",
} as const;