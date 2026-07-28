'use client'
import { useEffect, useState } from 'react'
import { adminAPI } from '../../../lib/api'

const mask = (v?: string | null) => {
  if (!v) return null
  const d = String(v)
  return d.length < 7 ? d : d.slice(0, 3) + '*****' + d.slice(-3)
}

export default function KYCPage() {
  const [pending, setPending] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  const [busy, setBusy] = useState<string>('')
  const [rejecting, setRejecting] = useState<any>(null)
  const [reason, setReason] = useState('')

  const load = async () => {
    try {
      setLoading(true)
      const res = await adminAPI.getKYCPending()
      setPending(res.data?.data || [])
    } catch { alert('Could not load pending KYC') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const approve = async (u: any) => {
    if (!confirm(`Approve ${u.fullName}? This marks their identity as verified.`)) return
    try { setBusy(u.id); await adminAPI.verifyUser(u.id); await load() }
    catch (e: any) { alert(e.response?.data?.message || 'Approve failed') }
    finally { setBusy('') }
  }

  const reject = async () => {
    if (!rejecting) return
    if (reason.trim().length < 5) { alert('Give the customer a real reason'); return }
    try {
      setBusy(rejecting.id)
      await adminAPI.rejectKYC(rejecting.id, reason.trim())
      setRejecting(null); setReason('')
      await load()
    } catch (e: any) { alert(e.response?.data?.message || 'Reject failed') }
    finally { setBusy('') }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">KYC Review</h1>
          <p className="text-gray-500 text-sm">{pending.length} awaiting review</p>
        </div>
        <button onClick={load} className="text-sm text-blue-800 font-semibold hover:underline">Refresh</button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : pending.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-gray-500">Nothing awaiting review</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {pending.map(u => (
            <div key={u.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-blue-900">{u.fullName}</p>
                  <p className="text-sm text-gray-500">{u.phone}{u.email ? ` · ${u.email}` : ''}</p>
                </div>
                <span className="text-xs bg-amber-50 text-amber-700 rounded-full px-3 py-1 font-semibold">
                  Trust {u.trustScore ?? '—'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {(['bvn', 'nin'] as const).map(k => (
                  <div key={k} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 uppercase mb-1">{k}</p>
                    {u[k] ? (
                      <button
                        onClick={() => setRevealed(r => ({ ...r, [u.id + k]: !r[u.id + k] }))}
                        className="font-mono text-sm text-gray-800"
                        title="Click to reveal/hide"
                      >
                        {revealed[u.id + k] ? u[k] : mask(u[k])}
                      </button>
                    ) : (
                      <p className="text-sm text-gray-400">Not submitted</p>
                    )}
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-400 mb-4">
                Submitted {new Date(u.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => approve(u)}
                  disabled={busy === u.id}
                  className="flex-1 bg-blue-800 text-white rounded-xl py-2.5 text-sm font-bold hover:bg-blue-900 disabled:opacity-50"
                >
                  {busy === u.id ? 'Working…' : 'Approve'}
                </button>
                <button
                  onClick={() => { setRejecting(u); setReason('') }}
                  disabled={busy === u.id}
                  className="flex-1 bg-red-50 text-red-600 rounded-xl py-2.5 text-sm font-bold hover:bg-red-100 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {rejecting && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="font-bold text-blue-900 mb-1">Reject {rejecting.fullName}</h2>
            <p className="text-sm text-gray-500 mb-4">
              Their BVN/NIN will be cleared so they can resubmit, and they will be sent this reason.
            </p>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. The BVN submitted does not match the registered name"
              className="w-full bg-gray-50 rounded-xl p-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 min-h-24 mb-4"
            />
            <div className="flex gap-2">
              <button onClick={() => setRejecting(null)} className="flex-1 bg-gray-100 rounded-xl py-2.5 text-sm font-semibold text-gray-600">Cancel</button>
              <button onClick={reject} className="flex-1 bg-red-600 text-white rounded-xl py-2.5 text-sm font-bold hover:bg-red-700">Reject & notify</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
