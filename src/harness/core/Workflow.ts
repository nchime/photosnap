export abstract class Workflow {
  abstract name: string;
  
  /**
   * 여러 에이전트와 스킬을 오케스트레이션하여 최종 목적을 달성하는 워크플로우를 실행합니다.
   */
  abstract run(input: any): Promise<any>;
}
