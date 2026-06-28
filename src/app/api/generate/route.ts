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

    const config = HarnessLoader.loadConfig();
    const workflow = config.workflows['SizeProfileWorkflow'];
    
    const resultUrls = await workflow.run({ file, profileType, useAI, geminiKey });

    const inspector = config.agents['InspectorAgent'];
    if (inspector) {
      inspector.process(resultUrls, { profileType }).catch((err: any) => 
        console.error('[Async Trigger] InspectorAgent failed:', err)
      );
    }

    return NextResponse.json({ success: true, resultUrls });
    
  } catch (error) {
    console.error('Workflow error:', error);
    const message = error instanceof Error ? error.message : '서버 내부 오류가 발생했습니다.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
