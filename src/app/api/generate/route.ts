import { NextResponse } from 'next/server';
import { HarnessLoader } from '@/harness/core/HarnessLoader';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: '파일이 제공되지 않았습니다.' }, { status: 400 });
    }

    const profileType = formData.get('profileType') as string || 'passport_35x45';
    const useAI = formData.get('useAI') === 'true';
    const geminiKey = formData.get('geminiKey') as string;

    // 1. .agent/harness.md 파일을 파싱하여 런타임에 동적으로 시스템 조립
    const config = HarnessLoader.loadConfig();
    const workflow = config.workflows['SizeProfileWorkflow'];
    
    // 2. 워크플로우 실행 (에이전트 -> 스킬 순으로 자동 오케스트레이션)
    const resultUrls = await workflow.run({ file, profileType, useAI, geminiKey });

    // 3. 비동기 이벤트 트리거: 생성된 사진 품질 검수 (브라우저 대기 없이 백그라운드 실행)
    const inspector = config.agents['InspectorAgent'];
    if (inspector) {
      // await을 생략하여 비동기로 실행 (로그 분석용, 컨텍스트 전달)
      inspector.process(resultUrls, { profileType }).catch((err: any) => 
        console.error('[Async Trigger] InspectorAgent failed:', err)
      );
    }

    // 4. 결과 반환
    return NextResponse.json({ success: true, resultUrls });
    
  } catch (error) {
    console.error('Workflow error:', error);
    const message = error instanceof Error ? error.message : '서버 내부 오류가 발생했습니다.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
