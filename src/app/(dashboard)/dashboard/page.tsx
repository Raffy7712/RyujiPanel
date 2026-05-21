import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { pterodactyl } from "@/lib/pterodactyl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Server, Users, HardDrive, ArrowRight, Settings, BookOpen } from "lucide-react"
import Link from "next/link"

async function getStats() {
  try {
    const [serversData, nodesData, usersData] = await Promise.all([
      pterodactyl.getAllServers().catch(() => null),
      pterodactyl.getNodes().catch(() => null),
      pterodactyl.getUsers().catch(() => null),
    ])

    return {
      totalServers: (serversData as { data?: unknown[] })?.data?.length ?? 0,
      totalNodes: (nodesData as { data?: unknown[] })?.data?.length ?? 0,
      totalUsers: (usersData as { data?: unknown[] })?.data?.length ?? 0,
    }
  } catch {
    return { totalServers: 0, totalNodes: 0, totalUsers: 0 }
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const isAdmin = (session?.user as { role: string })?.role === "ADMIN"
  const username = session?.user?.name || "User"
  const stats = isAdmin ? await getStats() : null

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Welcome back, <span className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">{username}</span>!
        </h1>
        <p className="text-slate-400 mt-2">
          Kelola server game Anda dari dashboard ini.
        </p>
      </div>

      {/* Stats Cards (Admin Only) */}
      {isAdmin && stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/5 border-white/5 backdrop-blur-sm hover:bg-white/[0.07] transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                Total Servers
              </CardTitle>
              <Server className="w-5 h-5 text-indigo-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.totalServers}</div>
              <p className="text-xs text-slate-500 mt-1">Server terdaftar di panel</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/5 backdrop-blur-sm hover:bg-white/[0.07] transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                Total Nodes
              </CardTitle>
              <HardDrive className="w-5 h-5 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.totalNodes}</div>
              <p className="text-xs text-slate-500 mt-1">Node aktif di panel</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/5 backdrop-blur-sm hover:bg-white/[0.07] transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                Total Users
              </CardTitle>
              <Users className="w-5 h-5 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.totalUsers}</div>
              <p className="text-xs text-slate-500 mt-1">Pengguna terdaftar</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Getting Started */}
      <Card className="bg-white/5 border-white/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            Memulai
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-indigo-400">1</span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Lihat Server Anda</p>
                <p className="text-sm text-slate-400">Akses daftar server dan kelola resource dari halaman Servers.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-indigo-400">2</span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Kelola Power Server</p>
                <p className="text-sm text-slate-400">Start, stop, restart, atau kill server langsung dari dashboard.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-indigo-400">3</span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Monitor Resource</p>
                <p className="text-sm text-slate-400">Pantau penggunaan CPU, RAM, dan Disk server secara real-time.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/dashboard/servers">
          <Card className="bg-white/5 border-white/5 backdrop-blur-sm hover:bg-white/[0.07] transition-all cursor-pointer group">
            <CardContent className="flex items-center justify-between py-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                  <Server className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">View All Servers</p>
                  <p className="text-xs text-slate-500">Lihat daftar server</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </CardContent>
          </Card>
        </Link>

        {isAdmin && (
          <Link href="/dashboard/settings">
            <Card className="bg-white/5 border-white/5 backdrop-blur-sm hover:bg-white/[0.07] transition-all cursor-pointer group">
              <CardContent className="flex items-center justify-between py-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Panel Settings</p>
                    <p className="text-xs text-slate-500">Konfigurasi panel</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
              </CardContent>
            </Card>
          </Link>
        )}
      </div>
    </div>
  )
}
