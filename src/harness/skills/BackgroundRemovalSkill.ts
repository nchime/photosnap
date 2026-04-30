import { Skill, SkillContext } from "../core/Skill";

export class BackgroundRemovalSkill extends Skill {
  name = "BackgroundRemoval";
  description = "이미지의 배경을 AI를 사용하여 제거합니다.";

  async execute(imageBase64: string, context?: SkillContext): Promise<string> {
    console.log(`[Skill] 배경 제거 API 연동 진행 중...`);
    
    // 환경 변수에서 remove.bg API Key 가져오기
    const apiKey = process.env.REMOVE_BG_API_KEY;
    
    if (!apiKey) {
      console.warn("[BackgroundRemovalSkill] REMOVE_BG_API_KEY가 설정되지 않았습니다. 원본 이미지를 그대로 반환합니다 (Mocking).");
      // 네트워크 통신을 모방하기 위한 지연
      await new Promise(resolve => setTimeout(resolve, 1500));
      return imageBase64;
    }

    try {
      console.log("[BackgroundRemovalSkill] Remove.bg API를 호출합니다.");
      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          image_file_b64: imageBase64,
          size: 'auto'
        })
      });

      if (!response.ok) {
        throw new Error(`Remove.bg API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.data.result_b64;
    } catch (error) {
      console.error("[BackgroundRemovalSkill] 에러 발생:", error);
      throw error;
    }
  }
}
