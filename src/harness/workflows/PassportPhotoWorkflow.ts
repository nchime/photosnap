import { Workflow } from "../core/Workflow";
import { PhotoEditorAgent } from "../agents/PhotoEditorAgent";

export class PassportPhotoWorkflow extends Workflow {
  name = "PassportPhotoGeneration";
  private editorAgent: PhotoEditorAgent;

  // 담당 에이전트를 외부(config)에서 주입받습니다.
  constructor(editorAgent: PhotoEditorAgent) {
    super();
    this.editorAgent = editorAgent;
  }

  async run(file: File | string): Promise<string> {
    console.log(`[Workflow: ${this.name}] 워크플로우 시작됨.`);
    
    let base64Image: string;
    
    if (typeof file === "string") {
      base64Image = file;
    } else {
      // Node.js File 객체를 ArrayBuffer로 변환 후 Base64로 인코딩
      const buffer = await file.arrayBuffer();
      base64Image = Buffer.from(buffer).toString("base64");
    }
    
    // 에이전트에게 Base64 이미지 전달하여 작업 지시
    const resultBase64 = await this.editorAgent.process({ imageBase64: base64Image });
    
    console.log(`[Workflow: ${this.name}] 워크플로우 완료.`);
    return resultBase64;
  }
}
