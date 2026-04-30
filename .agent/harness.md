# Harness Agentic Configuration

이 파일은 Markdown 형식으로 작성된 시스템 선언(Declarative Configuration) 파일입니다.
시스템 시작 시 이 문서를 파싱하여 의존성을 조립하고 에이전트와 워크플로우를 초기화합니다.

## Agent: PhotoEditorAgent
- UpscaleSkill
- BackgroundRemovalSkill
- FaceAlignmentSkill

## Workflow: PassportPhotoWorkflow
- Uses: PhotoEditorAgent

---

## Agent: ProfileAgent
- UpscaleSkill
- SuperpowersSkill
- BackgroundRemovalSkill
- FaceAlignmentSkill

## Workflow: SizeProfileWorkflow
- Uses: ProfileAgent
