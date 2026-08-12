'use client'
import { useEffect, useState } from 'react'
import { adminAPI } from '@/lib/api'

export default function GuaranteedAjoPage() {
  const [groups, setGroups] = useState<any[]>([])
  const [pool, setPool] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedGroup, setSelectedGroup] = useState<any>(null)
  const [riskData, setRiskData] = useState<Record<string, any>>({})
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({ name: '', amount: '', frequency: 'MONTHLY', totalMembers: '6' })

  const handleCreate = async () => {
    if (!form.name.trim() || !form.amount) { setFormError('Name and amount are required'); return }
    const members = Number(form.totalMembers)
    if (members < 6 || members > 12) { setFormError('Members must be between 6 and 12'); return }
    try {
      setCreating(true); setFormError('')
      const res = await adminAPI.createGuaranteedGroup({
        name: form.name.trim(),
        amount: Number(form.amount),
        frequency: form.frequency,
        totalMembers: members
      })
      setGroups(prev => [res.data.data, ...prev])
      setForm({ name: '', amount: '', frequency: 'MONTHLY', totalMembers: '6' })
      setShowCreate(false)
    } catch (error: any) {
      setFormError(error?.response?.data?.message || 'Could not create group')
    } finally {
      setCreating(false)
    }
  }

  // Load groups + pool
  useEffect(() => {
    const load = async () => {
      try {
        const [groupsRes, poolRes] = await Promise.all([
          adminAPI.getGuaranteedGroups(),
          adminAPI.getGuaranteePool()
        ])
        setGroups(groupsRes.data.data)
        setPool(poolRes.data.data)
      } catch (error) {
        console.error('Could not load data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Load risk data
  useEffect(() => {
    const loadRisk = async () => {
      for (const group of groups) {
        try {
          const response = await adminAPI.getGroupRisk(group.id)
          setRiskData(prev => ({
            ...prev,
            [group.id]: response.data.data
          }))
        } catch (e) {}
      }
    }

    if (groups.length) loadRisk()
  }, [groups])

  const handleCheckDefaults = async (groupId: string) => {
    try {
      const response = await adminAPI.checkDefaults(groupId)
      alert(`Default check complete: ${JSON.stringify(response.data.data)}`)
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error checking defaults')
    }
  }

  if (loading)
    return (
      <div className="text-blue-800 font-semibold">
        Loading Guaranteed Ajo data...
      </div>
    )

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">
            Guaranteed Ajo Groups
          </h1>
          <p className="text-gray-500 mt-1">
            AI-backed savings with zero default risk
          </p>
        </div>
        <button
          onClick={() => { setShowCreate(v => !v); setFormError('') }}
          className="bg-blue-800 text-white rounded-xl px-5 py-3 font-semibold hover:bg-blue-900 transition"
        >
          {showCreate ? 'Cancel' : '+ New Group'}
        </button>
      </div>

      {showCreate && (
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Create Guaranteed Ajo Group</h2>

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mb-4 text-sm">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-semibold text-blue-900 block mb-2">Group Name</label>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Lagos Traders Guaranteed"
                className="w-full bg-gray-50 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-blue-900 block mb-2">Contribution (₦)</label>
              <input
                type="number"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                placeholder="10000"
                className="w-full bg-gray-50 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-blue-900 block mb-2">Frequency</label>
              <select
                value={form.frequency}
                onChange={e => setForm({ ...form, frequency: e.target.value })}
                className="w-full bg-gray-50 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-blue-900 block mb-2">Members (6-12)</label>
              <input
                type="number"
                min={6}
                max={12}
                value={form.totalMembers}
                onChange={e => setForm({ ...form, totalMembers: e.target.value })}
                className="w-full bg-gray-50 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleCreate}
                disabled={creating}
                className="w-full bg-blue-800 text-white rounded-xl p-3 font-bold hover:bg-blue-900 transition disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guarantee Pool */}
      {pool && (
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">🛡️ Guarantee Pool</h2>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
              {pool.activeDefaults} Active Defaults
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-white/70 text-sm">Pool Balance</p>
              <p className="text-2xl font-bold">
                ₦{pool.totalBalance?.toLocaleString() || '0'}
              </p>
            </div>
            <div>
              <p className="text-white/70 text-sm">Total Collected</p>
              <p className="text-2xl font-bold">
                ₦{pool.totalCollected?.toLocaleString() || '0'}
              </p>
            </div>
            <div>
              <p className="text-white/70 text-sm">Total Paid Out</p>
              <p className="text-2xl font-bold">
                ₦{pool.totalPaidOut?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Groups */}
      <div className="grid grid-cols-2 gap-6">
        {groups.map((group) => (
          <div
            key={group.id}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-blue-900 text-lg">
                  {group.name}
                </h3>
                <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-1 rounded-full">
                  🛡️ Guaranteed
                </span>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  group.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {group.isActive ? '🟢 Active' : '🔴 Paused'}
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-blue-600 text-xs">Contribution</p>
                <p className="text-blue-800 font-bold">
                  ₦{group.amount?.toLocaleString()}
                </p>
              </div>

              <div className="bg-amber-50 rounded-xl p-3">
                <p className="text-amber-600 text-xs">Guarantee Fee</p>
                <p className="text-amber-800 font-bold">
                  ₦{group.guaranteeFee?.toLocaleString()}
                </p>
              </div>

              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-green-600 text-xs">Pool Balance</p>
                <p className="text-green-800 font-bold">
                  ₦{group.guaranteePoolBalance?.toLocaleString()}
                </p>
              </div>

              <div className="bg-red-50 rounded-xl p-3">
                <p className="text-red-600 text-xs">
                  Avatar Coverage
                </p>
                <p className="text-red-800 font-bold">
                  {group.avatarCoveredCount}/
                  {group.maxAvatarCoverage}
                </p>
              </div>
            </div>

            {/* Members */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-600 mb-2">
                Members ({group.members?.length})
              </p>

              <div className="space-y-1">
                {group.members?.slice(0, 5).map((m: any) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                          m.isAvatar
                            ? 'bg-amber-500'
                            : 'bg-blue-800'
                        }`}
                      >
                        {m.isAvatar
                          ? '🤖'
                          : m.user?.fullName?.charAt(0)}
                      </div>

                      <span className="text-gray-700">
                        {m.isAvatar
                          ? 'Owode Avatar'
                          : m.user?.fullName}
                      </span>
                    </div>

                    <span
                      className={`px-1.5 py-0.5 rounded text-xs ${
                        m.hasPaid
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {m.isAvatar
                        ? '✅ Always Ready'
                        : m.hasPaid
                        ? '✅ Paid'
                        : '⏳ Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ✅ RISK DISPLAY */}
            {riskData[group.id] && (
              <div
                className={`mt-3 px-3 py-2 rounded-xl text-xs font-semibold ${
                  riskData[group.id].riskLevel === 'LOW'
                    ? 'bg-green-100 text-green-700'
                    : riskData[group.id].riskLevel === 'MEDIUM'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {riskData[group.id].riskLevel === 'LOW'
                  ? '🟢'
                  : riskData[group.id].riskLevel === 'MEDIUM'
                  ? '🟡'
                  : '🔴'}{' '}
                Risk: {riskData[group.id].riskLevel} • Avg Score:{' '}
                {Math.round(
                  riskData[group.id].averageTrustScore
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() =>
                  handleCheckDefaults(group.id)
                }
                className="flex-1 bg-red-50 text-red-700 text-xs py-2 rounded-lg hover:bg-red-100 transition font-semibold"
              >
                ⚠️ Check Defaults
              </button>

              <button
                onClick={() => setSelectedGroup(group)}
                className="flex-1 bg-blue-800 text-white text-xs py-2 rounded-lg hover:bg-blue-900 transition font-semibold"
              >
                View Details
              </button>
            </div>
          </div>
        ))}

        {groups.length === 0 && (
          <div className="col-span-2 text-center py-20 text-gray-400">
            <p className="text-4xl mb-4">🛡️</p>
            <p className="text-lg font-semibold">
              No Guaranteed Ajo groups yet
            </p>
            <p className="text-sm">
              Groups will appear here once created
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
