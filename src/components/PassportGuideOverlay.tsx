"use client";

interface PassportGuideOverlayProps {
  visible: boolean;
  profileType?: string;
}

export default function PassportGuideOverlay({ visible, profileType }: PassportGuideOverlayProps) {
  if (!visible || profileType !== 'passport_35x45') return null;

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      zIndex: 10,
    }}>
      {/* 얼굴 윤곽선 SVG */}
      <svg
        viewBox="0 0 100 130"
        style={{
          position: 'absolute',
          top: '6%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '50%',
          height: '82%',
        }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* 얼굴 윤곽선 */}
        <path
          d="M 50 5 
             C 25 5, 10 25, 10 50 
             C 10 70, 15 85, 25 100 
             C 35 115, 45 125, 50 125 
             C 55 125, 65 115, 75 100 
             C 85 85, 90 70, 90 50 
             C 90 25, 75 5, 50 5 Z"
          fill="none"
          stroke="rgba(255, 255, 255, 0.85)"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />

        {/* 정중앙 세로선 (빨간색) */}
        <line
          x1="50" y1="0"
          x2="50" y2="130"
          stroke="rgba(239, 68, 68, 0.8)"
          strokeWidth="1"
        />
      </svg>

      {/* 가이드 라벨 */}
      <div style={{
        position: 'absolute',
        top: '2%',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '11px',
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: 500,
        whiteSpace: 'nowrap',
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
      }}>
        얼굴 윤곽 가이드
      </div>
    </div>
  );
}
