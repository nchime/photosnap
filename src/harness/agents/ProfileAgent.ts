import { Agent } from "../core/Agent";

export class ProfileAgent extends Agent {
  name = "ProfileAgent";
  role = "다양한 규격(증명, 반명함, 여권, 인스타그램)에 맞춰 사진을 동적으로 생성하고 관리합니다.";

  constructor() {
    super();
  }

  // 추후 프론트엔드에서 넘어온 profileType(규격)에 따라
  // 스킬(Skill)들에게 비율, 해상도, 얼굴 크기 제한 등의 Context를 동적으로 주입할 뼈대입니다.
  async process(input: { imageBase64: string; targetProfileType: string; useAI?: boolean; geminiKey?: string }): Promise<string | string[]> {
    console.log(`[Agent: ${this.name}] ${input.targetProfileType} 규격으로 사진 처리 시작 (AI: ${input.useAI})`);
    
    try {
      let currentBase64 = input.imageBase64;
      
      // 스킬들에게 전달할 추가 정보(Context) 정의
      const context = {
        profileType: input.targetProfileType,
        useAI: input.useAI,
        geminiKey: input.geminiKey
      };

      // AI 보정(SuperpowersSkill)이 필요한 경우 특별 처리
      if (input.useAI && this.skills.has("SuperpowersSkill")) {
        const superpowerSkill = this.skills.get("SuperpowersSkill")!;
        const results = await superpowerSkill.execute(currentBase64, context);
        
        // SuperpowersSkill이 여러 결과를 반환하면 (예: 오리지널, 정장, 캐주얼)
        if (Array.isArray(results)) {
           return results.map(img => img.startsWith('data:image') ? img : `data:image/png;base64,${img}`);
        }
        currentBase64 = results;
      }

      // 나머지 스킬 실행 제어
      for (const skill of this.skills.values()) {
        if (skill.name === "SuperpowersSkill") continue; // 이미 위에서 처리됨
        
        // AI 미사용(원본 그대로 생성) 시에는 배경 제거 및 업스케일링 등을 건너뜁니다.
        // 리사이징(FaceAlignment)만 수행하여 원본 느낌을 유지합니다.
        if (!input.useAI && (skill.name === "BackgroundRemoval" || skill.name === "UpscaleSkill")) {
          console.log(`[Agent: ${this.name}] '원본 그대로 생성' 모드이므로 ${skill.name} 건너뜀`);
          continue;
        }

        currentBase64 = await this.useSkill(skill.name, currentBase64, context);
      }
      
      console.log(`[Agent: ${this.name}] 사진 처리 완료`);
      return currentBase64.startsWith('data:image') ? currentBase64 : `data:image/png;base64,${currentBase64}`;
    } catch (error) {
      console.error(`[Agent: ${this.name}] 처리 중 에러 발생:`, error);
      throw error;
    }
  }
}
