import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET server access for a user
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  // If userId is "all" or not provided, return all access entries (admin only)
  if (!userId || userId === "all") {
    if ((session.user as { role: string }).role !== "ADMIN") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    try {
      const access = await db.serverAccess.findMany({
        include: {
          user: {
            select: { id: true, username: true, role: true },
          },
        },
      });
      return Response.json(access);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return Response.json({ error: message }, { status: 500 });
    }
  }

  // Only admin or the user themselves can see access
  if (
    (session.user as { role: string }).role !== "ADMIN" &&
    session.user.id !== userId
  ) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const access = await db.serverAccess.findMany({
      where: { userId },
    });
    return Response.json(access);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}

// POST assign server access
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if ((session.user as { role: string }).role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as {
      userId: string;
      pterodactylServerId: string;
    };

    const access = await db.serverAccess.create({
      data: {
        userId: body.userId,
        pterodactylServerId: body.pterodactylServerId,
      },
    });

    return Response.json(access, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}

// DELETE remove server access
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if ((session.user as { role: string }).role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as {
      userId: string;
      pterodactylServerId: string;
    };

    await db.serverAccess.deleteMany({
      where: {
        userId: body.userId,
        pterodactylServerId: body.pterodactylServerId,
      },
    });

    return Response.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
