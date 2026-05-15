'use client'
import { useEffect, useState } from 'react'
import { adminAPI } from '../../../lib/api'

export default function SavingsPage() {
  const [goals, setGoals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [stats, setStats] = useState({
    totalGoals: 0,
    activeGoals: 0,
    completedGoals: 0,
    totalSaved: 0
  })

  useEffect(() => {
    const load = async () => {
      try {
        const response = await adminAPI.getSavingsGoals()
        const data = response.data.data
        setGoals(data)
        setStats({
          totalGoals: data.length,
          activeGoals: data.filter((g: any) => g.status === 'ACTIVE').length,
          completedGoals: data.filter((g: any) => g.status === 'COMPLETED').length,
          totalSaved: data.reduce((sum: number, g: any) => sum + (g.currentAmount || 0), 0)
        })
      } catch {
        console.error('Could not load savings goals')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = goals.filter(g =>
    g.title?.toLowerCase().includes(search.toLowerCase()) ||
    g.user?.fullName?.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-blue-100 text-blue-700'
      case 'COMPLETED': return 'bg-green-100 text-green-700'
      case 'WITHDRAWN': return 'bg-gray-100 text-gray-700'
      case 'CANCELLED': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) return <div className="text-blue-800 font-semibold">Loading savings goals...</div>

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Savings Goals</h1>
          <p className="text-gray-500 mt-1">{goals.length} total savings goals</p>
        </div>
        <input
          type="text"
          placeholder="Search by title or user..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 w-72"
        />
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Goals', value: stats.totalGoals, icon: '🎯', color: 'bg-blue-50 border-blue-200 text-blue-800' },
          { label: 'Active', value: stats.activeGoals, icon: '🔵', color: 'bg-indigo-50 border-indigo-200 text-indigo-800' },
          { label: 'Completed', value: stats.completedGoals, icon: '✅', color: 'bg-green-50 border-green-200 text-green-800' },
          { label: 'Total Saved', value: `₦${stats.totalSaved.toLocaleString()}`, icon: '💰', color: 'bg-amber-50 border-amber-200 text-amber-800' },
        ].map(card => (
          <div key={card.label} className={`${card.color} border rounded-2xl p-5`}>
            <span className="text-2xl">{card.icon}</span>
            <p className="text-gray-500 text-sm mt-2">{card.label}</p>
            <p className="text-2xl font-bold mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">User</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Goal</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Progress</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Target Date</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Auto-Debit</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((goal: any) => {
              const progress = Math.round((goal.currentAmount / goal.goalAmount) * 100)
              return (
                <tr key={goal.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {goal.user?.fullName?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{goal.user?.fullName || 'Unknown'}</p>
                        <p className="text-gray-400 text-xs">{goal.user?.phone || ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-semibold text-gray-800 text-sm">{goal.title}</p>
                    <p className="text-gray-400 text-xs">
                      ₦{goal.currentAmount?.toLocaleString()} / ₦{goal.goalAmount?.toLocaleString()}
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 bg-gray-100 rounded-full">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${Math.min(progress, 100)}%`,
                            backgroundColor: progress >= 100 ? '#22c55e' : progress >= 50 ? '#f5a623' : '#0d47a1'
                          }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-600">{progress}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {new Date(goal.targetDate).toLocaleDateString('en-NG', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(goal.status)}`}>
                      {goal.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {goal.autoDebitAmount > 0
                      ? `₦${goal.autoDebitAmount?.toLocaleString()} ${goal.autoDebitFreq?.toLowerCase()}`
                      : <span className="text-gray-400">None</span>
                    }
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-3xl mb-2">🐷</p>
            <p>No savings goals found</p>
          </div>
        )}
      </div>
    </div>
  )
}
