'use client'
import { useEffect, useState } from 'react'
import { adminAPI } from '../../../lib/api'

export default function AjoPage() {
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', amount: '', frequency: 'WEEKLY', totalMembers: '' })
  const [creating, setCreating] = useState(false)

  const loadGroups = async () => {
    try {
      const response = await adminAPI.getAjoGroups()
      setGroups(response.data.data)
    } catch (error) {
      console.error('Could not load groups')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadGroups() }, [])

  const handleCreate = async () => {
    if (!form.name || !form.amount || !form.totalMembers) {
      alert('All fields are required')
      return
    }
    const members = Number(form.totalMembers)
    if (members < 6 || members > 12) {
      alert('Members must be between 6 and 12')
      return
    }
    try {
      setCreating(true)
      await adminAPI.createAjoGroup({
        name: form.name,
        amount: Number(form.amount),
        frequency: form.frequency,
        totalMembers: members
      })
      setShowCreate(false)
      setForm({ name: '', amount: '', frequency: 'WEEKLY', totalMembers: '' })
      await loadGroups()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Could not create group')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await adminAPI.deleteAjoGroup(id)
      setGroups(prev => prev.filter(g => g.id !== id))
    } catch (error: any) {
      alert(error.response?.data?.message || 'Could not delete group')
    }
  }

  if (loading) return <div className="text-blue-800 font-semibold">Loading Ajo groups...</div>

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Standard Ajo Groups</h1>
          <p className="text-gray-500 mt-1">{groups.length} groups • Min 6, Max 12 members</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-blue-800 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-900 transition"
        >
          + Create Group
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-blue-900 mb-6">Create Ajo Group</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-blue-900 block mb-2">Group Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-gray-50 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. OWODE Weekly Savers"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-blue-900 block mb-2">Contribution Amount (₦)</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                  className="w-full bg-gray-50 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 10000"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-blue-900 block mb-2">Number of Members (6-12)</label>
                <input
                  type="number"
                  value={form.totalMembers}
                  onChange={e => setForm(p => ({ ...p, totalMembers: e.target.value }))}
                  min="6" max="12"
                  className="w-full bg-gray-50 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="6 to 12"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-blue-900 block mb-2">Frequency</label>
                <div className="flex gap-2">
                  {['DAILY', 'WEEKLY', 'MONTHLY'].map(f => (
                    <button
                      key={f}
                      onClick={() => setForm(p => ({ ...p, frequency: f }))}
                      className={`flex-1 py-3 rounded-xl text-sm font-semibold transition ${form.frequency === f ? 'bg-blue-800 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="flex-1 bg-blue-800 text-white py-3 rounded-xl font-semibold hover:bg-blue-900 transition disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Groups Grid */}
      <div className="grid grid-cols-2 gap-6">
        {groups.filter((g: any) => !g.isGuaranteed).map(group => {
          const spotsLeft = group.totalMembers - group.members.length
          const isFull = spotsLeft === 0
          return (
            <div key={group.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-blue-900 text-lg">{group.name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isFull ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {isFull ? '✅ Full — Active' : `⏳ ${spotsLeft} spots left`}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="text-blue-600 text-xs">Amount/Cycle</p>
                  <p className="text-blue-800 font-bold">₦{group.amount?.toLocaleString()}</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3">
                  <p className="text-amber-600 text-xs">Frequency</p>
                  <p className="text-amber-800 font-bold">{group.frequency}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3">
                  <p className="text-green-600 text-xs">Members</p>
                  <p className="text-green-800 font-bold">{group.members?.length}/{group.totalMembers}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-3">
                  <p className="text-purple-600 text-xs">Current Cycle</p>
                  <p className="text-purple-800 font-bold">{group.currentCycle}</p>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Members filled</span>
                  <span>{Math.round((group.members?.length / group.totalMembers) * 100)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${(group.members?.length / group.totalMembers) * 100}%`,
                      backgroundColor: isFull ? '#22c55e' : '#0d47a1'
                    }}
                  />
                </div>
              </div>

              {!isFull && (
                <div className="bg-amber-50 rounded-xl p-3 mb-4 text-xs text-amber-700">
                  ⚠️ Contributions cannot start until all {group.totalMembers} members join
                </div>
              )}

              <button
                onClick={() => handleDelete(group.id, group.name)}
                className="w-full bg-red-50 text-red-600 py-2 rounded-xl text-sm font-semibold hover:bg-red-100 transition"
              >
                🗑️ Delete Group
              </button>
            </div>
          )
        })}

        {groups.filter((g: any) => !g.isGuaranteed).length === 0 && (
          <div className="col-span-2 text-center py-20 text-gray-400">
            <p className="text-4xl mb-4">🤝</p>
            <p className="text-lg font-semibold">No Standard Ajo groups yet</p>
            <p className="text-sm">Click "Create Group" to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}