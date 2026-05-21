import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { pterodactyl } from "@/lib/pterodactyl";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { signal } = body as { signal: string };

    if (!["start", "stop", "restart", "kill"].includes(signal)) {
      return Response.json(
        { error: "Invalid signal. Must be: start, stop, restart, kill" },
        { status: 400 }
      );
    }

    await pterodactyl.setPowerState(id, signal);
    return Response.json({ success: true, signal });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
