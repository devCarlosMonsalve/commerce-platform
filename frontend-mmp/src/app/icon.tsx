import { ImageResponse } from 'next/og';

export const size = {
  width: 512,
  height: 512,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0F172A 0%, #1D4ED8 100%)',
          color: '#FFFFFF',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: 320,
            height: 320,
            borderRadius: 72,
            background: 'rgba(255, 255, 255, 0.12)',
            border: '16px solid rgba(255, 255, 255, 0.16)',
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          <span style={{ fontSize: 132 }}>CP</span>
          <span style={{ marginTop: 18, fontSize: 44, letterSpacing: 12 }}>MMP</span>
        </div>
      </div>
    ),
    size,
  );
}
