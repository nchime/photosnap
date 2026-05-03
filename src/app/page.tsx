"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/utils/cropImage';
import "./globals.css";

interface SavedPhoto {
  id: string;
  url: string;
  createdAt: number;
}

type ProfileType = 'id_25x35' | 'id_30x40' | 'resident_35x45' | 'passport_35x45' | 'instagram_1x1';

const PROFILE_CONFIGS = {
  'id_25x35': { label: '증명사진 (2.5x3.5)', aspect: 2.5 / 3.5 },
  'id_30x40': { label: '반명함 (3x4)', aspect: 3 / 4 },
  'resident_35x45': { label: '주민등록증 (3.5x4.5)', aspect: 3.5 / 4.5 },
  'passport_35x45': { label: '여권 (3.5x4.5)', aspect: 3.5 / 4.5 },
  'instagram_1x1': { label: '인스타그램 (1:1)', aspect: 1 / 1 },
};

export default function Home() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resultImages, setResultImages] = useState<string[]>([]);
  const [savedPhotos, setSavedPhotos] = useState<SavedPhoto[]>([]);
  const [profileType, setProfileType] = useState<ProfileType>('passport_35x45');
  const [isDragging, setIsDragging] = useState(false);
  
  // AI 관련 상태
  const [geminiKey, setGeminiKey] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [showOptionDialog, setShowOptionDialog] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedPhotos = localStorage.getItem("passport_photos");
    if (storedPhotos) {
      try {
        setSavedPhotos(JSON.parse(storedPhotos));
      } catch (e) {
        console.error("Failed to parse saved photos", e);
      }
    }
    const storedKey = localStorage.getItem("gemini_api_key");
    if (storedKey) {
      setGeminiKey(storedKey);
    }
  }, []);

  const processFile = (file: File) => {
    setImageSrc(URL.createObjectURL(file));
    setResultImages([]);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      processFile(selected);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const selected = e.dataTransfer.files?.[0];
    if (selected && (selected.type === "image/jpeg" || selected.type === "image/png")) {
      processFile(selected);
    } else if (selected) {
      alert("JPG 또는 PNG 이미지만 업로드 가능합니다.");
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handlePreGenerateClick = () => {
    if (!imageSrc || !croppedAreaPixels) {
      alert("먼저 사진을 업로드해주세요.");
      return;
    }
    setShowOptionDialog(true);
  };

  const proceedGenerate = async (useAI: boolean) => {
    setShowOptionDialog(false);
    
    // AI 옵션 선택 시 키가 없으면 설정창 오픈
    if (useAI && !geminiKey) {
      setShowSettings(true);
      return;
    }

    setIsLoading(true);
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedBlob) throw new Error("크롭 이미지 생성 실패");

      const file = new File([croppedBlob], "cropped.jpg", { type: "image/jpeg" });
      const formData = new FormData();
      formData.append("file", file);
      formData.append("profileType", profileType);
      formData.append("useAI", useAI ? "true" : "false");
      if (useAI) {
        formData.append("geminiKey", geminiKey);
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("서버 오류가 발생했습니다.");
      }

      const data = await response.json();
      if (data.success && data.resultUrls) {
        setResultImages(data.resultUrls);
        setImageSrc(null);
        
        // 보관함에는 첫 번째 사진(또는 모든 사진) 저장
        const newPhotos: SavedPhoto[] = data.resultUrls.map((url: string, index: number) => ({
          id: `${Date.now()}_${index}`,
          url: url,
          createdAt: Date.now(),
        }));
        const newSavedPhotos = [...newPhotos, ...savedPhotos];
        setSavedPhotos(newSavedPhotos);
        localStorage.setItem("passport_photos", JSON.stringify(newSavedPhotos));
      } else {
        alert(data.error || "결과를 받아오는데 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("변환 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePhoto = (id: string) => {
    if (confirm("정말 이 사진을 보관함에서 삭제하시겠습니까?")) {
      const newSavedPhotos = savedPhotos.filter(p => p.id !== id);
      setSavedPhotos(newSavedPhotos);
      localStorage.setItem("passport_photos", JSON.stringify(newSavedPhotos));
    }
  };

  const handleReset = () => {
    setImageSrc(null);
    setResultImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const saveSettings = async () => {
    if (!geminiKey.trim()) {
      setSettingsError("API 키를 입력해주세요.");
      return;
    }

    setIsValidating(true);
    setSettingsError(null);

    try {
      // Gemini API 키 유효성 검사를 위해 간단한 모델 목록 조회 API 호출
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`);
      
      if (response.ok) {
        localStorage.setItem("gemini_api_key", geminiKey);
        setShowSettings(false);
      } else {
        const data = await response.json();
        const errorMessage = data.error?.message || "유효하지 않은 API 키입니다.";
        setSettingsError(`검증 실패: ${errorMessage}`);
      }
    } catch (error) {
      console.error("API Key validation error:", error);
      setSettingsError("연결 오류가 발생했습니다. 네트워크 상태를 확인해주세요.");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <main className="main-content">
      <div className="container">
        <div className="panel" style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          
          <h1 className="heading-display" style={{ marginBottom: '24px' }}>
            Photo Studio
          </h1>
          <p className="text-body-large" style={{ marginBottom: '40px' }}>
            원하는 규격과 영역을 선택해 완벽한 증명사진을 만드세요.
          </p>

          {!resultImages.length && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '48px' }}>
              {(Object.keys(PROFILE_CONFIGS) as ProfileType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setProfileType(type)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '9999px',
                    border: 'none',
                    background: profileType === type ? 'var(--light-gray)' : 'transparent',
                    color: profileType === type ? 'var(--near-black)' : 'var(--stone)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 400,
                  }}
                >
                  {PROFILE_CONFIGS[type].label}
                </button>
              ))}
            </div>
          )}
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/jpeg, image/png" 
            style={{ display: 'none' }} 
          />

          {!imageSrc && !resultImages.length && (
            <div 
              className="upload-zone" 
              onClick={handleUploadClick}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                borderColor: isDragging ? 'var(--black)' : 'var(--silver)',
                backgroundColor: isDragging ? 'var(--light-gray)' : 'var(--snow)',
              }}
            >
              <h3 className="heading-card" style={{ marginBottom: '8px', fontWeight: 500 }}>
                사진 업로드
              </h3>
              <p className="text-body" style={{ color: 'var(--stone)' }}>
                클릭하거나 사진을 드래그하여 놓으세요 (JPG, PNG)
              </p>
            </div>
          )}

          {imageSrc && !resultImages.length && (
            <div style={{ marginBottom: '48px', textAlign: 'left' }}>
              {/* Top Bar: Action Buttons aligned to right */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginBottom: '16px' }}>
                <button 
                  className="btn-secondary" 
                  onClick={handleReset}
                  style={{ padding: '8px 16px', fontSize: '14px' }}
                >
                  취소
                </button>
                <button 
                  className="btn-white" 
                  onClick={() => setShowSettings(true)}
                  style={{ padding: '8px 16px', fontSize: '14px' }}
                >
                  설정
                </button>
              </div>

              {/* Cropper Area */}
              <div style={{ position: 'relative', width: '100%', height: '480px', backgroundColor: 'var(--snow)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--light-gray)' }}>
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={PROFILE_CONFIGS[profileType].aspect}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  showGrid={true}
                  style={{ containerStyle: { background: 'var(--snow)' } }}
                />
              </div>
              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <label className="text-body" style={{ marginBottom: '8px', fontSize: '14px' }}>확대/축소</label>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  style={{ width: '60%', cursor: 'pointer', accentColor: 'var(--black)' }}
                />
              </div>
            </div>
          )}

          {resultImages.length > 0 && (
            <div style={{ marginBottom: '48px' }}>
              <h3 className="heading-card" style={{ marginBottom: '24px', fontWeight: 500 }}>
                {PROFILE_CONFIGS[profileType].label} AI 변환 완료
              </h3>
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: resultImages.length > 1 ? 'repeat(auto-fit, minmax(200px, 1fr))' : '1fr',
                gap: '24px',
                justifyContent: 'center'
              }}>
                {resultImages.map((url, idx) => (
                  <div key={idx} style={{ textAlign: 'center' }}>
                    <div style={{ 
                      position: 'relative', 
                      width: '100%', 
                      aspectRatio: PROFILE_CONFIGS[profileType].aspect.toString(), 
                      borderRadius: '12px', 
                      overflow: 'hidden', 
                      border: '1px solid var(--light-gray)',
                      marginBottom: '12px'
                    }}>
                      <Image src={url} alt={`Result ${idx}`} fill style={{ objectFit: 'cover' }} />
                    </div>
                    <p className="text-body" style={{ fontSize: '13px', color: 'var(--stone)' }}>
                      {idx === 0 ? "오리지널" : idx === 1 ? "정장 스타일" : "캐주얼 스타일"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {imageSrc || resultImages.length > 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button 
                className="btn-primary" 
                onClick={!resultImages.length ? handlePreGenerateClick : handleReset}
                disabled={isLoading}
                style={{ maxWidth: '320px', padding: '12px 24px', fontSize: '16px' }}
              >
                {isLoading ? "처리 중..." : (!resultImages.length ? "사진 생성하기" : "새로운 사진")}
              </button>
            </div>
          ) : null}
        </div>

        {/* 내 보관함 섹션 */}
        {savedPhotos.length > 0 && (
          <div style={{ maxWidth: '1024px', margin: '88px auto 0' }}>
            <h2 className="heading-section" style={{ marginBottom: '32px' }}>
              내 보관함
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '24px' }}>
              {savedPhotos.map((photo) => (
                <div key={photo.id} className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '3/4', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--light-gray)' }}>
                    <Image src={photo.url} alt="Saved Passport Photo" fill style={{ objectFit: 'cover' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <a 
                      href={photo.url} 
                      download={`passport_${photo.id}.png`}
                      style={{ fontSize: '14px', color: 'var(--near-black)', textDecoration: 'none', fontWeight: 500 }}
                    >
                      다운로드
                    </a>
                    <button 
                      onClick={() => handleDeletePhoto(photo.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--stone)', cursor: 'pointer', fontSize: '14px' }}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- 모달 (Modals) --- */}
      
      {/* 1. 옵션 선택 대화창 */}
      {showOptionDialog && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.85)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '40px 32px' }}>
            <h3 className="heading-card" style={{ marginBottom: '16px', fontWeight: 500 }}>어떤 방식으로 생성할까요?</h3>
            <p className="text-body" style={{ marginBottom: '32px', color: 'var(--stone)', fontSize: '14px' }}>
              원본의 느낌을 그대로 유지할지, AI(Gemini)를 통해 전문가가 만진 것처럼 피부와 윤곽을 자연스럽게 보정할지 선택해 주세요.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button className="btn-primary" onClick={() => proceedGenerate(true)}>AI 보정 후 생성</button>
              <button className="btn-secondary" onClick={() => proceedGenerate(false)}>원본 그대로 생성</button>
            </div>
            <button 
              style={{ background: 'none', border: 'none', marginTop: '24px', color: 'var(--silver)', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}
              onClick={() => setShowOptionDialog(false)}
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 2. 환경설정 모달 (Gemini Key 입력창) */}
      {showSettings && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.85)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', textAlign: 'left', padding: '40px 32px' }}>
            <h3 className="heading-card" style={{ marginBottom: '24px', fontWeight: 500 }}>환경 설정</h3>
            <div style={{ marginBottom: '32px' }}>
              <label className="text-body" style={{ display: 'block', marginBottom: '8px', color: 'var(--near-black)', fontWeight: 500 }}>Gemini API Key</label>
              <p className="text-body" style={{ marginBottom: '12px', fontSize: '12px', color: 'var(--silver)' }}>
                AI 보정 기능을 사용하기 위해서는 발급받은 Gemini API Key가 필요합니다. 입력하신 키는 브라우저 내부에만 안전하게 저장됩니다.
              </p>
                <input 
                   type="password" 
                   value={geminiKey} 
                   onChange={e => {
                     setGeminiKey(e.target.value);
                     if (settingsError) setSettingsError(null);
                   }} 
                   placeholder="AIzaSy..."
                   style={{ width: '100%', padding: '12px 16px', borderRadius: '9999px', border: settingsError ? '1px solid #ff4d4f' : '1px solid var(--silver)', fontSize: '16px', outline: 'none' }} 
                />
                {settingsError && (
                  <p style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '8px', marginLeft: '12px' }}>
                    {settingsError}
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button className="btn-white" onClick={() => {
                  setShowSettings(false);
                  setSettingsError(null);
                }} disabled={isValidating}>취소</button>
                <button 
                  className="btn-primary" 
                  onClick={saveSettings} 
                  style={{ width: 'auto' }}
                  disabled={isValidating}
                >
                  {isValidating ? "검증 중..." : "저장"}
                </button>
              </div>
          </div>
        </div>
      )}
    </main>
  );
}
