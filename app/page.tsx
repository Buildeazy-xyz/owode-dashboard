'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminAPI } from '../lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [otpStep, setOtpStep] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [pendingUserId, setPendingUserId] = useState('')

  const handleLogin = async () => {
    if (!phone || !password) { setError('Phone and password are required'); return }
    try {
      setLoading(true)
      setError('')
      const response = await adminAPI.login(phone, password)

      // Admins receive a code by SMS before a token is issued.
      if (response.data.requiresOtp) {
        setPendingUserId(response.data.userId)
        setOtpStep(true)
        return
      }

      const { user, token } = response.data.data
      if (user.role !== 'ADMIN') {
        setError('Access denied — Admin only')
        return
      }
      localStorage.setItem('owode_admin_token', token)
      localStorage.setItem('owode_admin_user', JSON.stringify(user))
      router.push('/dashboard')
    } catch (error: any) {
      setError(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otpCode) { setError('Enter the code sent to your phone'); return }
    try {
      setLoading(true)
      setError('')
      const response = await adminAPI.verifyOtp(pendingUserId, otpCode)
      const { user, token } = response.data.data
      localStorage.setItem('owode_admin_token', token)
      localStorage.setItem('owode_admin_user', JSON.stringify(user))
      router.push('/dashboard')
    } catch (error: any) {
      setError(error.response?.data?.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
            <span className="text-white text-3xl font-bold">O</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-widest">OWODE</h1>
          <p className="text-amber-400 tracking-widest text-sm mt-1">ADMIN DASHBOARD</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-blue-900 mb-2">Welcome Back</h2>
          <p className="text-gray-500 text-sm mb-6">Sign in to manage your platform</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          {otpStep ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-blue-900 block mb-2">Verification Code</label>
                <p className="text-gray-500 text-sm mb-3">We sent a 6-digit code to your phone.</p>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/\\D/g, ''))}
                  onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
                  className="w-full bg-gray-50 rounded-xl p-4 text-gray-800 text-center text-2xl tracking-[0.4em] outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full bg-blue-800 text-white rounded-xl p-4 font-bold text-lg hover:bg-blue-900 transition disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify →'}
              </button>
              <button
                onClick={() => { setOtpStep(false); setOtpCode(''); setError('') }}
                className="w-full text-gray-500 text-sm py-2 hover:text-gray-700"
              >
                Back to login
              </button>
            </div>
          ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-blue-900 block mb-2">Phone Number</label>
              <input
                type="tel"
                placeholder="08012345678"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-gray-50 rounded-xl p-4 text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              
              <label className="text-sm font-semibold text-blue-900 block mb-2">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full bg-gray-50 rounded-xl p-4 text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-blue-800 text-white rounded-xl p-4 font-bold text-lg hover:bg-blue-900 transition disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </div>
          )}
        </div>

        <p className="text-center text-blue-300 text-sm mt-6">
          🔒 OWODE Digital Services Limited — Admin Portal
        </p>
      </div>
    </div>
  )
}