'use client'
import { useEffect, useState } from 'react'
import { adminAPI } from '../../lib/api'
import { Stats, Transaction } from '../../types'

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  const loadStats = async () => {
    try {
      const response = await adminAPI.getStats()
      setStats(response.data.data)
    } catch (error) {
      console.error('Could not load stats', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadInitialStats = async () => {
      await loadStats()
    }
    loadInitialStats()
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-blue-800 text-lg font-semibold animate-pulse">Loading dashboard...</div>
    </div>
  )

  const statCards = [
    // Add to statCards:
    { label: 'Security Features', value: '3-Layer Auth', icon: '🔐', color: 'bg-slate-50 border-slate-200', textColor: 'text-slate-800' },
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: 'bg-blue-50 border-blue-200', textColor: 'text-blue-800' },
    { label: 'Total Agents', value: stats?.totalAgents || 0, icon: '🧑‍💼', color: 'bg-amber-50 border-amber-200', textColor: 'text-amber-800' },
    { label: 'Standard Ajo Groups', value: (stats?.totalGroups || 0) - (stats?.guaranteedGroups || 0), icon: '🤝', color: 'bg-green-50 border-green-200', textColor: 'text-green-800' },
    { label: 'Guaranteed Ajo Groups', value: stats?.guaranteedGroups || 0, icon: '🛡️', color: 'bg-purple-50 border-purple-200', textColor: 'text-purple-800' },
    { label: 'Active Defaults', value: stats?.activeDefaults || 0, icon: '⚠️', color: 'bg-red-50 border-red-200', textColor: 'text-red-800' },
    { label: 'Platform Balance', value: `₦${(stats?.totalBalance || 0).toLocaleString()}`, icon: '💰', color: 'bg-rose-50 border-rose-200', textColor: 'text-rose-800' },
    { label: 'Verified Users', value: stats?.verifiedUsers || 0, icon: '✅', color: 'bg-emerald-50 border-emerald-200', textColor: 'text-emerald-800' },
    { label: 'Total Transactions', value: stats?.totalTransactions || 0, icon: '💳', color: 'bg-indigo-50 border-indigo-200', textColor: 'text-indigo-800' },
    { label: 'Total Saved', value: `₦${(stats?.totalSaved || 0).toLocaleString()}`, icon: '🏦', color: 'bg-teal-50 border-teal-200', textColor: 'text-teal-800' },
  ]

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Platform Overview</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here&apos;s what&apos;s happening on OWODE.</p>
        </div>
        <button
          onClick={loadStats}
          className="bg-blue-800 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-900 transition"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {statCards.map(card => (
          <div key={card.label} className={`${card.color} border rounded-2xl p-6`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">{card.icon}</span>
              <span className={`text-xs font-semibold ${card.textColor} bg-white px-2 py-1 rounded-full`}>LIVE</span>
            </div>
            <p className="text-gray-500 text-sm">{card.label}</p>
            <p className={`text-2xl font-bold ${card.textColor} mt-1`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-blue-900">Recent Transactions</h2>
          <span className="text-xs text-gray-400">Auto-refreshes every 30s</span>
        </div>
        {stats?.recentTransactions?.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-4xl mb-2">💳</p>
            <p>No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats?.recentTransactions?.map((tx: Transaction) => (
              <div key={tx.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'CREDIT' ? 'bg-green-50' : 'bg-red-50'}`}>
                    <span>{tx.type === 'CREDIT' ? '⬆️' : '⬇️'}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{tx.wallet?.user?.fullName}</p>
                    <p className="text-xs text-gray-500 truncate max-w-xs">{tx.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${tx.type === 'CREDIT' ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.type === 'CREDIT' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Platform version */}
      <div className="mt-6 text-center">
        <p className="text-gray-400 text-xs">OWODE Platform v2.0 • Guaranteed Ajo • Trust Scores • Avatar AI</p>
      </div>
    </div>
  )
}