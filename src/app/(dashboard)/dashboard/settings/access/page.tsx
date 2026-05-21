"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Shield, Plus, Trash2, Server, Users } from "lucide-react"
import { toast } from "sonner"

interface LocalUser {
  id: string
  username: string
  role: string
}

interface ServerAccessEntry {
  id: string
  userId: string
  pterodactylServerId: string
  createdAt: string
  user?: LocalUser
}

interface PterodactylServer {
  attributes: {
    identifier: string
    name: string
  }
}

interface PterodactylUser {
  attributes: {
    id: number
    username: string
    email: string
    first_name: string
    last_name: string
    root_admin: boolean
  }
}

export default function ServerAccessPage() {
  const [accessList, setAccessList] = useState<ServerAccessEntry[]>([])
  const [localUsers, setLocalUsers] = useState<LocalUser[]>([])
  const [pteroServers, setPteroServers] = useState<PterodactylServer[]>([])
  const [pteroUsers, setPteroUsers] = useState<PterodactylUser[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Add dialog
  const [addOpen, setAddOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState("")
  const [selectedServerId, setSelectedServerId] = useState("")
  const [addLoading, setAddLoading] = useState(false)

  // Delete
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    try {
      const [usersRes, serversRes, pteroUsersRes] = await Promise.all([
        fetch("/api/users").catch(() => null),
        fetch("/api/pterodactyl/servers").catch(() => null),
        fetch("/api/pterodactyl/users").catch(() => null),
      ])

      if (usersRes?.ok) {
        const data = await usersRes.json()
        setLocalUsers(data || [])
      }

      if (serversRes?.ok) {
        const data = await serversRes.json()
        setPteroServers(data.data || [])
      }

      if (pteroUsersRes?.ok) {
        const data = await pteroUsersRes.json()
        setPteroUsers(data.data || [])
      }

      // Fetch all access entries by iterating local users
      const accessRes = await fetch("/api/server-access?userId=all").catch(() => null)
      if (accessRes?.ok) {
        const data = await accessRes.json()
        setAccessList(data || [])
      }
    } catch {
      toast.error("Gagal memuat data")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  async function handleAdd() {
    if (!selectedUserId || !selectedServerId) {
      toast.error("Pilih user dan server terlebih dahulu")
      return
    }

    setAddLoading(true)
    try {
      const res = await fetch("/api/server-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserId,
          pterodactylServerId: selectedServerId,
        }),
      })

      if (res.ok) {
        toast.success("Akses server berhasil ditambahkan")
        setAddOpen(false)
        setSelectedUserId("")
        setSelectedServerId("")
        fetchAll()
      } else {
        const data = await res.json()
        toast.error(data.error || "Gagal menambahkan akses")
      }
    } catch {
      toast.error("Gagal menghubungi server")
    } finally {
      setAddLoading(false)
    }
  }

  async function handleDelete(userId: string, pterodactylServerId: string) {
    setDeleteLoading(userId + pterodactylServerId)
    try {
      const res = await fetch("/api/server-access", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, pterodactylServerId }),
      })

      if (res.ok) {
        toast.success("Akses server berhasil dihapus")
        fetchAll()
      } else {
        const data = await res.json()
        toast.error(data.error || "Gagal menghapus akses")
      }
    } catch {
      toast.error("Gagal menghubungi server")
    } finally {
      setDeleteLoading(null)
    }
  }

  function getServerName(identifier: string): string {
    const server = pteroServers.find(
      (s) => s.attributes.identifier === identifier
    )
    return server?.attributes?.name || identifier
  }

  function getUserName(userId: string): string {
    const user = localUsers.find((u) => u.id === userId)
    return user?.username || userId
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Server Access</h1>
          <p className="text-slate-400 text-sm mt-1">
            Kelola akses server per pengguna
          </p>
        </div>
        <Button
          className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white shadow-lg shadow-indigo-500/25 shrink-0"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Tambah Akses
        </Button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-white/5 border-white/5 backdrop-blur-sm">
          <CardContent className="flex items-center gap-4 py-5">
            <div className="w-12 h-12 rounded-lg bg-indigo-500/15 flex items-center justify-center">
              <Users className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{localUsers.length}</p>
              <p className="text-xs text-slate-400">Pengguna lokal</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/5 backdrop-blur-sm">
          <CardContent className="flex items-center gap-4 py-5">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <Server className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{pteroServers.length}</p>
              <p className="text-xs text-slate-400">Server tersedia</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Access Table */}
      <Card className="bg-white/5 border-white/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Shield className="w-5 h-5 text-indigo-400" />
            Daftar Akses Server
          </CardTitle>
          <CardDescription className="text-slate-400">
            Pengguna hanya bisa mengakses server yang diassign di sini
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-slate-400">Pengguna</TableHead>
                <TableHead className="text-slate-400">Server</TableHead>
                <TableHead className="text-slate-400">Ditambahkan</TableHead>
                <TableHead className="text-slate-400 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i} className="border-white/5">
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : accessList.length === 0 ? (
                <TableRow className="border-white/5">
                  <TableCell colSpan={4} className="text-center py-12">
                    <Shield className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 font-medium">Belum ada akses server</p>
                    <p className="text-slate-500 text-sm mt-1">
                      Klik &quot;Tambah Akses&quot; untuk memberikan akses server ke pengguna
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                accessList.map((entry) => (
                  <TableRow key={entry.id} className="border-white/5 hover:bg-white/5">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7 border border-white/10">
                          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white text-xs">
                            {getUserName(entry.userId).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-white">{getUserName(entry.userId)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                        <Server className="w-3 h-3 mr-1" />
                        {getServerName(entry.pterodactylServerId)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {new Date(entry.createdAt).toLocaleDateString("id-ID")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                        disabled={deleteLoading === entry.userId + entry.pterodactylServerId}
                        onClick={() => handleDelete(entry.userId, entry.pterodactylServerId)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Access Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-[#1e293b] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Tambah Akses Server</DialogTitle>
            <DialogDescription className="text-slate-400">
              Berikan akses server ke pengguna tertentu
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-slate-300">Pengguna</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Pilih pengguna..." />
                </SelectTrigger>
                <SelectContent className="bg-[#1e293b] border-white/10">
                  {localUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.username} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Server</Label>
              <Select value={selectedServerId} onValueChange={setSelectedServerId}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Pilih server..." />
                </SelectTrigger>
                <SelectContent className="bg-[#1e293b] border-white/10">
                  {pteroServers.map((server) => (
                    <SelectItem
                      key={server.attributes.identifier}
                      value={server.attributes.identifier}
                    >
                      {server.attributes.name} ({server.attributes.identifier})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setAddOpen(false)}
              className="text-slate-400 hover:text-white hover:bg-white/5"
            >
              Batal
            </Button>
            <Button
              onClick={handleAdd}
              disabled={addLoading || !selectedUserId || !selectedServerId}
              className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white"
            >
              {addLoading ? "Menyimpan..." : "Tambah Akses"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
