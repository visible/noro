import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { upload } from "@/lib/r2";
import { teamvaultkey, type TeamMember } from "@/lib/teams";

interface MembershipWithTeam {
  role: string;
  team: {
    id: string;
    name: string;
    createdAt: Date;
    members: Pick<TeamMember, "id" | "email" | "role" | "status">[];
  };
}

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const memberships = await db.teamMember.findMany({
      where: {
        userId: session.user.id,
        status: "accepted",
      },
      include: {
        team: {
          include: {
            members: {
              select: {
                id: true,
                email: true,
                role: true,
                status: true,
              },
            },
          },
        },
      },
    });

    const teams = (memberships as MembershipWithTeam[]).map((m) => ({
      id: m.team.id,
      name: m.team.name,
      role: m.role,
      memberCount: m.team.members.filter((x) => x.status === "accepted").length,
      createdAt: m.team.createdAt,
    }));

    return NextResponse.json({ teams });
  } catch {
    return NextResponse.json({ error: "failed to list teams" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "name required" }, { status: 400 });
    }

    if (name.length > 100) {
      return NextResponse.json({ error: "name too long" }, { status: 400 });
    }

    const team = await db.team.create({
      data: {
        name: name.trim(),
        members: {
          create: {
            userId: session.user.id,
            email: session.user.email,
            role: "owner",
            status: "accepted",
            joinedAt: new Date(),
          },
        },
      },
    });

    const blobKey = teamvaultkey(team.id);
    const emptyVault = Buffer.from(JSON.stringify({ items: [], version: 1 }));
    await upload(blobKey, emptyVault);

    await db.teamVault.create({
      data: {
        teamId: team.id,
        blobKey,
        revision: 1,
        size: emptyVault.length,
      },
    });

    const h = await headers();
    await db.teamAuditLog.create({
      data: {
        teamId: team.id,
        userId: session.user.id,
        action: "team.created",
        ip: h.get("x-forwarded-for") || h.get("x-real-ip"),
      },
    });

    return NextResponse.json({ team: { id: team.id, name: team.name } });
  } catch {
    return NextResponse.json({ error: "failed to create team" }, { status: 500 });
  }
}
