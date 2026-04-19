'use client'
import { useEffect, useState } from 'react'
import { adminAPI } from '../../../lib/api'

interface Wallet {
  balance: number
  totalSaved: number
  totalPayout: number
  isLocked: boolean
}

interface User {
  id: string
  fullName: string
  phone: string
  email: string | null
  role: string
  isVerified: boolean
  isActive: boolean
  trustScore: number
  createdAt: string
  wallet: Wallet | null
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await adminAPI.getUsers()
        setUsers(response.data.data)
      } catch {
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
      if (selectedUser?.id === userId) setSelectedUser(prev => prev ? { ...prev, isVerified: true } : null)
    } catch {
      alert('Could not verify user')
    }
  }

  const handleLockWallet = async (userId: string, isLocked: boolean) => {
    try {
      if (isLocked) {
        await adminAPI.unlockWallet(userId)
      } else {
        await adminAPI.lockWallet(userId)
      }
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, wallet: u.wallet ? { ...u.wallet, isLocked: !isLocked } : null } : u))
    } catch {
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
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Trust Score</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">KYC</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Wallet</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => (
              <tr
                key={user.id}
                className="border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer"
                onClick={() => setSelectedUser(user)}
              >
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
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-16 bg-gray-100 rounded-full">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min(user.trustScore, 100)}%`,
                          backgroundColor: user.trustScore >= 65 ? '#22c55e' : user.trustScore >= 35 ? '#f5a623' : '#ef4444'
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-600">{Math.round(user.trustScore)}</span>
                  </div>
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
                <td className="py-4 px-6" onClick={e => e.stopPropagation()}>
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
                      onClick={() => handleLockWallet(user.id, user.wallet?.isLocked ?? false)}
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
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-3xl mb-2">👥</p>
            <p>No users found</p>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedUser(null)}>
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-blue-800 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">{selectedUser.fullName.charAt(0)}</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-blue-900">{selectedUser.fullName}</h2>
                <p className="text-gray-500">{selectedUser.phone}</p>
              </div>
            </div>

            <div className="space-y-0 mb-6">
              {[
                { label: 'Email', value: selectedUser.email || 'Not provided' },
                { label: 'Role', value: selectedUser.role },
                { label: 'Balance', value: `₦${selectedUser.wallet?.balance?.toLocaleString() || '0'}`, color: 'text-green-600' },
                { label: 'Total Saved', value: `₦${selectedUser.wallet?.totalSaved?.toLocaleString() || '0'}` },
                { label: 'Trust Score', value: `${Math.round(selectedUser.trustScore)}/100` },
                { label: 'KYC Status', value: selectedUser.isVerified ? '✅ Verified' : '⏳ Unverified', color: selectedUser.isVerified ? 'text-green-600' : 'text-amber-600' },
                { label: 'Wallet', value: selectedUser.wallet?.isLocked ? '🔒 Locked' : '🔓 Active', color: selectedUser.wallet?.isLocked ? 'text-red-600' : 'text-green-600' },
                { label: 'Joined', value: new Date(selectedUser.createdAt).toLocaleDateString() }
              ].map(item => (
                <div key={item.label} className="flex justify-between py-3 border-b border-gray-50">
                  <span className="text-gray-500 text-sm">{item.label}</span>
                  <span className={`font-semibold text-sm ${item.color || 'text-gray-800'}`}>{item.value}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              {!selectedUser.isVerified && (
                <button
                  onClick={() => handleVerify(selectedUser.id)}
                  className="flex-1 bg-blue-800 text-white rounded-xl py-3 font-semibold hover:bg-blue-900 transition text-sm"
                >
                  ✅ Verify User
                </button>
              )}
              <button
                onClick={() => handleLockWallet(selectedUser.id, selectedUser.wallet?.isLocked ?? false)}
                className={`flex-1 rounded-xl py-3 font-semibold transition text-sm ${selectedUser.wallet?.isLocked ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
              >
                {selectedUser.wallet?.isLocked ? '🔓 Unlock Wallet' : '🔒 Lock Wallet'}
              </button>
              <button onClick={() => setSelectedUser(null)} className="flex-1 bg-gray-100 text-gray-600 rounded-xl py-3 font-semibold hover:bg-gray-200 transition text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}