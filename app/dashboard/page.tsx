/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useEffect, useState } from 'react'
import { adminAPI } from '../../lib/api'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadStats = async () => {
    try {
      const response = await adminAPI.getStats()
      setStats(response.data.data)
    } catch (error) {
      console.error('Could not load stats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  }, [])

  // Process transaction data for charts
  const transactionChartData = stats?.recentTransactions
    ? (() => {
        const grouped: Record<string, { date: string; credit: number; debit: number }> = {}
        stats.recentTransactions.forEach((tx: any) => {
          const date = new Date(tx.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })
          if (!grouped[date]) grouped[date] = { date, credit: 0, debit: 0 }
          if (tx.type === 'CREDIT') grouped[date].credit += tx.amount
          else grouped[date].debit += tx.amount
        })
        return Object.values(grouped).slice(-7)
      })()
    : []

  const pieData = [
    { name: 'Standard Ajo', value: (stats?.totalGroups || 0) - (stats?.guaranteedGroups || 0), color: '#0d47a1' },
    { name: 'Guaranteed Ajo', value: stats?.guaranteedGroups || 0, color: '#f5a623' },
    { name: 'Savings Goals', value: stats?.activeSavingsGoals || 0, color: '#22c55e' },
  ]

  const userStatsData = [
    { name: 'Total', value: stats?.totalUsers || 0, fill: '#0d47a1' },
    { name: 'Verified', value: stats?.verifiedUsers || 0, fill: '#22c55e' },
    { name: 'Agents', value: stats?.totalAgents || 0, fill: '#f5a623' },
  ]

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: 'bg-blue-50 border-blue-200', textColor: 'text-blue-800', change: '+12%' },
    { label: 'Total Agents', value: stats?.totalAgents || 0, icon: '🧑‍💼', color: 'bg-amber-50 border-amber-200', textColor: 'text-amber-800', change: '+5%' },
    { label: 'Standard Ajo', value: (stats?.totalGroups || 0) - (stats?.guaranteedGroups || 0), icon: '🤝', color: 'bg-green-50 border-green-200', textColor: 'text-green-800', change: '' },
    { label: 'Guaranteed Ajo', value: stats?.guaranteedGroups || 0, icon: '🛡️', color: 'bg-purple-50 border-purple-200', textColor: 'text-purple-800', change: '' },
    { label: 'Active Defaults', value: stats?.activeDefaults || 0, icon: '⚠️', color: 'bg-red-50 border-red-200', textColor: 'text-red-800', change: '' },
    { label: 'Platform Balance', value: `₦${(stats?.totalBalance || 0).toLocaleString()}`, icon: '💰', color: 'bg-rose-50 border-rose-200', textColor: 'text-rose-800', change: '' },
    { label: 'Verified Users', value: stats?.verifiedUsers || 0, icon: '✅', color: 'bg-emerald-50 border-emerald-200', textColor: 'text-emerald-800', change: '' },
    { label: 'Transactions', value: stats?.totalTransactions || 0, icon: '💳', color: 'bg-indigo-50 border-indigo-200', textColor: 'text-indigo-800', change: '' },
    { label: 'Total Saved', value: `₦${(stats?.totalSaved || 0).toLocaleString()}`, icon: '🏦', color: 'bg-teal-50 border-teal-200', textColor: 'text-teal-800', change: '' },
    { label: 'Savings Goals', value: stats?.totalSavingsGoals || 0, icon: '🐷', color: 'bg-pink-50 border-pink-200', textColor: 'text-pink-800', change: '' },
    { label: 'Total Savings', value: `₦${(stats?.totalSavingsAmount || 0).toLocaleString()}`, icon: '💎', color: 'bg-cyan-50 border-cyan-200', textColor: 'text-cyan-800', change: '' },
    { label: 'Active Savings', value: stats?.activeSavingsGoals || 0, icon: '🎯', color: 'bg-violet-50 border-violet-200', textColor: 'text-violet-800', change: '' },
  ]

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-blue-800 text-lg font-semibold animate-pulse">Loading dashboard...</div>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Platform Overview</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here is what is happening on OWODE.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 bg-green-50 border border-green-200 text-green-600 px-3 py-1 rounded-full font-semibold">
            🟢 Live
          </span>
          <button
            onClick={loadStats}
            className="bg-blue-800 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-900 transition"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {statCards.map(card => (
          <div key={card.label} className={`${card.color} border rounded-2xl p-5`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{card.icon}</span>
              {card.change && (
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {card.change}
                </span>
              )}
            </div>
            <p className="text-gray-500 text-xs">{card.label}</p>
            <p className={`text-xl font-bold ${card.textColor} mt-1`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-3 gap-6 mb-6">

        {/* Transaction Volume Chart */}
        <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-blue-900">Transaction Volume</h2>
              <p className="text-xs text-gray-400">Credits vs Debits — last 7 days</p>
            </div>
          </div>
          {transactionChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={transactionChartData}>
                <defs>
                  <linearGradient id="creditGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="debitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: any) => `₦${Number(value).toLocaleString()}`} />
                <Legend />
                <Area type="monotone" dataKey="credit" stroke="#22c55e" fill="url(#creditGradient)" strokeWidth={2} name="Credits" />
                <Area type="monotone" dataKey="debit" stroke="#ef4444" fill="url(#debitGradient)" strokeWidth={2} name="Debits" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400">
              <div className="text-center">
                <p className="text-3xl mb-2">📊</p>
                <p className="text-sm">No transaction data yet</p>
              </div>
            </div>
          )}
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-blue-900">Groups Distribution</h2>
            <p className="text-xs text-gray-400">Ajo groups breakdown</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-gray-600">{item.name}</span>
                </div>
                <span className="text-xs font-bold text-gray-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-2 gap-6 mb-6">

        {/* User Stats Bar Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-blue-900">User Statistics</h2>
            <p className="text-xs text-gray-400">Users breakdown</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={userStatsData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {userStatsData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Platform Health */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-blue-900">Platform Health</h2>
            <p className="text-xs text-gray-400">Key metrics at a glance</p>
          </div>
          <div className="space-y-4">
            {[
              {
                label: 'KYC Verification Rate',
                value: stats?.totalUsers > 0 ? Math.round((stats?.verifiedUsers / stats?.totalUsers) * 100) : 0,
                color: '#22c55e',
                icon: '✅'
              },
              {
                label: 'Groups Fill Rate',
                value: stats?.totalGroups > 0 ? Math.round((stats?.activeGroups / stats?.totalGroups) * 100) : 0,
                color: '#0d47a1',
                icon: '🤝'
              },
              {
                label: 'Savings Goal Completion',
                value: stats?.totalSavingsGoals > 0
                  ? Math.round(((stats?.totalSavingsGoals - stats?.activeSavingsGoals) / stats?.totalSavingsGoals) * 100)
                  : 0,
                color: '#f5a623',
                icon: '🐷'
              },
              {
                label: 'Default Rate',
                value: stats?.totalUsers > 0 ? Math.round((stats?.activeDefaults / stats?.totalUsers) * 100) : 0,
                color: '#ef4444',
                icon: '⚠️'
              }
            ].map(metric => (
              <div key={metric.label}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{metric.icon}</span>
                    <span className="text-xs font-semibold text-gray-600">{metric.label}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-800">{metric.value}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(metric.value, 100)}%`,
                      backgroundColor: metric.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-blue-900">Recent Transactions</h2>
          <span className="text-xs text-gray-400">Auto-refreshes every 30s</span>
        </div>
        {!stats?.recentTransactions?.length ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-4xl mb-2">💳</p>
            <p>No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.recentTransactions.map((tx: any) => (
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

      <div className="mt-6 text-center">
        <p className="text-gray-400 text-xs">OWODE Platform v2.0 • Guaranteed Ajo • Trust Scores • Avatar AI</p>
      </div>
    </div>
  )
}