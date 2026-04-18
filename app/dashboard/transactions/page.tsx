'use client'
import { useEffect, useState } from 'react'
import { adminAPI } from '../../../lib/api'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'CREDIT' | 'DEBIT'>('ALL')

  useEffect(() => {
    const load = async () => {
      try {
        const response = await adminAPI.getTransactions()
        setTransactions(response.data.data)
      } catch (error) {
        console.error('Could not load transactions')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = transactions.filter(tx => filter === 'ALL' || tx.type === filter)
  const totalVolume = filtered.reduce((sum, tx) => sum + tx.amount, 0)

  if (loading) return <div className="text-blue-800 font-semibold">Loading transactions...</div>

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-900">Transactions</h1>
        <p className="text-gray-500 mt-1">{transactions.length} total transactions</p>
      </div>

      {/* Summary Cards */}
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

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {(['ALL', 'CREDIT', 'DEBIT'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${filter === f ? 'bg-blue-800 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
          >
            {f}
          </button>
        ))}
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
      </div>
    </div>
  )
}