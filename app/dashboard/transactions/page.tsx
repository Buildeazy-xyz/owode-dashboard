'use client'
import { useEffect, useState } from 'react'
import { adminAPI } from '../../../lib/api'

interface Transaction {
  id: string
  type: 'CREDIT' | 'DEBIT'
  amount: number
  description: string
  reference: string
  status: string
  createdAt: string
  wallet: {
    user: {
      fullName: string
      phone: string
    }
  }
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'CREDIT' | 'DEBIT'>('ALL')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const response = await adminAPI.getTransactions()
        setTransactions(response.data.data)
      } catch {
        console.error('Could not load transactions')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = transactions.filter(tx => {
    const matchesFilter = filter === 'ALL' || tx.type === filter
    const matchesSearch = !search ||
      tx.wallet?.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      tx.wallet?.user?.phone?.includes(search) ||
      tx.reference?.toLowerCase().includes(search.toLowerCase()) ||
      tx.description?.toLowerCase().includes(search.toLowerCase())
    const txDate = new Date(tx.createdAt)
    const matchesFrom = !dateFrom || txDate >= new Date(dateFrom)
    const matchesTo = !dateTo || txDate <= new Date(dateTo + 'T23:59:59')
    return matchesFilter && matchesSearch && matchesFrom && matchesTo
  })

  const totalCredit = filtered.filter(t => t.type === 'CREDIT').reduce((sum, t) => sum + t.amount, 0)
  const totalDebit = filtered.filter(t => t.type === 'DEBIT').reduce((sum, t) => sum + t.amount, 0)
  const totalVolume = filtered.reduce((sum, t) => sum + t.amount, 0)
  const successCount = filtered.filter(t => t.status === 'SUCCESS').length

  const exportCSV = () => {
    const headers = ['User', 'Phone', 'Type', 'Amount', 'Description', 'Reference', 'Status', 'Date']
    const rows = filtered.map(tx => [
      tx.wallet?.user?.fullName || '',
      tx.wallet?.user?.phone || '',
      tx.type,
      tx.amount,
      `"${tx.description}"`,
      tx.reference,
      tx.status,
      new Date(tx.createdAt).toLocaleString()
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `owode-transactions-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-blue-800 font-semibold animate-pulse">Loading transactions...</div>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Transactions</h1>
          <p className="text-gray-500 mt-1">{transactions.length} total • {filtered.length} showing</p>
        </div>
        <button
          onClick={exportCSV}
          className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition flex items-center gap-2"
        >
          📥 Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Volume', value: `₦${totalVolume.toLocaleString()}`, icon: '💳', color: 'bg-blue-50 border-blue-200 text-blue-800' },
          { label: 'Total Credits', value: `₦${totalCredit.toLocaleString()}`, icon: '⬆️', color: 'bg-green-50 border-green-200 text-green-800' },
          { label: 'Total Debits', value: `₦${totalDebit.toLocaleString()}`, icon: '⬇️', color: 'bg-red-50 border-red-200 text-red-800' },
          { label: 'Successful', value: successCount, icon: '✅', color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
        ].map(card => (
          <div key={card.label} className={`${card.color} border rounded-2xl p-5`}>
            <span className="text-2xl">{card.icon}</span>
            <p className="text-gray-500 text-xs mt-2">{card.label}</p>
            <p className="text-xl font-bold mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
        <div className="flex gap-3 flex-wrap items-center">
          {/* Type Filter */}
          <div className="flex gap-2">
            {(['ALL', 'CREDIT', 'DEBIT'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                  filter === f ? 'bg-blue-800 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {f === 'ALL' ? '📊 All' : f === 'CREDIT' ? '⬆️ Credits' : '⬇️ Debits'}
              </button>
            ))}
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2 ml-2">
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-400 text-sm">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(''); setDateTo('') }}
                className="text-red-400 hover:text-red-600 text-sm font-semibold"
              >
                ✕ Clear
              </button>
            )}
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search user, phone, reference..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 ml-auto w-72"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">User</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Type</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Amount</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Description</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Reference</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(tx => (
              <tr
                key={tx.id}
                className="border-b border-gray-50 hover:bg-blue-50 transition cursor-pointer"
                onClick={() => setSelectedTx(tx)}
              >
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${tx.type === 'CREDIT' ? 'bg-green-100' : 'bg-red-100'}`}>
                      <span>{tx.type === 'CREDIT' ? '⬆️' : '⬇️'}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{tx.wallet?.user?.fullName || 'Unknown'}</p>
                      <p className="text-gray-400 text-xs">{tx.wallet?.user?.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${tx.type === 'CREDIT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {tx.type}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className={`font-bold text-sm ${tx.type === 'CREDIT' ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.type === 'CREDIT' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <p className="text-sm text-gray-600 max-w-xs truncate">{tx.description}</p>
                </td>
                <td className="py-4 px-6">
                  <p className="text-xs text-gray-400 font-mono truncate max-w-32">{tx.reference}</p>
                </td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    tx.status === 'SUCCESS' ? 'bg-green-100 text-green-700' :
                    tx.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {tx.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-xs text-gray-400">
                  {new Date(tx.createdAt).toLocaleDateString('en-NG', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                  <br />
                  <span className="text-gray-300">
                    {new Date(tx.createdAt).toLocaleTimeString('en-NG', {
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-semibold">No transactions found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedTx(null)}>
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-blue-900">Transaction Details</h2>
              <button onClick={() => setSelectedTx(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className={`rounded-2xl p-6 mb-6 text-center ${selectedTx.type === 'CREDIT' ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className={`text-4xl font-bold ${selectedTx.type === 'CREDIT' ? 'text-green-600' : 'text-red-500'}`}>
                {selectedTx.type === 'CREDIT' ? '+' : '-'}₦{selectedTx.amount.toLocaleString()}
              </p>
              <p className={`text-sm mt-2 font-semibold ${selectedTx.type === 'CREDIT' ? 'text-green-600' : 'text-red-500'}`}>
                {selectedTx.type === 'CREDIT' ? '⬆️ CREDIT' : '⬇️ DEBIT'}
              </p>
            </div>

            <div className="space-y-0">
              {[
                { label: 'User', value: selectedTx.wallet?.user?.fullName },
                { label: 'Phone', value: selectedTx.wallet?.user?.phone },
                { label: 'Description', value: selectedTx.description },
                { label: 'Reference', value: selectedTx.reference },
                { label: 'Status', value: selectedTx.status },
                { label: 'Date', value: new Date(selectedTx.createdAt).toLocaleString() },
              ].map(item => (
                <div key={item.label} className="flex justify-between py-3 border-b border-gray-50">
                  <span className="text-gray-500 text-sm">{item.label}</span>
                  <span className="font-semibold text-sm text-gray-800 max-w-xs text-right break-all">{item.value}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedTx(null)}
              className="w-full bg-blue-800 text-white rounded-xl py-3 font-semibold hover:bg-blue-900 transition mt-6"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
