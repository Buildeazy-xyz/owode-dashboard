'use client'
import { useEffect, useState } from 'react'
import { adminAPI } from '../../../lib/api'

export default function RecoveryPage() {
  const [defaults, setDefaults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const response = await adminAPI.getDefaults()
        setDefaults(response.data.data)
      } catch (error) {
        console.error('Could not load defaults')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleRunRecovery = async () => {
    try {
      setRunning(true)
      const response = await adminAPI.runRecovery()
      alert(`Recovery complete: ${response.data.data.length} records processed`)
      const refreshed = await adminAPI.getDefaults()
      setDefaults(refreshed.data.data)
    } catch (error) {
      alert('Recovery failed')
    } finally {
      setRunning(false)
    }
  }

  const handleWriteOff = async (id: string) => {
    if (!confirm('Write off this default? This will unlock the user\'s wallet.')) return
    try {
      await adminAPI.writeOffDefault(id)
      setDefaults(prev => prev.filter(d => d.id !== id))
    } catch (error) {
      alert('Could not write off default')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RECOVERED': return 'bg-green-100 text-green-700'
      case 'SOFT_RECOVERY': return 'bg-amber-100 text-amber-700'
      case 'HARD_RECOVERY': return 'bg-red-100 text-red-700'
      case 'WRITTEN_OFF': return 'bg-gray-100 text-gray-500'
      default: return 'bg-blue-100 text-blue-700'
    }
  }

  if (loading) return <div className="text-blue-800 font-semibold">Loading recovery data...</div>

  const active = defaults.filter(d => !['RECOVERED', 'WRITTEN_OFF'].includes(d.recoveryStatus))
  const resolved = defaults.filter(d => ['RECOVERED', 'WRITTEN_OFF'].includes(d.recoveryStatus))

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Default Recovery</h1>
          <p className="text-gray-500 mt-1">{active.length} active defaults • {resolved.length} resolved</p>
        </div>
        <button
          onClick={handleRunRecovery}
          disabled={running}
          className="bg-blue-800 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-900 transition disabled:opacity-50"
        >
          {running ? 'Running...' : '⚡ Run Recovery Checks'}
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-red-600 text-sm">Active Defaults</p>
          <p className="text-2xl font-bold text-red-800">{active.length}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-amber-600 text-sm">Soft Recovery</p>
          <p className="text-2xl font-bold text-amber-800">{defaults.filter(d => d.recoveryStatus === 'SOFT_RECOVERY').length}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-red-600 text-sm">Hard Recovery</p>
          <p className="text-2xl font-bold text-red-800">{defaults.filter(d => d.recoveryStatus === 'HARD_RECOVERY').length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <p className="text-green-600 text-sm">Recovered</p>
          <p className="text-2xl font-bold text-green-800">{defaults.filter(d => d.recoveryStatus === 'RECOVERED').length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Defaulter</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Group</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Amount Owed</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Penalty</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Days</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {defaults.map(record => {
              const daysSince = Math.floor((new Date().getTime() - new Date(record.createdAt).getTime()) / (1000 * 60 * 60 * 24))
              return (
                <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <p className="font-semibold text-gray-800 text-sm">{record.user?.fullName}</p>
                    <p className="text-gray-400 text-xs">{record.user?.phone}</p>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">{record.group?.name}</td>
                  <td className="py-4 px-6 font-bold text-red-600">₦{record.amountOwed?.toLocaleString()}</td>
                  <td className="py-4 px-6 text-orange-600">₦{record.penaltyAmount?.toLocaleString()}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(record.recoveryStatus)}`}>
                      {record.recoveryStatus}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`text-sm font-semibold ${daysSince >= 4 ? 'text-red-600' : 'text-amber-600'}`}>
                      Day {daysSince}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {!['RECOVERED', 'WRITTEN_OFF'].includes(record.recoveryStatus) && (
                      <button
                        onClick={() => handleWriteOff(record.id)}
                        className="bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-200 transition"
                      >
                        Write Off
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}