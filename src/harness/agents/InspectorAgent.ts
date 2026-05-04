import { Agent } from "../core/Agent";

export class InspectorAgent extends Agent {
  name = "InspectorAgent";
  role = "생성된 이미지의 품질을 객관적으로 분석하고 개선 포인트를 리포트합니다.";

  constructor() {
    super();
  }

  async process(input: string | string[]): Promise<any> {
    console.log(`[Agent: ${this.name}] 비동기 품질 검수 프로세스 가동`);
    
    try {
      // 등록된 품질 검사 스킬 실행
      const results = await this.useSkill("QualityCheckSkill", input);
      
      // 실제 서비스라면 여기서 분석 결과를 DB에 저장하거나 
      // 품질이 낮을 경우 관리자에게 슬랙 알림을 보내는 등의 후처리를 할 수 있습니다.
      console.log(`[Agent: ${this.name}] 품질 검수 리포트 생성 완료:`, JSON.stringify(results, null, 2));
      
      return results;
    } catch (error) {
      console.error(`[Agent: ${this.name}] 검수 중 오류 발생:`, error);
      throw error;
    }
  }
}
