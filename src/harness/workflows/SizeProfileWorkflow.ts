import { Workflow } from "../core/Workflow";
import { ProfileAgent } from "../agents/ProfileAgent";

type ProfileType = 'id_25x35' | 'id_30x40' | 'resident_35x45' | 'passport_35x45' | 'instagram_1x1';

export class SizeProfileWorkflow extends Workflow {
  name = "SizeProfileGeneration";
  private profileAgent: ProfileAgent;

  constructor(profileAgent: ProfileAgent) {
    super();
    this.profileAgent = profileAgent;
  }

  // 파일과 함께 사용자가 선택한 사진 규격(profileType)을 입력받습니다.
  async run(input: { file: File | string, profileType: ProfileType }): Promise<string> {
    console.log(`[Workflow: ${this.name}] ${input.profileType} 워크플로우 시작됨.`);
    
    let base64Image: string;
    
    if (typeof input.file === "string") {
      base64Image = input.file;
    } else {
      const buffer = await input.file.arrayBuffer();
      base64Image = Buffer.from(buffer).toString("base64");
    }
    
    // 에이전트에게 원본 이미지와 목표 규격을 함께 전달하여 지시합니다.
    const resultBase64 = await this.profileAgent.process({ 
      imageBase64: base64Image,
      targetProfileType: input.profileType
    });
    
    console.log(`[Workflow: ${this.name}] 워크플로우 완료.`);
    return resultBase64;
  }
}
