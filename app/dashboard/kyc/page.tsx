'use client'
import { useEffect, useState } from 'react'
import { adminAPI } from '../../../lib/api'

export default function KYCPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const response = await adminAPI.getUsers()
        setUsers(response.data.data)
      } catch (error) {
        console.error('Could not load users')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleVerify = async (userId: string) => {
    try {
      await adminAPI.verifyUser(userId)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isVerified: true } : u))
    } catch (error: any) {
      alert(error.response?.data?.message || 'Could not verify user')
    }
  }

  const unverified = users.filter(u => !u.isVerified)
  const verified = users.filter(u => u.isVerified)

  if (loading) return <div className="text-blue-800 font-semibold">Loading KYC data...</div>

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-900">KYC Management</h1>
        <p className="text-gray-500 mt-1">{verified.length} verified • {unverified.length} pending</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-amber-600 text-sm">Pending Verification</p>
          <p className="text-3xl font-bold text-amber-800">{unverified.length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <p className="text-green-600 text-sm">Verified Users</p>
          <p className="text-3xl font-bold text-green-800">{verified.length}</p>
        </div>
      </div>

      {unverified.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="p-6 border-b border-gray-50">
            <h2 className="font-bold text-blue-900">⏳ Pending Verification</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Phone</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Joined</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {unverified.map(user => (
                <tr key={user.id} className="border-b border-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{user.fullName.charAt(0)}</span>
                      </div>
                      <p className="font-semibold text-gray-800 text-sm">{user.fullName}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">{user.phone}</td>
                  <td className="py-4 px-6 text-xs text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => handleVerify(user.id)}
                      className="bg-blue-800 text-white text-xs px-4 py-2 rounded-lg hover:bg-blue-900 transition"
                    >
                      ✅ Verify Now
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-50">
          <h2 className="font-bold text-blue-900">✅ Verified Users</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">User</th>
              <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Phone</th>
              <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Role</th>
            </tr>
          </thead>
          <tbody>
            {verified.map(user => (
              <tr key={user.id} className="border-b border-gray-50">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{user.fullName.charAt(0)}</span>
                    </div>
                    <p className="font-semibold text-gray-800 text-sm">{user.fullName}</p>
                  </div>
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">{user.phone}</td>
                <td className="py-4 px-6">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">{user.role}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}