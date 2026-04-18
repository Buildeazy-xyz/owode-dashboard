'use client'
import { useEffect, useState } from 'react'
import { adminAPI } from '../../../lib/api'

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await adminAPI.getUsers()
        setUsers(response.data.data)
      } catch (error) {
        console.error('Could not load users')
      } finally {
        setLoading(false)
      }
    }
    loadUsers()
  }, [])

  const handleVerify = async (userId: string) => {
    try {
      await adminAPI.verifyUser(userId)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isVerified: true } : u))
    } catch (error: any) {
      alert(error.response?.data?.message || 'Could not verify user')
    }
  }

  const handleLockWallet = async (userId: string, isLocked: boolean) => {
    try {
      if (isLocked) {
        await adminAPI.unlockWallet(userId)
      } else {
        await adminAPI.lockWallet(userId)
      }
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, wallet: { ...u.wallet, isLocked: !isLocked } } : u))
    } catch (error) {
      alert('Could not update wallet status')
    }
  }

  const filtered = users.filter(u =>
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.phone.includes(search)
  )

  if (loading) return <div className="text-blue-800 font-semibold">Loading users...</div>

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Users</h1>
          <p className="text-gray-500 mt-1">{users.length} total users on the platform</p>
        </div>
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 w-72"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">User</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Phone</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Balance</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">KYC</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Wallet</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => (
              <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-800 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{user.fullName.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{user.fullName}</p>
                      <p className="text-gray-400 text-xs">{user.role}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">{user.phone}</td>
                <td className="py-4 px-6">
                  <span className="font-semibold text-gray-800">₦{user.wallet?.balance?.toLocaleString() || '0'}</span>
                </td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.isVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {user.isVerified ? '✅ Verified' : '⏳ Unverified'}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.wallet?.isLocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {user.wallet?.isLocked ? '🔒 Locked' : '🔓 Active'}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex gap-2">
                    {!user.isVerified && (
                      <button
                        onClick={() => handleVerify(user.id)}
                        className="bg-blue-800 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-900 transition"
                      >
                        Verify
                      </button>
                    )}
                    <button
                      onClick={() => handleLockWallet(user.id, user.wallet?.isLocked)}
                      className={`text-xs px-3 py-1.5 rounded-lg transition ${user.wallet?.isLocked ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                    >
                      {user.wallet?.isLocked ? 'Unlock' : 'Lock'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}