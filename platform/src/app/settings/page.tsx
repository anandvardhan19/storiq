'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Download, Upload, HardDrive, Cloud, CheckCircle,
  AlertCircle, Clock, RefreshCw, ChevronRight, Database
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
      const filename = res.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] ?? 'backup.db'
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
      showToast('Database restored! Restart the server to apply changes.')
    } catch (e) {
      showToast(`Restore failed: ${e}`, false)
    } finally {
      setRestoreLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your store configuration and backups</p>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium ${
            toast.ok ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {toast.ok ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            {toast.msg}
          </div>
        )}

        {/* Backup & Restore */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Database className="w-4 h-4 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Backup & Restore</h2>
          </div>

          <div className="p-5 space-y-4">
            {/* Local Backup */}
            <div className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 bg-gray-50">
              <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                <HardDrive className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">Download to device</p>
                <p className="text-gray-500 text-xs mt-0.5">Saves a copy of your entire database to this device</p>
              </div>
              <button
                onClick={handleLocalBackup}
                disabled={localLoading}
                className="flex items-center gap-1.5 text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors shrink-0"
              >
                {localLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                {localLoading ? 'Saving…' : 'Download'}
              </button>
            </div>

            {/* Google Drive Backup */}
            <div className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 bg-gray-50">
              <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                <Cloud className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 text-sm">Google Drive</p>
                  {gdriveConnected && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Connected</span>
                  )}
                </div>
                <p className="text-gray-500 text-xs mt-0.5">Backs up to a "Storiq Backups" folder in your Drive</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {!gdriveConnected && (
                  <a
                    href="/api/backup/gdrive?action=auth"
                    className="flex items-center gap-1.5 text-sm px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
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
            <div className="flex items-start gap-4 p-4 rounded-lg border border-amber-100 bg-amber-50">
              <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                <Upload className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">Restore from backup</p>
                <p className="text-gray-500 text-xs mt-0.5">Select a <code className="bg-gray-100 px-1 rounded">.db</code> file downloaded earlier. This will replace all current data.</p>
              </div>
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".db"
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
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <h2 className="font-semibold text-gray-900">Backup history</h2>
            </div>
            <button onClick={loadLogs} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              Refresh
            </button>
          </div>

          {logs.length === 0 ? (
            <div className="px-5 py-8 text-center text-gray-400 text-sm">No backups yet</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {logs.map(log => (
                <div key={log.id} className="px-5 py-3 flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                    log.type === 'gdrive' ? 'bg-green-50' : 'bg-blue-50'
                  }`}>
                    {log.type === 'gdrive'
                      ? <Cloud className="w-3.5 h-3.5 text-green-600" />
                      : <HardDrive className="w-3.5 h-3.5 text-blue-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 truncate">{log.filename}</p>
                    <p className="text-xs text-gray-400">{fmtDate(log.createdAt)} · {fmtBytes(log.sizeBytes)}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    log.status === 'success'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
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
