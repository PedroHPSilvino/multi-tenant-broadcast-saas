export const MEMBERSHIP_ROLES = {
    owner: "owner",
    member: "member",
} as const;

export type MembershipRole =
    (typeof MEMBERSHIP_ROLES)[keyof typeof MEMBERSHIP_ROLES];