import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { pterodactyl } from "@/lib/pterodactyl";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await pterodactyl.getClientServers();
    return Response.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
