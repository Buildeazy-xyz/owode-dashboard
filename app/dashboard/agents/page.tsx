'use client'
import { useEffect, useState } from 'react'
import { adminAPI } from '../../../lib/api'

export default function AgentsPage() {
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const response = await adminAPI.getAgents()
        setAgents(response.data.data)
      } catch (error) {
        console.error('Could not load agents')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="text-blue-800 font-semibold">Loading agents...</div>

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-900">Field Agents</h1>
        <p className="text-gray-500 mt-1">{agents.length} active agents</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {agents.map(agent => (
          <div key={agent.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-800 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">{agent.fullName.charAt(0)}</span>
              </div>
              <div>
                <p className="font-bold text-gray-800">{agent.fullName}</p>
                <p className="text-gray-500 text-sm">{agent.phone}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-green-600 text-xs">Balance</p>
                <p className="text-green-800 font-bold text-sm">₦{agent.wallet?.balance?.toLocaleString() || '0'}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-blue-600 text-xs">Total Collected</p>
                <p className="text-blue-800 font-bold text-sm">₦{agent.wallet?.totalSaved?.toLocaleString() || '0'}</p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${agent.isVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {agent.isVerified ? '✅ Verified' : '⏳ Unverified'}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${agent.wallet?.isLocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {agent.wallet?.isLocked ? '🔒 Locked' : '🔓 Active'}
              </span>
            </div>
          </div>
        ))}

        {agents.length === 0 && (
          <div className="col-span-3 text-center py-20 text-gray-400">
            <p className="text-4xl mb-4">🧑‍💼</p>
            <p className="text-lg font-semibold">No agents yet</p>
            <p className="text-sm">Assign agent roles from the Users page</p>
          </div>
        )}
      </div>
    </div>
  )
}