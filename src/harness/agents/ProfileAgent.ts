import { Agent } from "../core/Agent";

export class ProfileAgent extends Agent {
  name = "ProfileAgent";
  role = "다양한 규격(증명, 반명함, 여권, 인스타그램)에 맞춰 사진을 동적으로 생성하고 관리합니다.";

  constructor() {
    super();
  }

  // 추후 프론트엔드에서 넘어온 profileType(규격)에 따라
  // 스킬(Skill)들에게 비율, 해상도, 얼굴 크기 제한 등의 Context를 동적으로 주입할 뼈대입니다.
  async process(input: { imageBase64: string; targetProfileType: string }): Promise<string> {
    console.log(`[Agent: ${this.name}] ${input.targetProfileType} 규격으로 사진 처리 시작`);
    
    try {
      let currentBase64 = input.imageBase64;
      
      // 스킬들에게 전달할 추가 정보(Context) 정의
      // 예: 여권 사진일 경우 { faceRatio: '3.2-3.6', bgColor: 'white' } 등
      const context = {
        profileType: input.targetProfileType
      };

      // 등록된 스킬 파이프라인을 실행하며 Context를 함께 넘겨줍니다.
      for (const skill of this.skills.values()) {
        currentBase64 = await this.useSkill(skill.name, currentBase64, context);
      }
      
      console.log(`[Agent: ${this.name}] 사진 처리 완료`);
      return `data:image/png;base64,${currentBase64}`;
    } catch (error) {
      console.error(`[Agent: ${this.name}] 처리 중 에러 발생:`, error);
      throw error;
    }
  }
}
