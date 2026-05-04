import fs from 'fs';
import path from 'path';

// 레지스트리 (이름으로 클래스를 매핑하기 위한 저장소)
import { PhotoEditorAgent } from '../agents/PhotoEditorAgent';
import { ProfileAgent } from '../agents/ProfileAgent';
import { BackgroundRemovalSkill } from '../skills/BackgroundRemovalSkill';
import { FaceAlignmentSkill } from '../skills/FaceAlignmentSkill';
import { UpscaleSkill } from '../skills/UpscaleSkill';
import { SuperpowersSkill } from '../skills/SuperpowersSkill';
import { GitCommitSkill } from '../skills/GitCommitSkill';
import { QualityCheckSkill } from '../skills/QualityCheckSkill';
import { PassportPhotoWorkflow } from '../workflows/PassportPhotoWorkflow';
import { SizeProfileWorkflow } from '../workflows/SizeProfileWorkflow';
import { InspectorAgent } from '../agents/InspectorAgent';

const Registry = {
  Agents: { PhotoEditorAgent, ProfileAgent, InspectorAgent },
  Skills: { BackgroundRemovalSkill, FaceAlignmentSkill, UpscaleSkill, SuperpowersSkill, GitCommitSkill, QualityCheckSkill },
  Workflows: { PassportPhotoWorkflow, SizeProfileWorkflow }
};

export class HarnessLoader {
  /**
   * .agent/harness.md 파일을 읽어 파싱한 뒤,
   * Agent에 Skill을 조립하고 Workflow에 Agent를 주입합니다.
   */
  static loadConfig() {
    const configPath = path.join(process.cwd(), '.agent', 'harness.md');
    const content = fs.readFileSync(configPath, 'utf-8');
    
    const agents: Record<string, any> = {};
    const workflows: Record<string, any> = {};
    
    let currentParsing: 'AGENT' | 'WORKFLOW' | null = null;
    let currentName = '';

    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // 1. Agent 블록 감지
      if (trimmed.startsWith('## Agent:')) {
        currentParsing = 'AGENT';
        currentName = trimmed.replace('## Agent:', '').trim();
        const AgentClass = Registry.Agents[currentName as keyof typeof Registry.Agents];
        if (AgentClass) {
          agents[currentName] = new AgentClass();
        }
        continue;
      }

      // 2. Workflow 블록 감지
      if (trimmed.startsWith('## Workflow:')) {
        currentParsing = 'WORKFLOW';
        currentName = trimmed.replace('## Workflow:', '').trim();
        continue;
      }

      // 3. Agent 하위의 Skill 목록 주입
      if (currentParsing === 'AGENT' && trimmed.startsWith('-')) {
        const skillName = trimmed.replace('-', '').trim();
        const SkillClass = Registry.Skills[skillName as keyof typeof Registry.Skills];
        if (SkillClass && agents[currentName]) {
          agents[currentName].registerSkill(new SkillClass());
        }
      }

      // 4. Workflow 하위의 Agent 의존성 주입
      if (currentParsing === 'WORKFLOW' && trimmed.startsWith('- Uses:')) {
        const agentName = trimmed.replace('- Uses:', '').trim();
        const WorkflowClass = Registry.Workflows[currentName as keyof typeof Registry.Workflows];
        if (WorkflowClass && agents[agentName]) {
          workflows[currentName] = new WorkflowClass(agents[agentName]);
        }
      }
    }

    return {
      agents,
      workflows,
      // API 라우트 등에서 쉽게 꺼내 쓸 수 있도록 메인 워크플로우 제공
      activeWorkflow: workflows['PassportPhotoWorkflow']
    };
  }
}
