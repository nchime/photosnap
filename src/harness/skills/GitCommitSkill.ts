import { Skill, SkillContext } from "../core/Skill";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export class GitCommitSkill extends Skill {
  name = "GitCommit";
  description = "파이프라인 실행 중 특정 시점에 자동 Git 백업 커밋을 수행합니다.";

  async execute(input: any, context?: SkillContext): Promise<any> {
    console.log(`[Skill] Git 자동 커밋 진행 중...`);
    try {
      // 전달받은 메시지가 있으면 사용, 없으면 기본 메시지 사용
      const commitMsg = context?.commitMessage || "chore: 자동 백업 커밋 (Harness Pipeline)";
      
      // Git 명령어 실행 (작업 디렉토리의 모든 변경사항 추가 후 커밋)
      try {
        await execAsync(`git add . && git commit -m "${commitMsg}"`);
        console.log(`[Skill] Git 커밋 완료: ${commitMsg}`);
      } catch (e: any) {
         // 변경사항이 없어서 나는 에러라면 무시
         if (e.stdout?.includes("nothing to commit") || e.stderr?.includes("nothing to commit")) {
             console.log(`[Skill] 변경사항이 없어 커밋을 건너뜁니다.`);
         } else {
             console.log(`[Skill] 커밋 실패 (변경사항이 없거나 Git이 초기화되지 않음)`);
         }
      }
      
      // 이 스킬은 이미지 데이터를 변환하지 않는 '사이드 이펙트' 스킬이므로,
      // 입력받은 데이터(base64 이미지 등)를 파이프라인의 다음 단계로 원본 그대로 전달합니다.
      return input;
    } catch (error) {
      console.error("[GitCommitSkill] 에러 발생:", error);
      // 에러가 발생해도 사진 변환 메인 흐름이 깨지지 않도록 입력값을 그대로 반환합니다.
      return input;
    }
  }
}
