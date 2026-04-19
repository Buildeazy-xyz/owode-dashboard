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
      tx.reference?.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const totalVolume = filtered.reduce((sum, tx) => sum + tx.amount, 0)

  const exportCSV = () => {
    const headers = ['User', 'Phone', 'Type', 'Amount', 'Description', 'Reference', 'Status', 'Date']
    const rows = filtered.map(tx => [
      tx.wallet?.user?.fullName,
      tx.wallet?.user?.phone,
      tx.type,
      tx.amount,
      tx.description,
      tx.reference,
      tx.status,
      new Date(tx.createdAt).toLocaleString()
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'owode-transactions.csv'
    a.click()
  }

  if (loading) return <div className="text-blue-800 font-semibold">Loading transactions...</div>

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Transactions</h1>
          <p className="text-gray-500 mt-1">{transactions.length} total transactions</p>
        </div>
        <button onClick={exportCSV} className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition">
          📥 Export CSV
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <p className="text-blue-600 text-sm">Total Volume</p>
          <p className="text-2xl font-bold text-blue-800">₦{totalVolume.toLocaleString()}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <p className="text-green-600 text-sm">Credits</p>
          <p className="text-2xl font-bold text-green-800">{transactions.filter(t => t.type === 'CREDIT').length}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-red-600 text-sm">Debits</p>
          <p className="text-2xl font-bold text-red-800">{transactions.filter(t => t.type === 'DEBIT').length}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {(['ALL', 'CREDIT', 'DEBIT'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${filter === f ? 'bg-blue-800 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
          >
            {f}
          </button>
        ))}
        <input
          type="text"
          placeholder="Search by user or reference..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 ml-auto w-72"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">User</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Type</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Amount</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Description</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(tx => (
              <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                <td className="py-4 px-6">
                  <p className="font-semibold text-gray-800 text-sm">{tx.wallet?.user?.fullName}</p>
                  <p className="text-gray-400 text-xs">{tx.wallet?.user?.phone}</p>
                </td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${tx.type === 'CREDIT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {tx.type === 'CREDIT' ? '⬆️ Credit' : '⬇️ Debit'}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className={`font-bold ${tx.type === 'CREDIT' ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.type === 'CREDIT' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <p className="text-sm text-gray-600 max-w-xs truncate">{tx.description}</p>
                </td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${tx.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {tx.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-xs text-gray-400">
                  {new Date(tx.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-3xl mb-2">📭</p>
            <p>No transactions found</p>
          </div>
        )}
      </div>
    </div>
  )
}