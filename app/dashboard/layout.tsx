'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)

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

 const navItems = [
  { href: '/dashboard', label: 'Overview', icon: '📊' },
  { href: '/dashboard/users', label: 'Users', icon: '👥' },
  { href: '/dashboard/transactions', label: 'Transactions', icon: '💳' },
  { href: '/dashboard/ajo', label: 'Standard Ajo', icon: '🤝' },
  { href: '/dashboard/guaranteed', label: 'Guaranteed Ajo', icon: '🛡️' },
  { href: '/dashboard/agents', label: 'Agents', icon: '🧑‍💼' },
  { href: '/dashboard/kyc', label: 'KYC', icon: '📋' },
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

        <nav className="flex-1 p-4 space-y-1">
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
    </div>
  )
}