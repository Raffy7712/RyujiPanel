"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Server, Search, ArrowRight } from "lucide-react"

interface ServerAttributes {
  identifier: string
  name: string
  status: string | null
  limits: {
    memory: number
    cpu: number
    disk: number
  }
}

interface PterodactylServer {
  attributes: ServerAttributes
}

function StatusBadge({ status }: { status: string | null }) {
  const config: Record<string, { label: string; className: string }> = {
    running: {
      label: "Running",
      className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    },
    offline: {
      label: "Offline",
      className: "bg-slate-500/15 text-slate-400 border-slate-500/20",
    },
    installing: {
      label: "Installing",
      className: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    },
    suspended: {
      label: "Suspended",
      className: "bg-red-500/15 text-red-400 border-red-500/20",
    },
  }

  const current = config[status || "offline"] || config.offline

  return (
    <Badge variant="outline" className={current.className}>
      <div className={cn("w-1.5 h-1.5 rounded-full mr-1.5", status === "running" ? "bg-emerald-400" : status === "installing" ? "bg-blue-400" : status === "suspended" ? "bg-red-400" : "bg-slate-400")} />
      {current.label}
    </Badge>
  )
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ")
}

function formatMemory(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`
  return `${mb} MB`
}

export default function ServersPage() {
  const [servers, setServers] = useState<PterodactylServer[]>([])
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchServers() {
      try {
        const res = await fetch("/api/pterodactyl/servers")
        if (res.ok) {
          const data = await res.json()
          setServers(data.data || [])
        }
      } catch (err) {
        console.error("Failed to fetch servers:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchServers()
  }, [])

  const filteredServers = servers.filter((s) => {
    const q = search.toLowerCase()
    return (
      s.attributes.name.toLowerCase().includes(q) ||
      s.attributes.identifier.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Servers</h1>
          <p className="text-slate-400 text-sm mt-1">
            Kelola semua server game Anda
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Cari server..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:border-indigo-500"
          />
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="bg-white/5 border-white/5">
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredServers.length === 0 ? (
        /* Empty State */
        <Card className="bg-white/5 border-white/5">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Server className="w-12 h-12 text-slate-600 mb-4" />
            <p className="text-slate-400 text-lg font-medium">Tidak ada server</p>
            <p className="text-slate-500 text-sm mt-1">
              {search ? "Tidak ditemukan server yang cocok" : "Belum ada server yang terdaftar"}
            </p>
          </CardContent>
        </Card>
      ) : (
        /* Server Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServers.map((server) => (
            <Card
              key={server.attributes.identifier}
              className="bg-white/5 border-white/5 backdrop-blur-sm hover:bg-white/[0.07] transition-all group"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base text-white leading-tight line-clamp-1">
                    {server.attributes.name}
                  </CardTitle>
                  <StatusBadge status={server.attributes.status} />
                </div>
                <p className="text-xs text-slate-500 font-mono">
                  {server.attributes.identifier}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <p className="text-slate-500">RAM</p>
                    <p className="text-white font-medium mt-0.5">
                      {formatMemory(server.attributes.limits.memory)}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <p className="text-slate-500">CPU</p>
                    <p className="text-white font-medium mt-0.5">
                      {server.attributes.limits.cpu}%
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <p className="text-slate-500">Disk</p>
                    <p className="text-white font-medium mt-0.5">
                      {formatMemory(server.attributes.limits.disk)}
                    </p>
                  </div>
                </div>
                <Link href={`/dashboard/servers/${server.attributes.identifier}`}>
                  <Button
                    variant="ghost"
                    className="w-full text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 justify-between"
                  >
                    View Details
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
