import { Skill, SkillContext } from "../core/Skill";
import sharp from "sharp";

export class UpscaleSkill extends Skill {
  name = "UpscaleSkill";
  description = "이미지의 화질을 고품질(Lanczos3) 보간법을 사용하여 2배로 업스케일링합니다.";

  async execute(imageBase64: string, context?: SkillContext): Promise<string> {
    console.log(`[Skill] 이미지 2배 업스케일링 진행 중...`);
    
    try {
      const imageBuffer = Buffer.from(imageBase64, 'base64');
      
      // 현재 이미지 메타데이터(크기) 가져오기
      const metadata = await sharp(imageBuffer).metadata();
      const currentWidth = metadata.width || 600;
      const currentHeight = metadata.height || 800;

      // 2배로 확대 (고품질 lanczos3 커널 사용)
      const processedBuffer = await sharp(imageBuffer)
        .resize({
          width: currentWidth * 2,
          height: currentHeight * 2,
          kernel: sharp.kernel.lanczos3, // 화질 저하를 최소화하는 고품질 리사이징 알고리즘
          fit: 'fill'
        })
        // 업스케일링 후 픽셀이 흐릿해지는 것을 방지하기 위해 언샤프 마스크(Unsharp Mask) 적용
        .sharpen({
          sigma: 1.5,
          m1: 0.5,
          m2: 1.5,
          x1: 2,
          y2: 10,
          y3: 20
        })
        .png()
        .toBuffer();

      console.log(`[Skill] 업스케일링 완료 (기존 해상도 대비 2배 확대됨)`);
      return processedBuffer.toString('base64');

    } catch (error) {
      console.error("[UpscaleSkill] 업스케일링 중 에러 발생:", error);
      throw error;
    }
  }
}
