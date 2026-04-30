# AI 증명사진 스튜디오 (Photo Studio)

Next.js와 **Harness Engineering Architecture**를 기반으로 구축된 다목적 AI 프로필 사진 생성 서비스입니다.

## ✨ 주요 기능

- **다양한 사진 규격 지원**: 증명사진(2.5x3.5), 반명함(3x4), 여권(3.5x4.5), 인스타그램(1:1) 등 목적에 맞는 규격을 동적으로 지원합니다.
- **사용자 맞춤형 영역 크롭**: 프론트엔드에서 React-Easy-Crop을 이용해 사용자가 직접 원하는 영역을 지정할 수 있습니다.
- **Ollama 스타일의 극단적 미니멀리즘 UI**: 
  - 순백색 캔버스, 완벽한 무채색 계열(Pure Grayscale)
  - 그림자 제로(Zero Shadows)
  - 이분법적 모서리 곡률(대화형 요소는 9999px, 컨테이너는 12px)을 채택하여 본연의 기능에 집중할 수 있는 디자인입니다.
- **Harness 기반 동적 파이프라인**: 
  - 루트 디렉토리의 `.agent/harness.md`라는 선언적 마크다운 파일을 통해 에이전트(Agent)와 스킬(Skill)의 흐름을 조립합니다.
  - 화질 개선(`UpscaleSkill`), 초능력 효과(`SuperpowersSkill`), 배경 제거(`BackgroundRemovalSkill`), 자동 규격 리사이징 및 색상 변경(`FaceAlignmentSkill`)이 파이프라인 안에서 유기적으로 동작합니다.
- **자동 보관함 갤러리**: 완성된 사진은 브라우저의 `localStorage`에 자동 저장되어 언제든지 다시 조회하고 다운로드할 수 있습니다.

## 🛠️ 기술 스택

- **Frontend**: Next.js 16 (App Router), React, React-Easy-Crop
- **Backend (API Route)**: Node.js, Sharp (이미지 리사이징 및 보정), Remove.bg API
- **Architecture**: Custom Harness AI Framework (Agent-Workflow-Skill 구조)
- **Styling**: Vanilla CSS (Ollama-inspired Radical Minimalism)

## 🚀 실행 방법

### 1. 레포지토리 클론 및 패키지 설치
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. 환경 변수 설정
프로젝트 루트 디렉토리에 `.env.local` 파일을 생성하고 아래 API 키를 입력합니다.
(AI 배경 제거 기능인 BackgroundRemovalSkill 동작을 위해 필수입니다.)
```env
REMOVE_BG_API_KEY=당신의_REMOVE_BG_API_키
```

### 3. 개발 서버 실행
```bash
npm run dev
```
> **참고:** 현재 `package.json`의 dev 스크립트에 의해 기본적으로 **4005번 포트**에서 서버가 구동됩니다.

### 4. 접속
브라우저를 열고 [http://localhost:4005](http://localhost:4005) 에 접속하여 스튜디오를 확인하세요!

## 📂 프로젝트 핵심 아키텍처

- **`.agent/harness.md`**: 어플리케이션의 AI 워크플로우를 관장하는 텍스트 기반 시스템 설계도입니다.
- **`src/harness/`**: 에이전트, 스킬, 워크플로우 인터페이스 및 동적 로더(`HarnessLoader.ts`)를 포함한 백엔드 핵심 비즈니스 로직입니다.
- **`src/app/page.tsx`**: 미니멀리즘 디자인이 적용된 클라이언트 UI와 사진 편집기, 보관함 로직입니다.
- **`src/app/api/generate/route.ts`**: 프론트엔드의 폼 데이터를 받아 Harness 파이프라인으로 연결하는 핵심 브릿지 역할을 수행합니다.
