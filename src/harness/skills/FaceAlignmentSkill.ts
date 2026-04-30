import { Skill, SkillContext } from "../core/Skill";
import sharp from "sharp";

export class FaceAlignmentSkill extends Skill {
  name = "FaceAlignment";
  description = "사용자가 선택한 프로필 규격에 맞게 해상도와 비율을 조절하고 배경을 합성합니다.";

  async execute(imageBase64: string, context?: SkillContext): Promise<string> {
    const profileType = context?.profileType || 'passport_35x45';
    console.log(`[Skill] ${profileType} 규격 리사이징 및 배경 합성 진행 중...`);
    
    try {
      const imageBuffer = Buffer.from(imageBase64, 'base64');
      
      // 300 DPI 기준 1cm ≈ 118px
      let targetWidth = 600;
      let targetHeight = 800;
      let bgColor = { r: 218, g: 228, b: 242 }; // 기본 연한 파란색

      switch (profileType) {
        case 'id_25x35': // 증명사진 2.5 x 3.5
          targetWidth = 295;
          targetHeight = 413;
          break;
        case 'id_30x40': // 반명함 3 x 4
          targetWidth = 354;
          targetHeight = 472;
          break;
        case 'resident_35x45': // 주민등록증 3.5 x 4.5
          targetWidth = 413;
          targetHeight = 531;
          break;
        case 'passport_35x45': // 여권 3.5 x 4.5
          targetWidth = 413;
          targetHeight = 531;
          bgColor = { r: 255, g: 255, b: 255 }; // 여권은 흰색 배경 필수
          break;
        case 'instagram_1x1': // 인스타그램 1:1
          targetWidth = 1080;
          targetHeight = 1080;
          // 인스타그램은 트렌디한 그라데이션 느낌을 주거나 깔끔한 흰색 적용
          bgColor = { r: 245, g: 245, b: 245 }; 
          break;
      }

      // Sharp를 이용한 이미지 처리 파이프라인
      const processedBuffer = await sharp(imageBuffer)
        // 1. 투명한 배경을 규격에 맞는 배경색으로 채우기
        .flatten({ background: bgColor }) 
        // 2. 사용자가 이미 프론트엔드에서 비율을 맞췄으므로, 고정 해상도로 리사이징
        .resize({
          width: targetWidth,
          height: targetHeight,
          fit: 'cover'
        })
        .png() // 무손실 PNG 포맷으로 출력
        .toBuffer();

      console.log(`[Skill] ${profileType} 규격 변환 완료 (${targetWidth}x${targetHeight})`);
      return processedBuffer.toString('base64');

    } catch (error) {
      console.error("[FaceAlignmentSkill] 이미지 처리 중 에러 발생:", error);
      throw error;
    }
  }
}
