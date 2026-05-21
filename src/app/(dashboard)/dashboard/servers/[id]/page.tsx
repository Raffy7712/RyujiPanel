"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowLeft,
  Play,
  Square,
  RotateCcw,
  Skull,
  Server,
  Cpu,
  HardDrive,
  Wifi,
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface ServerDetails {
  attributes: {
    identifier: string
    name: string
    status: string | null
    limits: {
      memory: number
      cpu: number
      disk: number
    }
    node?: string
    docker_image?: string
    service?: string
    server_owner?: boolean
    description?: string
  }
}

interface ServerResources {
  attributes: {
    current_state: string
    resources: {
      memory_bytes: number
      cpu_absolute: number
      disk_bytes: number
      network_rx_bytes: number
      network_tx_bytes: number
    }
  }
}

interface AppDetails {
  attributes: {
    node: string
    docker_image: string
    server_owner: boolean
    description: string
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

function formatMemory(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`
  return `${mb} MB`
}

export default function ServerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const serverId = params.id as string

  const [details, setDetails] = useState<ServerDetails | null>(null)
  const [resources, setResources] = useState<ServerResources | null>(null)
  const [appDetails, setAppDetails] = useState<AppDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [powerLoading, setPowerLoading] = useState<string | null>(null)

  const fetchDetails = useCallback(async () => {
    try {
      const res = await fetch(`/api/pterodactyl/servers/${serverId}`)
      if (res.ok) {
        const data = await res.json()
        if (data.details) setDetails(data.details)
        if (data.resources) setResources(data.resources)
        if (data.appDetails) setAppDetails(data.appDetails)
      }
    } catch (err) {
      console.error("Failed to fetch server details:", err)
    } finally {
      setIsLoading(false)
    }
  }, [serverId])

  const fetchResources = useCallback(async () => {
    try {
      const res = await fetch(`/api/pterodactyl/servers/${serverId}/resources`)
      if (res.ok) {
        const data = await res.json()
        setResources(data)
      }
    } catch {
      // silent fail for polling
    }
  }, [serverId])

  useEffect(() => {
    fetchDetails()
  }, [fetchDetails])

  useEffect(() => {
    const interval = setInterval(fetchResources, 5000)
    return () => clearInterval(interval)
  }, [fetchResources])

  async function handlePowerAction(signal: string) {
    setPowerLoading(signal)
    try {
      const res = await fetch(`/api/pterodactyl/servers/${serverId}/power`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signal }),
      })

      if (res.ok) {
        const signalLabels: Record<string, string> = {
          start: "Server dimulai",
          stop: "Server dihentikan",
          restart: "Server di-restart",
          kill: "Server di-kill",
        }
        toast.success(signalLabels[signal] || `Power action: ${signal}`)
        // Refresh resources after a short delay
        setTimeout(fetchResources, 2000)
      } else {
        const data = await res.json()
        toast.error(data.error || "Gagal mengubah power state")
      }
    } catch {
      toast.error("Gagal menghubungi server")
    } finally {
      setPowerLoading(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-white/5 border-white/5">
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const currentState = resources?.attributes?.current_state || details?.attributes?.status || "offline"
  const isRunning = currentState === "running"
  const isOffline = currentState === "offline"
  const res = resources?.attributes?.resources

  const memoryLimit = details?.attributes?.limits?.memory || 0
  const cpuLimit = details?.attributes?.limits?.cpu || 0
  const diskLimit = details?.attributes?.limits?.disk || 0

  const memoryUsedMB = res ? res.memory_bytes / 1024 / 1024 : 0
  const cpuPercent = res?.cpu_absolute || 0
  const diskUsedMB = res ? res.disk_bytes / 1024 / 1024 : 0
  const networkRx = res?.network_rx_bytes || 0
  const networkTx = res?.network_tx_bytes || 0

  return (
    <div className="space-y-6">
      {/* Back button and header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-400 hover:text-white hover:bg-white/5"
          onClick={() => router.push("/dashboard/servers")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">
              {details?.attributes?.name || "Server Detail"}
            </h1>
            <StatusBadge status={currentState} />
          </div>
          <p className="text-slate-500 text-sm font-mono mt-1">{serverId}</p>
        </div>
      </div>

      {/* Resource Usage */}
      <Card className="bg-white/5 border-white/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Cpu className="w-5 h-5 text-indigo-400" />
            Resource Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* CPU */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">CPU</span>
              <span className="text-white font-medium">{cpuPercent.toFixed(1)}%</span>
            </div>
            <Progress
              value={Math.min(cpuPercent, 100)}
              className="h-2.5 bg-white/5 [&>[data-slot=progress-indicator]]:bg-gradient-to-r [&>[data-slot=progress-indicator]]:from-indigo-500 [&>[data-slot=progress-indicator]]:to-blue-500"
            />
            <p className="text-xs text-slate-500">Limit: {cpuLimit}%</p>
          </div>

          {/* Memory */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Memory</span>
              <span className="text-white font-medium">
                {formatMemory(Math.round(memoryUsedMB))} / {formatMemory(memoryLimit)}
              </span>
            </div>
            <Progress
              value={memoryLimit > 0 ? Math.min((memoryUsedMB / memoryLimit) * 100, 100) : 0}
              className="h-2.5 bg-white/5 [&>[data-slot=progress-indicator]]:bg-gradient-to-r [&>[data-slot=progress-indicator]]:from-emerald-500 [&>[data-slot=progress-indicator]]:to-green-500"
            />
            <p className="text-xs text-slate-500">Limit: {formatMemory(memoryLimit)}</p>
          </div>

          {/* Disk */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Disk</span>
              <span className="text-white font-medium">
                {formatMemory(Math.round(diskUsedMB))} / {formatMemory(diskLimit)}
              </span>
            </div>
            <Progress
              value={diskLimit > 0 ? Math.min((diskUsedMB / diskLimit) * 100, 100) : 0}
              className="h-2.5 bg-white/5 [&>[data-slot=progress-indicator]]:bg-gradient-to-r [&>[data-slot=progress-indicator]]:from-amber-500 [&>[data-slot=progress-indicator]]:to-orange-500"
            />
            <p className="text-xs text-slate-500">Limit: {formatMemory(diskLimit)}</p>
          </div>

          {/* Network */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Wifi className="w-3.5 h-3.5" />
                Received
              </div>
              <p className="text-white font-medium mt-1">{formatBytes(networkRx)}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Wifi className="w-3.5 h-3.5" />
                Transmitted
              </div>
              <p className="text-white font-medium mt-1">{formatBytes(networkTx)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Power Controls */}
      <Card className="bg-white/5 border-white/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Server className="w-5 h-5 text-indigo-400" />
            Power Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button
              className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25 hover:text-emerald-300 transition-all"
              disabled={isRunning || powerLoading !== null}
              onClick={() => handlePowerAction("start")}
            >
              {powerLoading === "start" ? (
                <div className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Start
            </Button>

            <Button
              className="bg-amber-500/15 text-amber-400 border border-amber-500/20 hover:bg-amber-500/25 hover:text-amber-300 transition-all"
              disabled={!isRunning || powerLoading !== null}
              onClick={() => handlePowerAction("stop")}
            >
              {powerLoading === "stop" ? (
                <div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              Stop
            </Button>

            <Button
              className="bg-blue-500/15 text-blue-400 border border-blue-500/20 hover:bg-blue-500/25 hover:text-blue-300 transition-all"
              disabled={!isRunning || powerLoading !== null}
              onClick={() => handlePowerAction("restart")}
            >
              {powerLoading === "restart" ? (
                <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4" />
              )}
              Restart
            </Button>

            <Button
              className="bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 hover:text-red-300 transition-all"
              disabled={isOffline || powerLoading !== null}
              onClick={() => handlePowerAction("kill")}
            >
              {powerLoading === "kill" ? (
                <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
              ) : (
                <Skull className="w-4 h-4" />
              )}
              Kill
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Server Info */}
      <Card className="bg-white/5 border-white/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <HardDrive className="w-5 h-5 text-indigo-400" />
            Server Info
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-xs text-slate-500">Identifier</p>
              <p className="text-white font-mono text-sm mt-1">{serverId}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-xs text-slate-500">Node</p>
              <p className="text-white text-sm mt-1">
                {appDetails?.attributes?.node || "N/A"}
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-xs text-slate-500">Docker Image</p>
              <p className="text-white font-mono text-xs mt-1 break-all">
                {appDetails?.attributes?.docker_image || details?.attributes?.docker_image || "N/A"}
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-xs text-slate-500">Status</p>
              <div className="mt-1">
                <StatusBadge status={currentState} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
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
    starting: {
      label: "Starting",
      className: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    },
    stopping: {
      label: "Stopping",
      className: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    },
  }

  const current = config[status] || config.offline

  return (
    <Badge variant="outline" className={current.className}>
      <div
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          status === "running"
            ? "bg-emerald-400"
            : status === "installing" || status === "starting" || status === "stopping"
              ? "bg-amber-400"
              : status === "suspended"
                ? "bg-red-400"
                : "bg-slate-400"
        }`}
      />
      {current.label}
    </Badge>
  )
}
