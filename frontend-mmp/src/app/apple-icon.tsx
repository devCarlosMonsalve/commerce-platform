import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0F172A',
          color: '#FFFFFF',
          fontFamily: 'sans-serif',
          borderRadius: 42,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: 128,
            height: 128,
            borderRadius: 32,
            background: 'rgba(255, 255, 255, 0.12)',
            border: '6px solid rgba(255, 255, 255, 0.16)',
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          <span style={{ fontSize: 52 }}>CP</span>
          <span style={{ marginTop: 8, fontSize: 18, letterSpacing: 5 }}>MMP</span>
        </div>
      </div>
    ),
    size,
  );
}
