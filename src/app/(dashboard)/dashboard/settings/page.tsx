"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Settings, Globe, Key, Save } from "lucide-react"
import { toast } from "sonner"

interface SettingsData {
  panel_name?: string
  panel_url?: string
  pterodactyl_url?: string
  pterodactyl_api_key?: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/pterodactyl/settings")
        if (res.ok) {
          const data = await res.json()
          setSettings(data)
        } else {
          toast.error("Gagal memuat pengaturan")
        }
      } catch {
        toast.error("Gagal menghubungi server")
      } finally {
        setIsLoading(false)
      }
    }
    fetchSettings()
  }, [])

  async function handleSave() {
    setIsSaving(true)
    try {
      const res = await fetch("/api/pterodactyl/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          panel_name: settings.panel_name,
          panel_url: settings.panel_url,
        }),
      })
      if (res.ok) {
        toast.success("Pengaturan berhasil disimpan")
      } else {
        const data = await res.json()
        toast.error(data.error || "Gagal menyimpan pengaturan")
      }
    } catch {
      toast.error("Gagal menghubungi server")
    } finally {
      setIsSaving(false)
    }
  }

  const pterodactylUrl = process.env.NEXT_PUBLIC_PTERODACTYL_URL || ""

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">
          Konfigurasi panel RyujiPanel
        </p>
      </div>

      {/* Panel Configuration */}
      <Card className="bg-white/5 border-white/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Globe className="w-5 h-5 text-indigo-400" />
            Konfigurasi Panel
          </CardTitle>
          <CardDescription className="text-slate-400">
            Pengaturan dasar panel RyujiPanel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-300">Nama Panel</Label>
            <Input
              value={settings.panel_name || ""}
              onChange={(e) =>
                setSettings({ ...settings, panel_name: e.target.value })
              }
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:border-indigo-500"
              placeholder="RyujiPanel"
              disabled={isLoading}
            />
            <p className="text-xs text-slate-500">Nama yang ditampilkan di dashboard</p>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">URL Panel</Label>
            <Input
              value={settings.panel_url || ""}
              onChange={(e) =>
                setSettings({ ...settings, panel_url: e.target.value })
              }
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:border-indigo-500"
              placeholder="https://panel.example.com"
              disabled={isLoading}
            />
            <p className="text-xs text-slate-500">URL publik panel RyujiPanel</p>
          </div>
        </CardContent>
      </Card>

      {/* Pterodactyl Configuration */}
      <Card className="bg-white/5 border-white/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Key className="w-5 h-5 text-indigo-400" />
            Konfigurasi Pterodactyl
          </CardTitle>
          <CardDescription className="text-slate-400">
            Koneksi ke Pterodactyl Panel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-300">Pterodactyl URL</Label>
            <Input
              value={pterodactylUrl}
              className="bg-white/5 border-white/10 text-slate-400 placeholder:text-slate-500 cursor-not-allowed"
              readOnly
            />
            <p className="text-xs text-amber-500/80">
              Ubah melalui file .env (PTERODACTYL_URL)
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">API Key</Label>
            <Input
              type="password"
              value="••••••••••••••••"
              className="bg-white/5 border-white/10 text-slate-400 placeholder:text-slate-500 cursor-not-allowed"
              readOnly
            />
            <p className="text-xs text-amber-500/80">
              Ubah melalui file .env (PTERODACTYL_API_KEY)
            </p>
          </div>
        </CardContent>
      </Card>

      <Separator className="bg-white/5" />

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white shadow-lg shadow-indigo-500/25"
        >
          {isSaving ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Menyimpan...
            </div>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Simpan Pengaturan
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
