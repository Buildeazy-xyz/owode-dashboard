import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Join my Ajo group on OWODE Alajo'

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const clean = String(code || '').toUpperCase().slice(0, 6)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffffff',
          fontFamily: 'sans-serif'
        }}
      >
        <img
          src="https://owodeagent.com/owode-logo.png"
          width={640}
          height={180}
          style={{ objectFit: 'contain', marginBottom: 30 }}
        />

        <div style={{ display: 'flex', color: '#25427a', fontSize: 26, letterSpacing: 3, marginTop: 6 }}>
          YOU HAVE BEEN INVITED
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: '#eaf2ff',
            borderRadius: 26,
            padding: '26px 60px',
            marginTop: 40
          }}
        >
          <div style={{ display: 'flex', color: '#7c8aa5', fontSize: 20, letterSpacing: 4 }}>
            INVITE CODE
          </div>
          <div style={{ display: 'flex', color: '#25427a', fontSize: 82, fontWeight: 700, letterSpacing: 12, marginTop: 8 }}>
            {clean}
          </div>
        </div>

        <div style={{ display: 'flex', color: '#7c8aa5', fontSize: 24, marginTop: 40 }}>
          Tap to join the savings group
        </div>
      </div>
    ),
    size
  )
}
