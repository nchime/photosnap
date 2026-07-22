"use client";

interface GuideConfig {
  viewBox: string;
  face: { cx: number; cy: number; rx: number; ry: number };
  eyeY: number;
  headTopY: number;
  chinY: number;
  sideMarginX: number;
  label: string;
  sublabel: string;
}

const GUIDE_CONFIGS: Record<string, GuideConfig> = {
  id_25x35: {
    viewBox: '0 0 100 140',
    face: { cx: 50, cy: 58, rx: 26, ry: 38 },
    eyeY: 44,
    headTopY: 18,
    chinY: 100,
    sideMarginX: 8,
    label: '증명사진',
    sublabel: '2.5 × 3.5 cm',
  },
  id_30x40: {
    viewBox: '0 0 100 133',
    face: { cx: 50, cy: 55, rx: 25, ry: 36 },
    eyeY: 42,
    headTopY: 17,
    chinY: 95,
    sideMarginX: 8,
    label: '반명함',
    sublabel: '3 × 4 cm',
  },
  resident_35x45: {
    viewBox: '0 0 100 129',
    face: { cx: 50, cy: 57, rx: 25, ry: 36 },
    eyeY: 43,
    headTopY: 19,
    chinY: 97,
    sideMarginX: 8,
    label: '주민등록증',
    sublabel: '3.5 × 4.5 cm',
  },
  passport_35x45: {
    viewBox: '0 0 100 129',
    face: { cx: 50, cy: 67, rx: 33, ry: 48 },
    eyeY: 57,
    headTopY: 18,
    chinY: 115,
    sideMarginX: 8,
    label: '여권',
    sublabel: '3.5 × 4.5 cm',
  },
};

export default function PassportGuideOverlay({ visible, profileType }: { visible: boolean; profileType?: string }) {
  if (!visible) return null;

  const key = profileType || 'passport_35x45';
  const cfg = GUIDE_CONFIGS[key];
  if (!cfg) return null;

  const { viewBox, face, eyeY, headTopY, chinY, sideMarginX, label, sublabel } = cfg;

  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      pointerEvents: 'none',
      zIndex: 10,
    }}>
      <svg
        viewBox={viewBox}
        style={{
          position: 'absolute',
          top: 0, left: 0, width: '100%', height: '100%',
        }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* 머리-턱 여백선 */}
        <line
          x1={sideMarginX} y1={headTopY}
          x2={100 - sideMarginX} y2={headTopY}
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth="1"
          strokeDasharray="3 2"
        />
        <line
          x1={sideMarginX} y1={chinY}
          x2={100 - sideMarginX} y2={chinY}
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth="1"
          strokeDasharray="3 2"
        />

        {/* 얼굴 윤곽 타원 */}
        <ellipse
          cx={face.cx} cy={face.cy}
          rx={face.rx} ry={face.ry}
          fill="none"
          stroke="rgba(255, 255, 255, 0.85)"
          strokeWidth="1.5"
          strokeDasharray="5 3"
        />

        {/* 눈높이 기준선 */}
        <line
          x1={face.cx - face.rx + 4} y1={eyeY}
          x2={face.cx + face.rx - 4} y2={eyeY}
          stroke="rgba(239, 68, 68, 0.8)"
          strokeWidth="1.5"
        />
        <circle cx={face.cx - face.rx * 0.35} cy={eyeY} r="1.5" fill="rgba(239, 68, 68, 0.9)" />
        <circle cx={face.cx + face.rx * 0.35} cy={eyeY} r="1.5" fill="rgba(239, 68, 68, 0.9)" />

        {/* 중앙 세로선 */}
        <line
          x1="50" y1="4"
          x2="50" y2={parseInt(viewBox.split(' ')[3]) - 4}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="0.5"
          strokeDasharray="2 3"
        />

        {/* 측면 여백선 */}
        <line
          x1={sideMarginX} y1={face.cy - face.ry * 0.4}
          x2={sideMarginX} y2={face.cy + face.ry * 0.4}
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth="1"
          strokeDasharray="3 2"
        />
        <line
          x1={100 - sideMarginX} y1={face.cy - face.ry * 0.4}
          x2={100 - sideMarginX} y2={face.cy + face.ry * 0.4}
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth="1"
          strokeDasharray="3 2"
        />

        {/* 상단 라벨 */}
        <text
          x="50" y="6"
          textAnchor="middle"
          fill="rgba(255, 255, 255, 0.9)"
          fontSize="4.5"
          fontWeight="600"
          style={{ textShadow: '0 1px 1px rgba(0,0,0,0.5)' }}
        >
          {label} | {sublabel}
        </text>

        {/* 범례 */}
        <g transform={`translate(${100 - 34}, ${parseInt(viewBox.split(' ')[3]) - 20})`}>
          <rect x="0" y="0" width="30" height="16" rx="2" fill="rgba(0,0,0,0.35)" />
          <line x1="4" y1="4" x2="10" y2="4" stroke="rgba(255,255,255,0.85)" strokeWidth="1" strokeDasharray="2 1.5" />
          <text x="12" y="5" fill="rgba(255,255,255,0.75)" fontSize="2.5">얼굴</text>
          <line x1="4" y1="11" x2="10" y2="11" stroke="rgba(239,68,68,0.8)" strokeWidth="1" />
          <text x="12" y="12.5" fill="rgba(255,255,255,0.75)" fontSize="2.5">눈높이</text>
        </g>
      </svg>
    </div>
  );
}
