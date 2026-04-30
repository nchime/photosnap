export interface SkillContext {
  [key: string]: any;
}

export abstract class Skill {
  abstract name: string;
  abstract description: string;

  /**
   * 스킬이 실행할 실제 로직을 구현합니다.
   * @param input 스킬 실행에 필요한 입력 데이터
   * @param context 추가적인 맥락 데이터 (옵션)
   */
  abstract execute(input: any, context?: SkillContext): Promise<any>;
}
