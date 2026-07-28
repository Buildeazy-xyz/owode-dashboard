import type { Metadata } from 'next'

type Props = { params: Promise<{ code: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params
  const clean = String(code || '').toUpperCase().slice(0, 6)
  const title = 'Join my Ajo group on OWODE Alajo'
  const description = 'Invite code ' + clean + '. Tap to join the savings group.'
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: 'https://owodeagent.com/join/' + clean,
      siteName: 'OWODE Alajo',
      type: 'website',
      images: [{ url: 'https://owodeagent.com/og-invite.png', width: 1200, height: 630, alt: title }]
    },
    twitter: { card: 'summary_large_image', title, description, images: ['https://owodeagent.com/og-invite.png'] }
  }
}

export default async function JoinPage({ params }: Props) {
  const { code } = await params
  const clean = String(code || '').toUpperCase().slice(0, 6)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-3xl font-bold">O</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-widest">OWODE</h1>
        <p className="text-amber-400 tracking-widest text-sm mt-1 mb-8">ALAJO AGBAYE</p>

        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-blue-900 mb-2">You have been invited</h2>
          <p className="text-gray-500 text-sm mb-6">Someone has invited you to join their Ajo savings group.</p>

          <div className="bg-blue-50 rounded-2xl p-5 mb-6">
            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Invite code</p>
            <p className="text-3xl font-bold text-blue-900 tracking-widest">{clean}</p>
          </div>

          <a href="https://play.google.com/store/apps/details?id=com.owode.alajo.app" className="block w-full bg-blue-800 text-white rounded-xl p-4 font-bold">Get OWODE Alajo</a>

          <p className="text-gray-400 text-xs mt-5 leading-relaxed">
            Already have the app? Open it, go to Ajo, tap the invite code bar and enter <span className="font-bold text-gray-600">{clean}</span>.
          </p>
        </div>

        <p className="text-blue-300 text-xs mt-6 leading-relaxed px-4">
          Standard Ajo groups are between people who know each other. If a member fails to contribute, OWODE does not cover it.
        </p>
      </div>
    </div>
  )
}
