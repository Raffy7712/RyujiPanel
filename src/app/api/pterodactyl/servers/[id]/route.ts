import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { pterodactyl } from "@/lib/pterodactyl";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const [details, resources] = await Promise.all([
      pterodactyl.getClientServers().then((data: { data: Array<{ attributes: { identifier: string } }> }) => {
        const server = data.data?.find((s: { attributes: { identifier: string } }) => s.attributes.identifier === id);
        return server || null;
      }),
      pterodactyl.getServerResources(id).catch(() => null),
    ]);

    // Also try to get application-level details for admin
    let appDetails = null;
    if ((session.user as { role: string }).role === "ADMIN") {
      try {
        appDetails = await pterodactyl.getAllServers();
        const appServer = (appDetails as { data: Array<{ attributes: { identifier: string } }> }).data?.find(
          (s: { attributes: { identifier: string } }) => s.attributes.identifier === id
        );
        if (appServer) appDetails = appServer;
        else appDetails = null;
      } catch {
        // ignore
      }
    }

    return Response.json({ details, resources, appDetails });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
