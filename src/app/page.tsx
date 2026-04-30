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
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [savedPhotos, setSavedPhotos] = useState<SavedPhoto[]>([]);
  const [profileType, setProfileType] = useState<ProfileType>('passport_35x45');
  
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
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setImageSrc(URL.createObjectURL(selected));
      setResultImage(null);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleGenerateClick = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      alert("먼저 사진을 업로드해주세요.");
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

      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("서버 오류가 발생했습니다.");
      }

      const data = await response.json();
      if (data.success && data.resultUrl) {
        setResultImage(data.resultUrl);
        setImageSrc(null);
        
        // 자동 보관 로직
        const newPhoto: SavedPhoto = {
          id: Date.now().toString(),
          url: data.resultUrl,
          createdAt: Date.now(),
        };
        const newSavedPhotos = [newPhoto, ...savedPhotos];
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
    setResultImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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

          {!resultImage && (
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

          {!imageSrc && !resultImage && (
            <div className="upload-zone" onClick={handleUploadClick}>
              <h3 className="heading-card" style={{ marginBottom: '8px', fontWeight: 500 }}>
                사진 업로드
              </h3>
              <p className="text-body" style={{ color: 'var(--silver)' }}>
                클릭하여 사진을 선택하세요 (JPG, PNG)
              </p>
            </div>
          )}

          {imageSrc && !resultImage && (
            <div style={{ marginBottom: '48px' }}>
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

          {resultImage && (
            <div style={{ marginBottom: '48px' }}>
              <h3 className="heading-card" style={{ marginBottom: '24px', fontWeight: 500 }}>
                {PROFILE_CONFIGS[profileType].label} 변환 완료
              </h3>
              <div style={{ 
                position: 'relative', 
                width: '240px', 
                aspectRatio: PROFILE_CONFIGS[profileType].aspect.toString(), 
                margin: '0 auto', 
                borderRadius: '12px', 
                overflow: 'hidden', 
                border: '1px solid var(--light-gray)'
              }}>
                <Image src={resultImage} alt="Result" fill style={{ objectFit: 'cover' }} />
              </div>
            </div>
          )}

          {imageSrc || resultImage ? (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button 
                className="btn-primary" 
                onClick={!resultImage ? handleGenerateClick : handleReset}
                disabled={isLoading}
                style={{ maxWidth: '320px', padding: '12px 24px', fontSize: '16px' }}
              >
                {isLoading ? "처리 중..." : (!resultImage ? "사진 생성하기" : "새로운 사진")}
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
    </main>
  );
}
