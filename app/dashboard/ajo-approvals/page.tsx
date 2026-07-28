'use client'
import { useEffect, useState } from 'react'
import { adminAPI } from '../../../lib/api'

const money = (v: any) => '\u20a6' + Number(v || 0).toLocaleString()

export default function AjoApprovalsPage() {
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [rejecting, setRejecting] = useState<any>(null)
  const [reason, setReason] = useState('')

  const load = async () => {
    try {
      setLoading(true)
      const res = await adminAPI.getPendingAjo()
      setGroups(res.data?.data || [])
    } catch { alert('Could not load pending groups') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const approve = async (g: any) => {
    const unverified = g.members.filter((m: any) => !m.user?.isVerified || !m.user?.bvn || !m.user?.nin)
    if (unverified.length > 0) {
      alert(`${unverified.length} member(s) are not fully verified. Approve is blocked.`)
      return
    }
    if (!confirm(`Approve "${g.name}"? Collection starts tomorrow and money begins moving.`)) return
    try { setBusy(g.id); await adminAPI.approveAjo(g.id); await load() }
    catch (e: any) { alert(e.response?.data?.message || 'Approve failed') }
    finally { setBusy('') }
  }

  const reject = async () => {
    if (reason.trim().length < 5) { alert('Give a real reason - the members will see it'); return }
    try {
      setBusy(rejecting.id)
      await adminAPI.rejectAjo(rejecting.id, reason.trim())
      setRejecting(null); setReason(''); await load()
    } catch (e: any) { alert(e.response?.data?.message || 'Reject failed') }
    finally { setBusy('') }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Ajo Approvals</h1>
          <p className="text-gray-500 text-sm">{groups.length} group(s) waiting</p>
        </div>
        <button onClick={load} className="text-sm text-blue-800 font-semibold hover:underline">Refresh</button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : groups.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-gray-500">
          No groups waiting for approval
        </div>
      ) : (
        <div className="space-y-5">
          {groups.map(g => {
            const creator = g.members.find((m: any) => m.user?.id === g.createdBy)
            const unverified = g.members.filter((m: any) => !m.user?.isVerified || !m.user?.bvn || !m.user?.nin)
            return (
              <div key={g.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-blue-900">{g.name}</h2>
                    <p className="text-sm text-gray-500">
                      Created by {creator?.user?.fullName || 'Unknown'} · {creator?.user?.phone || ''}
                    </p>
                  </div>
                  <span className="text-xs bg-amber-50 text-amber-700 rounded-full px-3 py-1 font-semibold whitespace-nowrap">
                    Awaiting approval
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-5">
                  {[
                    ['Contribution', money(g.amount)],
                    ['Frequency', String(g.frequency).toLowerCase()],
                    ['Members', g.members.length + ' of ' + g.totalMembers],
                    ['Each collects', money(g.amount * g.totalMembers)]
                  ].map(([k, v]) => (
                    <div key={k} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-1">{k}</p>
                      <p className="text-sm font-bold text-blue-900 capitalize">{v}</p>
                    </div>
                  ))}
                </div>

                {unverified.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                    <p className="text-sm text-red-700 font-semibold">
                      {unverified.length} member(s) not fully verified — approval blocked
                    </p>
                  </div>
                )}

                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Payout order</p>
                <div className="border border-gray-100 rounded-xl overflow-hidden mb-5">
                  {g.members.map((m: any) => {
                    const ok = m.user?.isVerified && m.user?.bvn && m.user?.nin
                    return (
                      <div key={m.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 last:border-b-0">
                        <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-800 text-xs font-bold flex items-center justify-center">
                          {m.position}
                        </span>
                        <span className="flex-1 text-sm text-gray-800">{m.user?.fullName}</span>
                        <span className="text-xs text-gray-400">{m.user?.phone}</span>
                        <span className="text-xs text-gray-400">Trust {m.user?.trustScore ?? '—'}</span>
                        <span className={`text-xs font-semibold ${ok ? 'text-green-600' : 'text-red-500'}`}>
                          {ok ? 'Verified' : 'Not verified'}
                        </span>
                      </div>
                    )
                  })}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => approve(g)}
                    disabled={busy === g.id || unverified.length > 0}
                    className="flex-1 bg-blue-800 text-white rounded-xl py-3 text-sm font-bold hover:bg-blue-900 disabled:opacity-40"
                  >
                    {busy === g.id ? 'Working…' : 'Approve and start'}
                  </button>
                  <button
                    onClick={() => { setRejecting(g); setReason('') }}
                    disabled={busy === g.id}
                    className="flex-1 bg-red-50 text-red-600 rounded-xl py-3 text-sm font-bold hover:bg-red-100 disabled:opacity-40"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {rejecting && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="font-bold text-blue-900 mb-1">Reject &quot;{rejecting.name}&quot;</h2>
            <p className="text-sm text-gray-500 mb-4">
              All {rejecting.members.length} members will be sent this reason.
            </p>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Two members share the same address and phone provider"
              className="w-full bg-gray-50 rounded-xl p-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 min-h-24 mb-4"
            />
            <div className="flex gap-2">
              <button onClick={() => setRejecting(null)} className="flex-1 bg-gray-100 rounded-xl py-2.5 text-sm font-semibold text-gray-600">Cancel</button>
              <button onClick={reject} className="flex-1 bg-red-600 text-white rounded-xl py-2.5 text-sm font-bold hover:bg-red-700">Reject and notify</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
