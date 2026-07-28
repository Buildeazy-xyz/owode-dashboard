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
          background: '#0d2149',
          fontFamily: 'sans-serif',
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', position: 'absolute', top: 0, left: 0, width: 14, height: '100%', background: '#f5a623' }} />

        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center', paddingLeft: 96 }}>
          <div style={{ display: 'flex', color: '#f5a623', fontSize: 22, letterSpacing: 8, marginBottom: 18 }}>
            YOU HAVE BEEN INVITED
          </div>

          <div style={{ display: 'flex', color: '#ffffff', fontSize: 92, fontWeight: 800, letterSpacing: -2, lineHeight: 1 }}>
            OWODE
          </div>
          <div style={{ display: 'flex', color: 'rgba(255,255,255,0.55)', fontSize: 28, letterSpacing: 11, marginTop: 10 }}>
            ALAJO AGBAYE
          </div>

          <div style={{ display: 'flex', width: 90, height: 4, background: '#f5a623', marginTop: 34, marginBottom: 34 }} />

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', color: 'rgba(255,255,255,0.45)', fontSize: 17, letterSpacing: 5, marginBottom: 8 }}>
                INVITE CODE
              </div>
              <div style={{ display: 'flex', color: '#ffffff', fontSize: 76, fontWeight: 700, letterSpacing: 14, lineHeight: 1 }}>
                {clean}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', color: 'rgba(255,255,255,0.5)', fontSize: 21, marginTop: 34 }}>
            Tap to join the savings group
          </div>
        </div>

        <div style={{ display: 'flex', width: 470, alignItems: 'center', justifyContent: 'center' }}>
          <img src="https://owodeagent.com/owode-shield.png" width={360} height={360} style={{ objectFit: 'contain' }} />
        </div>
      </div>
    ),
    size
  )
}
