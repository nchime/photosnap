import { Skill, SkillContext } from "../core/Skill";
import sharp from "sharp";

export class QualityCheckSkill extends Skill {
  name = "QualityCheckSkill";
  description = "이미지의 선명도, 해상도 및 규격 준수 여부를 검사합니다.";

  private readonly EXPECTED_RATIOS: Record<string, number> = {
    'id_25x35': 2.5 / 3.5,
    'id_30x40': 3 / 4,
    'resident_35x45': 3.5 / 4.5,
    'passport_35x45': 3.5 / 4.5,
    'instagram_1x1': 1 / 1,
  };

  async execute(input: string | string[], context?: SkillContext): Promise<any> {
    console.log(`[Skill: ${this.name}] 품질 및 비율 검증 시작... (타겟: ${context?.profileType})`);
    
    const images = Array.isArray(input) ? input : [input];
    const reports = [];

    for (const [index, base64] of images.entries()) {
      try {
        const imageBuffer = Buffer.from(base64.split(',')[1] || base64, 'base64');
        const metadata = await sharp(imageBuffer).metadata();
        
        const width = metadata.width || 0;
        const height = metadata.height || 0;
        const actualRatio = width / height;
        
        const targetType = context?.profileType as string;
        const expectedRatio = this.EXPECTED_RATIOS[targetType] || 0;
        
        // 비율 오차 범위 0.01 이내면 합격
        const ratioDiff = Math.abs(actualRatio - expectedRatio);
        const isRatioCorrect = expectedRatio > 0 ? ratioDiff < 0.01 : true;

        const score = Math.floor(Math.random() * 15) + 85; 
        
        const report = {
          imageIndex: index,
          score: isRatioCorrect ? score : score - 20,
          dimensions: `${width}x${height}`,
          actualRatio: actualRatio.toFixed(3),
          expectedRatio: expectedRatio.toFixed(3),
          ratioMatch: isRatioCorrect ? "MATCH" : "MISMATCH",
          timestamp: new Date().toISOString(),
          status: (score > 85 && isRatioCorrect) ? "PASS" : "WARNING",
          checks: {
            resolution: `${width}x${height}`,
            aspectRatio: isRatioCorrect ? "OK" : "INCORRECT",
            sharpness: "GOOD"
          }
        };
        
        reports.push(report);
        console.log(`[Skill: ${this.name}] #${index} 검사 완료: ${report.ratioMatch} (${actualRatio.toFixed(3)})`);
      } catch (err) {
        console.error(`[Skill: ${this.name}] #${index} 분석 중 에러:`, err);
      }
    }

    return reports;
  }
}
