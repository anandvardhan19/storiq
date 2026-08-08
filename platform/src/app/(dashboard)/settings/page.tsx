'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Download, Upload, HardDrive, Cloud, CheckCircle,
  AlertCircle, Clock, RefreshCw, ChevronRight, Database, Settings
} from 'lucide-react'

type BackupLog = {
  id: string
  type: string
  filename: string
  sizeBytes: number
  status: string
  gdriveId: string | null
  errorMsg: string | null
  createdAt: string
}

function fmtBytes(b: number) {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1024 / 1024).toFixed(2)} MB`
}

function fmtDate(d: string) {
  return new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
}

export default function SettingsPage() {
  const searchParams = useSearchParams()
  const [logs, setLogs] = useState<BackupLog[]>([])
  const [localLoading, setLocalLoading] = useState(false)
  const [gdriveLoading, setGdriveLoading] = useState(false)
  const [restoreLoading, setRestoreLoading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [gdriveConnected, setGdriveConnected] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 4000)
  }

  const loadLogs = async () => {
    try {
      const res = await fetch('/api/backup/logs')
      const data = await res.json()
      setLogs(data)
      setGdriveConnected(data.some((l: BackupLog) => l.type === 'gdrive' && l.status === 'success'))
    } catch {}
  }

  useEffect(() => {
    loadLogs()
    const status = searchParams.get('backup')
    if (status === 'gdrive_connected') showToast('Google Drive connected successfully!')
    if (status === 'error') showToast('Google Drive connection failed. Try again.', false)
  }, [searchParams])

  const handleLocalBackup = async () => {
    setLocalLoading(true)
    try {
      const res = await fetch('/api/backup/local')
      if (!res.ok) throw new Error(await res.text())
      const blob = await res.blob()
      const filename = res.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] ?? 'backup.json'
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = filename; a.click()
      URL.revokeObjectURL(url)
      showToast('Backup downloaded successfully!')
      loadLogs()
    } catch (e) {
      showToast(`Backup failed: ${e}`, false)
    } finally {
      setLocalLoading(false)
    }
  }

  const handleGDriveBackup = async () => {
    setGdriveLoading(true)
    try {
      const res = await fetch('/api/backup/gdrive?action=run')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      showToast(`Backed up to Google Drive: ${data.filename}`)
      loadLogs()
    } catch (e) {
      showToast(`Google Drive backup failed: ${e}`, false)
    } finally {
      setGdriveLoading(false)
    }
  }

  const handleRestore = async (file: File) => {
    setRestoreLoading(true)
    try {
      const res = await fetch('/api/backup/restore', { method: 'POST', body: file })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      showToast('Database restored successfully!')
    } catch (e) {
      showToast(`Restore failed: ${e}`, false)
    } finally {
      setRestoreLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-white/40 text-sm mt-1">Manage your store configuration and backups</p>
      </div>

      {toast && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium mb-4 ${
          toast.ok ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {toast.ok ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {toast.msg}
        </div>
      )}

      <div className="space-y-4">
        {/* Backup & Restore */}
        <div className="bg-surface-900 border border-white/5 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
            <Database className="w-4 h-4 text-white/40" />
            <h2 className="text-sm font-semibold text-white">Backup & Restore</h2>
          </div>

          <div className="p-5 space-y-3">
            {/* Local Backup */}
            <div className="flex items-start gap-4 p-4 rounded-lg border border-white/5 bg-white/5">
              <div className="w-9 h-9 bg-brand-500/10 rounded-lg flex items-center justify-center shrink-0">
                <HardDrive className="w-4 h-4 text-brand-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm">Download to device</p>
                <p className="text-white/40 text-xs mt-0.5">Saves a copy of your entire database to this device</p>
              </div>
              <button
                onClick={handleLocalBackup}
                disabled={localLoading}
                className="flex items-center gap-1.5 text-sm px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-60 transition-colors shrink-0"
              >
                {localLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                {localLoading ? 'Saving…' : 'Download'}
              </button>
            </div>

            {/* Google Drive Backup */}
            <div className="flex items-start gap-4 p-4 rounded-lg border border-white/5 bg-white/5">
              <div className="w-9 h-9 bg-green-500/10 rounded-lg flex items-center justify-center shrink-0">
                <Cloud className="w-4 h-4 text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-white text-sm">Google Drive</p>
                  {gdriveConnected && (
                    <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full font-medium">Connected</span>
                  )}
                </div>
                <p className="text-white/40 text-xs mt-0.5">Backs up to a "Storiq Backups" folder in your Drive</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {!gdriveConnected && (
                  <a
                    href="/api/backup/gdrive?action=auth"
                    className="flex items-center gap-1.5 text-sm px-3 py-2 border border-white/10 text-white/70 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    Connect <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  onClick={handleGDriveBackup}
                  disabled={gdriveLoading || !gdriveConnected}
                  className="flex items-center gap-1.5 text-sm px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors"
                >
                  {gdriveLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Cloud className="w-3.5 h-3.5" />}
                  {gdriveLoading ? 'Uploading…' : 'Backup now'}
                </button>
              </div>
            </div>

            {/* Restore */}
            <div className="flex items-start gap-4 p-4 rounded-lg border border-amber-500/20 bg-amber-500/5">
              <div className="w-9 h-9 bg-amber-500/10 rounded-lg flex items-center justify-center shrink-0">
                <Upload className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm">Restore from backup</p>
                <p className="text-white/40 text-xs mt-0.5">Select a <code className="bg-white/10 px-1 rounded">.json</code> file downloaded earlier. This will replace all current data.</p>
              </div>
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleRestore(f) }}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={restoreLoading}
                  className="flex items-center gap-1.5 text-sm px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-60 transition-colors shrink-0"
                >
                  {restoreLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  {restoreLoading ? 'Restoring…' : 'Restore'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Backup History */}
        <div className="bg-surface-900 border border-white/5 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-white/40" />
              <h2 className="text-sm font-semibold text-white">Backup history</h2>
            </div>
            <button onClick={loadLogs} className="text-xs text-white/30 hover:text-white/60 transition-colors">
              Refresh
            </button>
          </div>

          {logs.length === 0 ? (
            <div className="px-5 py-8 text-center text-white/30 text-sm">No backups yet</div>
          ) : (
            <div className="divide-y divide-white/5">
              {logs.map(log => (
                <div key={log.id} className="px-5 py-3 flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                    log.type === 'gdrive' ? 'bg-green-500/10' : 'bg-brand-500/10'
                  }`}>
                    {log.type === 'gdrive'
                      ? <Cloud className="w-3.5 h-3.5 text-green-400" />
                      : <HardDrive className="w-3.5 h-3.5 text-brand-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 truncate">{log.filename}</p>
                    <p className="text-xs text-white/30">{fmtDate(log.createdAt)} · {fmtBytes(log.sizeBytes)}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    log.status === 'success'
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}>
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
