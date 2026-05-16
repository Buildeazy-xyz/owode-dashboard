'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { adminAPI } from '../../lib/api'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [showNotify, setShowNotify] = useState(false)
  const [notifyTitle, setNotifyTitle] = useState('')
  const [notifyBody, setNotifyBody] = useState('')
  const [notifyType, setNotifyType] = useState('all')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('owode_admin_token')
    const savedUser = localStorage.getItem('owode_admin_user')
    if (!token || !savedUser) { router.push('/'); return }
    setUser(JSON.parse(savedUser))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('owode_admin_token')
    localStorage.removeItem('owode_admin_user')
    router.push('/')
  }

  const handleSendNotification = async () => {
    if (!notifyTitle || !notifyBody) {
      alert('Title and message are required!')
      return
    }
    try {
      setSending(true)
      await adminAPI.sendNotification({
        title: notifyTitle,
        body: notifyBody,
        type: notifyType
      })
      setSent(true)
      setTimeout(() => {
        setSent(false)
        setShowNotify(false)
        setNotifyTitle('')
        setNotifyBody('')
        setNotifyType('all')
      }, 2000)
    } catch (error: any) {
      alert(error.response?.data?.message || 'Could not send notification')
    } finally {
      setSending(false)
    }
  }

  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: '📊' },
    { href: '/dashboard/users', label: 'Users', icon: '👥' },
    { href: '/dashboard/transactions', label: 'Transactions', icon: '💳' },
    { href: '/dashboard/ajo', label: 'Standard Ajo', icon: '🤝' },
    { href: '/dashboard/guaranteed', label: 'Guaranteed Ajo', icon: '🛡️' },
    { href: '/dashboard/savings', label: 'Savings Goals', icon: '🐷' },
    { href: '/dashboard/agents', label: 'Agents', icon: '🧑‍💼' },
    { href: '/dashboard/kyc', label: 'KYC', icon: '📋' },
    { href: '/dashboard/recovery', label: 'Recovery', icon: '⚠️' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-slate-900 to-blue-900 min-h-screen flex flex-col fixed">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">O</span>
            </div>
            <div>
              <h1 className="text-white font-bold tracking-wider">OWODE</h1>
              <p className="text-amber-400 text-xs">Admin Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition text-sm font-medium ${
                pathname === item.href
                  ? 'bg-white/20 text-white'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}

          {/* Send Notification Button */}
          <button
            onClick={() => setShowNotify(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white mt-2"
          >
            <span>🔔</span>
            Send Notification
          </button>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">{user?.fullName?.charAt(0)}</span>
            </div>
            <div>
              <p className="text-white text-sm font-semibold">{user?.fullName}</p>
              <p className="text-white/50 text-xs">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-red-500/20 text-red-300 rounded-xl py-2 text-sm hover:bg-red-500/30 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        {children}
      </main>

      {/* Send Notification Modal */}
      {showNotify && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-blue-900">🔔 Send Notification</h2>
              <button
                onClick={() => setShowNotify(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>

            {sent ? (
              <div className="text-center py-8">
                <p className="text-5xl mb-4">✅</p>
                <p className="text-xl font-bold text-green-600">Notification Sent!</p>
                <p className="text-gray-500 text-sm mt-2">All users will receive the notification</p>
              </div>
            ) : (
              <>
                {/* Audience */}
                <div className="mb-4">
                  <label className="text-sm font-semibold text-blue-900 block mb-2">Send To</label>
                  <div className="flex gap-2">
                    {[
                      { key: 'all', label: '👥 All Users' },
                      { key: 'verified', label: '✅ Verified Only' },
                      { key: 'unverified', label: '⏳ Unverified Only' },
                    ].map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => setNotifyType(opt.key)}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold transition ${
                          notifyType === opt.key
                            ? 'bg-blue-800 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Templates */}
                <div className="mb-4">
                  <label className="text-sm font-semibold text-blue-900 block mb-2">Quick Templates</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { title: '🎉 New Ajo Group!', body: 'A new Ajo group is now available! Join now before spots fill up.' },
                      { title: '💰 Payment Reminder', body: 'Your Ajo contribution is due today. Please make your payment.' },
                      { title: '🛡️ Verify Your Account', body: 'Complete your KYC verification to unlock all OWODE features.' },
                      { title: '🎊 Special Announcement', body: 'We have exciting news for all OWODE users! Check the app now.' },
                    ].map((template, i) => (
                      <button
                        key={i}
                        onClick={() => { setNotifyTitle(template.title); setNotifyBody(template.body) }}
                        className="text-left bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl p-3 transition"
                      >
                        <p className="text-xs font-semibold text-gray-800">{template.title}</p>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{template.body}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div className="mb-4">
                  <label className="text-sm font-semibold text-blue-900 block mb-2">Title *</label>
                  <input
                    type="text"
                    value={notifyTitle}
                    onChange={e => setNotifyTitle(e.target.value)}
                    placeholder="e.g. New Ajo Group Available!"
                    className="w-full bg-gray-50 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={50}
                  />
                  <p className="text-xs text-gray-400 mt-1">{notifyTitle.length}/50</p>
                </div>

                {/* Body */}
                <div className="mb-6">
                  <label className="text-sm font-semibold text-blue-900 block mb-2">Message *</label>
                  <textarea
                    value={notifyBody}
                    onChange={e => setNotifyBody(e.target.value)}
                    placeholder="Enter your message to users..."
                    rows={3}
                    className="w-full bg-gray-50 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-400 mt-1">{notifyBody.length}/200</p>
                </div>

                {/* Preview */}
                {notifyTitle && notifyBody && (
                  <div className="bg-gray-900 rounded-2xl p-4 mb-6">
                    <p className="text-gray-400 text-xs mb-2">Preview</p>
                    <div className="bg-gray-800 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">O</span>
                        </div>
                        <span className="text-white text-xs font-semibold">OWODE Alajo</span>
                        <span className="text-gray-400 text-xs ml-auto">now</span>
                      </div>
                      <p className="text-white text-sm font-semibold">{notifyTitle}</p>
                      <p className="text-gray-300 text-xs mt-1">{notifyBody}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowNotify(false)}
                    className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendNotification}
                    disabled={sending || !notifyTitle || !notifyBody}
                    className="flex-1 bg-blue-800 text-white py-3 rounded-xl font-semibold hover:bg-blue-900 transition disabled:opacity-50"
                  >
                    {sending ? '⏳ Sending...' : '🔔 Send Now'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}