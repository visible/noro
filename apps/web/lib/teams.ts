export type TeamRole = "owner" | "admin" | "member" | "viewer";
export type InviteStatus = "pending" | "accepted" | "declined";

export interface Team {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  email: string;
  role: TeamRole;
  invitedAt: Date;
  joinedAt: Date | null;
  status: InviteStatus;
}

export interface TeamVault {
  id: string;
  teamId: string;
  blobKey: string;
  revision: number;
  size: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamAuditLog {
  id: string;
  teamId: string;
  userId: string;
  action: string;
  details: string | null;
  ip: string | null;
  createdAt: Date;
}

type Permission = "read" | "write" | "manage" | "invite" | "delete" | "transfer";

const permissions: Record<TeamRole, readonly Permission[]> = {
  owner: ["read", "write", "manage", "invite", "delete", "transfer"],
  admin: ["read", "write", "manage", "invite"],
  member: ["read", "write"],
  viewer: ["read"],
};

export function haspermission(role: TeamRole, permission: Permission): boolean {
  return permissions[role].includes(permission);
}

export function canread(role: TeamRole): boolean {
  return haspermission(role, "read");
}

export function canwrite(role: TeamRole): boolean {
  return haspermission(role, "write");
}

export function canmanage(role: TeamRole): boolean {
  return haspermission(role, "manage");
}

export function caninvite(role: TeamRole): boolean {
  return haspermission(role, "invite");
}

export function candelete(role: TeamRole): boolean {
  return haspermission(role, "delete");
}

export function cantransfer(role: TeamRole): boolean {
  return haspermission(role, "transfer");
}

export function isvalidrole(role: string): role is TeamRole {
  return ["owner", "admin", "member", "viewer"].includes(role);
}

export function isvalidemail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function teamvaultkey(teamId: string): string {
  return `teams/${teamId}/vault.enc`;
}
