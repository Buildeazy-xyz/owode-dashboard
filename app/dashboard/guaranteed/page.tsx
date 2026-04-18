'use client'
import { useEffect, useState } from 'react'
import { adminAPI } from '../../../lib/api'

export default function GuaranteedAjoPage() {
  const [groups, setGroups] = useState<any[]>([])
  const [pool, setPool] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedGroup, setSelectedGroup] = useState<any>(null)

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

  const handleCheckDefaults = async (groupId: string) => {
    try {
      const response = await adminAPI.checkDefaults(groupId)
      alert(`Default check complete: ${JSON.stringify(response.data.data)}`)
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error checking defaults')
    }
  }

  if (loading) return <div className="text-blue-800 font-semibold">Loading Guaranteed Ajo data...</div>

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-900">Guaranteed Ajo Groups</h1>
        <p className="text-gray-500 mt-1">AI-backed savings with zero default risk</p>
      </div>

      {/* Guarantee Pool Card */}
      {pool && (
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">🛡️ Guarantee Pool</h2>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">{pool.activeDefaults} Active Defaults</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-white/70 text-sm">Pool Balance</p>
              <p className="text-2xl font-bold">₦{pool.totalBalance?.toLocaleString() || '0'}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm">Total Collected</p>
              <p className="text-2xl font-bold">₦{pool.totalCollected?.toLocaleString() || '0'}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm">Total Paid Out</p>
              <p className="text-2xl font-bold">₦{pool.totalPaidOut?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Groups Grid */}
      <div className="grid grid-cols-2 gap-6">
        {groups.map(group => (
          <div key={group.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-blue-900 text-lg">{group.name}</h3>
                <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-1 rounded-full">
                  🛡️ Guaranteed
                </span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${group.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {group.isActive ? '🟢 Active' : '🔴 Paused'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-blue-600 text-xs">Contribution</p>
                <p className="text-blue-800 font-bold">₦{group.amount?.toLocaleString()}</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3">
                <p className="text-amber-600 text-xs">Guarantee Fee</p>
                <p className="text-amber-800 font-bold">₦{group.guaranteeFee?.toLocaleString()}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-green-600 text-xs">Pool Balance</p>
                <p className="text-green-800 font-bold">₦{group.guaranteePoolBalance?.toLocaleString()}</p>
              </div>
              <div className="bg-red-50 rounded-xl p-3">
                <p className="text-red-600 text-xs">Avatar Coverage</p>
                <p className="text-red-800 font-bold">{group.avatarCoveredCount}/{group.maxAvatarCoverage}</p>
              </div>
            </div>

            {/* Members */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-600 mb-2">Members ({group.members?.length})</p>
              <div className="space-y-1">
                {group.members?.slice(0, 5).map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${m.isAvatar ? 'bg-amber-500' : 'bg-blue-800'}`}>
                        {m.isAvatar ? '🤖' : m.user?.fullName?.charAt(0)}
                      </div>
                      <span className="text-gray-700">{m.isAvatar ? 'Owode Avatar' : m.user?.fullName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-xs ${m.hasPaid ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {m.isAvatar ? '✅ Always Ready' : m.hasPaid ? '✅ Paid' : '⏳ Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleCheckDefaults(group.id)}
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
            <p className="text-lg font-semibold">No Guaranteed Ajo groups yet</p>
            <p className="text-sm">Groups will appear here once created from the mobile app</p>
          </div>
        )}
      </div>
    </div>
  )
}