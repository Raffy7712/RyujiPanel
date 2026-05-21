import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <DashboardSidebar />
      <div className="pl-64">
        {/* Decorative blur */}
        <div className="fixed top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#0f172a]/70 border-b border-white/5 px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="text-slate-500">RyujiPanel</span>
            <span className="text-slate-600">/</span>
            <span className="text-white">Dashboard</span>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
