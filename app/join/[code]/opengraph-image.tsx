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
          background: 'linear-gradient(135deg, #0f2340 0%, #25427a 60%, #385c9e 100%)',
          fontFamily: 'sans-serif'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 110,
            height: 110,
            borderRadius: 999,
            background: '#f5a623',
            color: '#ffffff',
            fontSize: 62,
            fontWeight: 700,
            marginBottom: 26
          }}
        >
          O
        </div>

        <div style={{ display: 'flex', color: '#ffffff', fontSize: 54, fontWeight: 700, letterSpacing: 6 }}>
          OWODE ALAJO
        </div>

        <div style={{ display: 'flex', color: '#f5a623', fontSize: 26, letterSpacing: 3, marginTop: 6 }}>
          YOU HAVE BEEN INVITED
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.10)',
            borderRadius: 26,
            padding: '26px 60px',
            marginTop: 40
          }}
        >
          <div style={{ display: 'flex', color: 'rgba(255,255,255,0.65)', fontSize: 20, letterSpacing: 4 }}>
            INVITE CODE
          </div>
          <div style={{ display: 'flex', color: '#ffffff', fontSize: 82, fontWeight: 700, letterSpacing: 12, marginTop: 8 }}>
            {clean}
          </div>
        </div>

        <div style={{ display: 'flex', color: 'rgba(255,255,255,0.7)', fontSize: 24, marginTop: 40 }}>
          Tap to join the savings group
        </div>
      </div>
    ),
    size
  )
}
