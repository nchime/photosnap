import { Agent } from "../core/Agent";
import { BackgroundRemovalSkill } from "../skills/BackgroundRemovalSkill";
import { FaceAlignmentSkill } from "../skills/FaceAlignmentSkill";

export class PhotoEditorAgent extends Agent {
  name = "PhotoEditorAgent";
  role = "사용자가 업로드한 원본 사진을 증명사진 규격으로 편집하고 최적화합니다.";

  // 의존성 주입(DI)을 지원하기 위해 생성자에서 스킬을 하드코딩하지 않습니다.
  // 스킬 등록은 .agent/harness.config.ts 에서 수행합니다.
  constructor() {
    super();
  }

  async process(input: { imageBase64: string }): Promise<string> {
    console.log(`[Agent: ${this.name}] 사진 처리 시작 (동적 파이프라인)`);
    
    try {
      let currentBase64 = input.imageBase64;
      
      // harness.md 에서 주입된 스킬 순서대로 파이프라인 실행
      for (const skill of this.skills.values()) {
        currentBase64 = await this.useSkill(skill.name, currentBase64);
      }
      
      console.log(`[Agent: ${this.name}] 사진 처리 완료`);
      
      // 프론트엔드에서 바로 렌더링할 수 있도록 Data URL 형태로 반환
      return `data:image/png;base64,${currentBase64}`;
    } catch (error) {
      console.error(`[Agent: ${this.name}] 처리 중 에러 발생:`, error);
      throw error;
    }
  }
}
