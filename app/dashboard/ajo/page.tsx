'use client'
import { useEffect, useState } from 'react'
import { adminAPI } from '../../../lib/api'

export default function AjoPage() {
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const response = await adminAPI.getAjoGroups()
        setGroups(response.data.data)
      } catch (error) {
        console.error('Could not load groups')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="text-blue-800 font-semibold">Loading Ajo groups...</div>

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-900">Ajo Groups</h1>
        <p className="text-gray-500 mt-1">{groups.length} total groups</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {groups.map(group => (
          <div key={group.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-blue-900 text-lg">{group.name}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${group.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {group.isActive ? '🟢 Active' : '🔴 Inactive'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-blue-600 text-xs">Amount/Cycle</p>
                <p className="text-blue-800 font-bold">₦{group.amount.toLocaleString()}</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3">
                <p className="text-amber-600 text-xs">Frequency</p>
                <p className="text-amber-800 font-bold">{group.frequency}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-green-600 text-xs">Members</p>
                <p className="text-green-800 font-bold">{group.members.length}/{group.totalMembers}</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-3">
                <p className="text-purple-600 text-xs">Current Cycle</p>
                <p className="text-purple-800 font-bold">{group.currentCycle}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Members filled</span>
                <span>{Math.round((group.members.length / group.totalMembers) * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full">
                <div
                  className="h-2 bg-blue-800 rounded-full transition-all"
                  style={{ width: `${(group.members.length / group.totalMembers) * 100}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-3">Created {new Date(group.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  )
}