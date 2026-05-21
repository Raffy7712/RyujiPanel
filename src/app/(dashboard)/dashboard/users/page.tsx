"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Users, Search, Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface PterodactylUser {
  attributes: {
    id: number
    uuid: string
    username: string
    email: string
    first_name: string
    last_name: string
    root_admin: boolean
  }
}

interface UserFormData {
  username: string
  email: string
  first_name: string
  last_name: string
  password: string
}

const emptyForm: UserFormData = {
  username: "",
  email: "",
  first_name: "",
  last_name: "",
  password: "",
}

export default function UsersPage() {
  const [users, setUsers] = useState<PterodactylUser[]>([])
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState<UserFormData>(emptyForm)
  const [createLoading, setCreateLoading] = useState(false)

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState<UserFormData>(emptyForm)
  const [editUserId, setEditUserId] = useState<number | null>(null)
  const [editLoading, setEditLoading] = useState(false)

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteUser, setDeleteUser] = useState<PterodactylUser | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/pterodactyl/users")
      if (res.ok) {
        const data = await res.json()
        setUsers(data.data || [])
      } else {
        toast.error("Gagal memuat data user")
      }
    } catch {
      toast.error("Gagal menghubungi server")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase()
    return (
      u.attributes.username.toLowerCase().includes(q) ||
      u.attributes.email.toLowerCase().includes(q) ||
      u.attributes.first_name.toLowerCase().includes(q) ||
      u.attributes.last_name.toLowerCase().includes(q)
    )
  })

  async function handleCreate() {
    setCreateLoading(true)
    try {
      const res = await fetch("/api/pterodactyl/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      })
      if (res.ok) {
        toast.success("User berhasil ditambahkan")
        setCreateOpen(false)
        setCreateForm(emptyForm)
        fetchUsers()
      } else {
        const data = await res.json()
        toast.error(data.error || "Gagal menambahkan user")
      }
    } catch {
      toast.error("Gagal menghubungi server")
    } finally {
      setCreateLoading(false)
    }
  }

  function openEdit(user: PterodactylUser) {
    setEditUserId(user.attributes.id)
    setEditForm({
      username: user.attributes.username,
      email: user.attributes.email,
      first_name: user.attributes.first_name,
      last_name: user.attributes.last_name,
      password: "",
    })
    setEditOpen(true)
  }

  async function handleEdit() {
    if (!editUserId) return
    setEditLoading(true)
    try {
      const body: Record<string, string> = {
        username: editForm.username,
        email: editForm.email,
        first_name: editForm.first_name,
        last_name: editForm.last_name,
      }
      if (editForm.password) {
        body.password = editForm.password
      }

      const res = await fetch(`/api/pterodactyl/users/${editUserId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast.success("User berhasil diperbarui")
        setEditOpen(false)
        fetchUsers()
      } else {
        const data = await res.json()
        toast.error(data.error || "Gagal memperbarui user")
      }
    } catch {
      toast.error("Gagal menghubungi server")
    } finally {
      setEditLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleteUser) return
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/pterodactyl/users/${deleteUser.attributes.id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        toast.success("User berhasil dihapus")
        setDeleteOpen(false)
        setDeleteUser(null)
        fetchUsers()
      } else {
        const data = await res.json()
        toast.error(data.error || "Gagal menghapus user")
      }
    } catch {
      toast.error("Gagal menghubungi server")
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-slate-400 text-sm mt-1">
            Kelola pengguna panel Pterodactyl
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Cari user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:border-indigo-500"
            />
          </div>
          <Button
            className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white shadow-lg shadow-indigo-500/25 shrink-0"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Tambah User
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <Card className="bg-white/5 border-white/5 backdrop-blur-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-slate-400">User</TableHead>
                <TableHead className="text-slate-400">Nama Lengkap</TableHead>
                <TableHead className="text-slate-400">Role</TableHead>
                <TableHead className="text-slate-400 hidden md:table-cell">UUID</TableHead>
                <TableHead className="text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-white/5">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-14" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-36" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredUsers.length === 0 ? (
                <TableRow className="border-white/5">
                  <TableCell colSpan={5} className="text-center py-12">
                    <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 font-medium">Tidak ada user</p>
                    <p className="text-slate-500 text-sm mt-1">
                      {search ? "Tidak ditemukan user yang cocok" : "Belum ada user yang terdaftar"}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.attributes.id} className="border-white/5 hover:bg-white/5">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-white/10">
                          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white text-xs">
                            {user.attributes.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {user.attributes.username}
                          </p>
                          <p className="text-xs text-slate-500">{user.attributes.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-300">
                      {user.attributes.first_name} {user.attributes.last_name}
                    </TableCell>
                    <TableCell>
                      {user.attributes.root_admin ? (
                        <Badge className="bg-indigo-500/15 text-indigo-400 border-indigo-500/20">
                          Admin
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-500/15 text-slate-400 border-slate-500/20">
                          User
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 font-mono hidden md:table-cell">
                      {user.attributes.uuid.substring(0, 16)}...
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10"
                          onClick={() => openEdit(user)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                          onClick={() => {
                            setDeleteUser(user)
                            setDeleteOpen(true)
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-[#1e293b] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Tambah User</DialogTitle>
            <DialogDescription className="text-slate-400">
              Tambahkan pengguna baru ke panel Pterodactyl
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Nama Depan</Label>
                <Input
                  value={createForm.first_name}
                  onChange={(e) => setCreateForm({ ...createForm, first_name: e.target.value })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Nama Belakang</Label>
                <Input
                  value={createForm.last_name}
                  onChange={(e) => setCreateForm({ ...createForm, last_name: e.target.value })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Username</Label>
              <Input
                value={createForm.username}
                onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                placeholder="johndoe"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Email</Label>
              <Input
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Password</Label>
              <Input
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                placeholder="••••••••"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setCreateOpen(false)}
              className="text-slate-400 hover:text-white hover:bg-white/5"
            >
              Batal
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createLoading}
              className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white"
            >
              {createLoading ? "Menyimpan..." : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-[#1e293b] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Edit User</DialogTitle>
            <DialogDescription className="text-slate-400">
              Perbarui informasi pengguna
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Nama Depan</Label>
                <Input
                  value={editForm.first_name}
                  onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Nama Belakang</Label>
                <Input
                  value={editForm.last_name}
                  onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Username</Label>
              <Input
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Email</Label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Password Baru</Label>
              <Input
                type="password"
                value={editForm.password}
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                placeholder="Kosongkan jika tidak diubah"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setEditOpen(false)}
              className="text-slate-400 hover:text-white hover:bg-white/5"
            >
              Batal
            </Button>
            <Button
              onClick={handleEdit}
              disabled={editLoading}
              className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white"
            >
              {editLoading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User AlertDialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-[#1e293b] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Hapus User</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Apakah Anda yakin ingin menghapus user{" "}
              <span className="text-white font-medium">{deleteUser?.attributes.username}</span>?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteLoading ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
