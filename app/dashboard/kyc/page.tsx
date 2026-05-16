'use client'
import { useEffect, useState } from 'react'
import { adminAPI } from '../../../lib/api'

export default function KYCPage() {
  const [users, setUsers] = useState<any[]>([])
  const [pendingKYC, setPendingKYC] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pending' | 'verified' | 'unsubmitted'>('pending')
  const [search, setSearch] = useState('')
  const [verifying, setVerifying] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, pendingRes] = await Promise.all([
          adminAPI.getUsers(),
          adminAPI.getKYCPending()
        ])
        setUsers(usersRes.data.data)
        setPendingKYC(pendingRes.data.data)
      } catch (error) {
        console.error('Could not load KYC data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleVerify = async (userId: string) => {
    try {
      setVerifying(userId)
      await adminAPI.verifyUser(userId)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isVerified: true } : u))
      setPendingKYC(prev => prev.filter(u => u.id !== userId))
    } catch (error: any) {
      alert(error.response?.data?.message || 'Could not verify user')
    } finally {
      setVerifying(null)
    }
  }

  const verified = users.filter(u => u.isVerified)
  const unverified = users.filter(u => !u.isVerified)
  const unsubmitted = unverified.filter(u => !pendingKYC.find((p: any) => p.id === u.id))

  const filteredPending = pendingKYC.filter(u =>
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  )
  const filteredVerified = verified.filter(u =>
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  )
  const filteredUnsubmitted = unsubmitted.filter(u =>
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  )

  if (loading) return <div className="text-blue-800 font-semibold animate-pulse">Loading KYC data...</div>

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">KYC Management</h1>
          <p className="text-gray-500 mt-1">Manage user identity verification</p>
        </div>
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 w-72"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Users', value: users.length, icon: '👥', color: 'bg-blue-50 border-blue-200 text-blue-800' },
          { label: 'Pending Review', value: pendingKYC.length, icon: '⏳', color: 'bg-amber-50 border-amber-200 text-amber-800' },
          { label: 'Verified', value: verified.length, icon: '✅', color: 'bg-green-50 border-green-200 text-green-800' },
          { label: 'Not Submitted', value: unsubmitted.length, icon: '❌', color: 'bg-red-50 border-red-200 text-red-800' },
        ].map(card => (
          <div key={card.label} className={`${card.color} border rounded-2xl p-5`}>
            <span className="text-2xl">{card.icon}</span>
            <p className="text-gray-500 text-sm mt-2">{card.label}</p>
            <p className="text-2xl font-bold mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'pending', label: `⏳ Pending Review (${pendingKYC.length})` },
          { key: 'verified', label: `✅ Verified (${verified.length})` },
          { key: 'unsubmitted', label: `❌ Not Submitted (${unsubmitted.length})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition ${
              activeTab === tab.key
                ? 'bg-blue-800 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Pending Review Tab */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredPending.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">🎉</p>
              <p className="font-semibold">No pending KYC submissions!</p>
              <p className="text-sm mt-1">All submitted documents have been reviewed</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">User</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Phone</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">BVN</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">NIN</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Trust Score</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Submitted</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPending.map((user: any) => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-amber-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">{user.fullName?.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{user.fullName}</p>
                          <p className="text-gray-400 text-xs">{user.email || 'No email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">{user.phone}</td>
                    <td className="py-4 px-6">
                      {user.bvn ? (
                        <div>
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
                            ✅ Submitted
                          </span>
                          <p className="text-xs text-gray-400 mt-1">
                            {user.bvn.substring(0, 3)}****{user.bvn.substring(7)}
                          </p>
                        </div>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-full text-xs">
                          Not submitted
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {user.nin ? (
                        <div>
                          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-semibold">
                            ✅ Submitted
                          </span>
                          <p className="text-xs text-gray-400 mt-1">
                            {user.nin.substring(0, 3)}****{user.nin.substring(7)}
                          </p>
                        </div>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-full text-xs">
                          Not submitted
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 bg-gray-100 rounded-full">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${Math.min(user.trustScore, 100)}%`,
                              backgroundColor: user.trustScore >= 65 ? '#22c55e' : user.trustScore >= 35 ? '#f5a623' : '#ef4444'
                            }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-600">{Math.round(user.trustScore)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleVerify(user.id)}
                        disabled={verifying === user.id}
                        className="bg-blue-800 text-white text-xs px-4 py-2 rounded-lg hover:bg-blue-900 transition disabled:opacity-50"
                      >
                        {verifying === user.id ? '⏳ Verifying...' : '✅ Verify Now'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Verified Tab */}
      {activeTab === 'verified' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredVerified.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">👥</p>
              <p>No verified users found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">User</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Phone</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">BVN</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">NIN</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Role</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Verified</th>
                </tr>
              </thead>
              <tbody>
                {filteredVerified.map((user: any) => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">{user.fullName?.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{user.fullName}</p>
                          <p className="text-gray-400 text-xs">{user.email || 'No email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">{user.phone}</td>
                    <td className="py-4 px-6">
                      {user.wallet?.bvn || user.bvn ? (
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">✅ BVN</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-full text-xs">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {user.nin ? (
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-semibold">✅ NIN</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-full text-xs">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                        ✅ Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Not Submitted Tab */}
      {activeTab === 'unsubmitted' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredUnsubmitted.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">🎉</p>
              <p>All users have submitted their KYC!</p>
            </div>
          ) : (
            <>
              <div className="p-4 bg-red-50 border-b border-red-100">
                <p className="text-sm text-red-600 font-semibold">
                  ⚠️ These users have not submitted BVN or NIN yet. They cannot be verified.
                </p>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">User</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Phone</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Trust Score</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Joined</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUnsubmitted.map((user: any) => (
                    <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-red-400 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">{user.fullName?.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">{user.fullName}</p>
                            <p className="text-gray-400 text-xs">{user.email || 'No email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">{user.phone}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-16 bg-gray-100 rounded-full">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${Math.min(user.trustScore, 100)}%`,
                                backgroundColor: user.trustScore >= 65 ? '#22c55e' : '#ef4444'
                              }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-600">{Math.round(user.trustScore)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-semibold">
                          ❌ No KYC
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
    </div>
  )
}