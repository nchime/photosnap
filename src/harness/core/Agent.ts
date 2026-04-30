import { Skill, SkillContext } from "./Skill";

export abstract class Agent {
  abstract name: string;
  abstract role: string;
  protected skills: Map<string, Skill> = new Map();

  /**
   * 에이전트가 사용할 수 있는 스킬을 등록합니다.
   */
  registerSkill(skill: Skill) {
    this.skills.set(skill.name, skill);
  }

  /**
   * 등록된 스킬을 실행합니다.
   */
  async useSkill(skillName: string, input: any, context?: SkillContext): Promise<any> {
    const skill = this.skills.get(skillName);
    if (!skill) throw new Error(`Skill ${skillName} not found in agent ${this.name}`);
    
    console.log(`[Agent: ${this.name}] Executing skill: ${skillName}...`);
    return await skill.execute(input, context);
  }

  /**
   * 에이전트의 주 작업 프로세스를 정의합니다.
   */
  abstract process(input: any): Promise<any>;
}
