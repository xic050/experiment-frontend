import React, { useState, useEffect, useRef } from 'react';
import { Heart, X, Star, User, ArrowRight, Download, CheckCircle, Loader2, Camera, RefreshCw, Check, UploadCloud, AlertCircle, Image as ImageIcon } from 'lucide-react';

// --- 配置 ---
// Ngrok 地址 (每次重启 Ngrok 记得更新这里)
const API_BASE_URL = 'https://betty-unhoneyed-fred.ngrok-free.dev'; 

const PRE_QUESTIONS = [
  "comforted",
  "supported",
  "looked after",
  "careed for",
  "secure",
  "safe",
  "protected",
  "unthreatened",
  "better abour myself",
    "valued",
    "more positive abour myself",
    "I really like myself",
    "loved",
    "cherished",
    "treasured",
    "adored",
];

// --- 摄像头组件 (含文件上传功能) ---
const CameraCapture = ({ onCapture, label, instruction }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);

  // 组件挂载时启动摄像头，卸载时关闭
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.warn("Camera access failed", err);
      // 如果摄像头失败，不报错阻断，而是允许用户使用上传按钮
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas && video.readyState === 4) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setImage(dataUrl);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setImage(reader.result);
        };
        reader.readAsDataURL(file);
    }
  };

  const retake = () => {
    setImage(null);
    // 重新启动摄像头
    startCamera();
  };

  const confirm = () => {
    // 确认前先停止摄像头，释放资源
    stopCamera();
    onCapture(image);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      <h3 className="text-xl font-bold mb-2 text-slate-800">{label}</h3>
      <p className="text-sm text-slate-500 mb-4">{instruction}</p>
      
      {error && <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-4 text-sm">{error}</div>}

      <div className="relative w-full aspect-[3/4] bg-black rounded-2xl overflow-hidden mb-6 shadow-xl group">
          {!image ? (
            <>
              {/* 视频流 */}
              <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover transform -scale-x-100" />
              
              {/* 状态提示 */}
              {!stream && !error && <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">正在启动摄像头...</div>}

              {/* 轮廓遮罩 */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-50">
                 <svg viewBox="0 0 100 100" className="w-2/3 h-2/3 text-white border-2 border-dashed border-white rounded-full">
                    <path d="M50,10 C30,10 15,25 15,45 C15,60 25,70 30,75 C10,85 0,100 0,100 L100,100 C100,100 90,85 70,75 C75,70 85,60 85,45 C85,25 70,10 50,10 Z" fill="none" stroke="white" strokeWidth="1" strokeDasharray="4"/>
                 </svg>
                 <p className="absolute bottom-10 text-white text-sm font-bold bg-black/50 px-3 py-1 rounded">请将面部对准轮廓</p>
              </div>
              <canvas ref={canvasRef} className="hidden" />
              
              {/* 拍照按钮 */}
              <button 
                onClick={takePhoto} 
                className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white rounded-full border-4 border-slate-200 flex items-center justify-center hover:bg-slate-100 transition shadow-lg z-10"
                title="拍照"
              >
                <Camera className="text-slate-800" size={32} />
              </button>

              {/* 上传文件按钮 */}
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
              <button 
                onClick={() => fileInputRef.current.click()}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition pointer-events-auto"
                title="上传本地照片"
              >
                <UploadCloud size={20} />
              </button>
            </>
          ) : (
            <>
              <img src={image} alt="Captured" className="w-full h-full object-cover" />
              <div className="absolute bottom-0 w-full bg-black/60 p-4 flex justify-between z-20">
                <button onClick={retake} className="flex items-center gap-2 text-white hover:text-rose-400 font-medium"><RefreshCw size={20} /> 重拍/重选</button>
                <button onClick={confirm} className="flex items-center gap-2 text-white hover:text-green-400 font-bold"><Check size={20} /> 确认使用</button>
              </div>
            </>
          )}
        </div>
    </div>
  );
};

export default function App() {
  // --- 状态管理 ---
  const [phase, setPhase] = useState('gender_select'); 
  
  const [selfGender, setSelfGender] = useState('male');
  const [partnerGender, setPartnerGender] = useState('female');
  const [selfPhoto, setSelfPhoto] = useState(null);
  const [partnerPhoto, setPartnerPhoto] = useState(null);
  
  const [userProfileText, setUserProfileText] = useState('');
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState({});
  
  const [currentTrialIndex, setCurrentTrialIndex] = useState(0);
  const [trialStep, setTrialStep] = useState('card'); 
  const [trialStartTime, setTrialStartTime] = useState(0);
  const [data, setData] = useState([]);
  const [stimuli, setStimuli] = useState([]); 
  
  const [currentTrialData, setCurrentTrialData] = useState({});
  const [ratingDesirability, setRatingDesirability] = useState(4); 
  const [ratingWillingness, setRatingWillingness] = useState(4);   
  const [saveStatus, setSaveStatus] = useState('idle'); 
  const [isDemoMode, setIsDemoMode] = useState(false); 

  // --- 处理逻辑 ---

  const handleGenderConfirm = () => {
    setPhase('upload_self');
  };

  const handleSelfCapture = (imgData) => {
    if (!imgData) return;
    setSelfPhoto(imgData);
    // 稍微延迟一下状态切换，给用户一点视觉反馈时间
    setTimeout(() => {
        setPhase('upload_partner');
    }, 100);
  };

  const handlePartnerCapture = (imgData) => {
    if (!imgData) return;
    setPartnerPhoto(imgData);
    setTimeout(() => {
        setPhase('processing');
    }, 100);
  };

  const generateMockData = () => {
    const mockStimuli = [];
    let idCounter = 1;
    // 12 Self Morphs
    for(let i=0; i<12; i++) {
        mockStimuli.push({
            id: `mock_self_${idCounter++}`,
            url: `https://api.dicebear.com/7.x/avataaars/svg?seed=self${i}&backgroundColor=e5e7eb`,
            type: 'self_morph',
            ratio_self: (i % 6) * 0.2, 
            description: `Self Morph ${(i%6)*20}% (Demo)`
        });
    }
    // 12 Partner Morphs
    for(let i=0; i<12; i++) {
        mockStimuli.push({
            id: `mock_partner_${idCounter++}`,
            url: `https://api.dicebear.com/7.x/avataaars/svg?seed=partner${i}&backgroundColor=b6e3f4`,
            type: 'partner_morph',
            ratio_partner: (i % 6) * 0.2,
            description: `Partner Morph ${(i%6)*20}% (Demo)`
        });
    }
    // 12 Random
    for(let i=0; i<12; i++) {
        mockStimuli.push({
            id: `mock_random_${idCounter++}`,
            url: `https://api.dicebear.com/7.x/avataaars/svg?seed=random${i}&backgroundColor=ffdfd2`,
            type: 'random_opposite',
            ratio_self: 0,
            description: `Random Face (Demo)`
        });
    }
    return mockStimuli.sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    if (phase === 'processing') {
      const processImages = async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

        try {
          console.log("Attempting to connect to backend:", API_BASE_URL);
          const response = await fetch(`${API_BASE_URL}/merge_faces`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true' 
            },
            body: JSON.stringify({
              self_image: selfPhoto,
              partner_image: partnerPhoto,
              self_gender: selfGender,
              partner_gender: partnerGender
            }),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
          }
          
          const result = await response.json();
          setStimuli(result.images);
          setPhase('instructions');

        } catch (error) {
          clearTimeout(timeoutId);
          console.warn("Backend connection failed, switching to DEMO MODE.", error);
          setIsDemoMode(true);
          const mockData = generateMockData();
          setTimeout(() => {
            setStimuli(mockData);
            setPhase('instructions');
          }, 2000);
        }
      };
      processImages();
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'experiment' && trialStep === 'card') {
      setTrialStartTime(performance.now());
    }
  }, [phase, trialStep, currentTrialIndex]);

  const saveDataToServer = async () => {
    setSaveStatus('saving');
    const exportData = {
      timestamp: new Date().toISOString(),
      gender_info: { self: selfGender, partner: partnerGender },
      user_profile: userProfileText,
      pre_questionnaire: questionnaireAnswers,
      experiment_data: data,
      mode: isDemoMode ? 'demo' : 'production'
    };

    try {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `experiment_data_${isDemoMode ? 'DEMO' : 'REAL'}.json`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } catch (e) {
      console.error("Local download failed", e);
    }

    if (isDemoMode) {
        setSaveStatus('saved'); 
        return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/save_data`, {
         method: 'POST',
         headers: { 
           'Content-Type': 'application/json',
           'ngrok-skip-browser-warning': 'true' 
         },
         body: JSON.stringify(exportData)
      });
      if(response.ok) setSaveStatus('saved');
      else throw new Error('Upload failed');
    } catch (e) {
      console.error(e);
      setSaveStatus('error');
    }
  };

  // --- 界面渲染 ---

  if (phase === 'gender_select') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">基本信息确认</h1>
          
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">您的性别</label>
            <div className="flex gap-4">
              <button onClick={() => setSelfGender('male')} className={`flex-1 py-3 rounded-lg border-2 ${selfGender === 'male' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200'}`}>男</button>
              <button onClick={() => setSelfGender('female')} className={`flex-1 py-3 rounded-lg border-2 ${selfGender === 'female' ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-200'}`}>女</button>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-bold text-slate-700 mb-2">伴侣性别 (或期望对象)</label>
             <div className="flex gap-4">
              <button onClick={() => setPartnerGender('male')} className={`flex-1 py-3 rounded-lg border-2 ${partnerGender === 'male' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200'}`}>男</button>
              <button onClick={() => setPartnerGender('female')} className={`flex-1 py-3 rounded-lg border-2 ${partnerGender === 'female' ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-200'}`}>女</button>
            </div>
          </div>

          <button onClick={handleGenderConfirm} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition">
            下一步：上传照片
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'upload_self') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-full bg-white p-6 rounded-2xl shadow-xl">
           <div className="flex justify-center mb-4"><div className="w-full h-2 bg-slate-100 rounded-full"><div className="h-full bg-rose-500 w-1/3"></div></div></div>
           <CameraCapture 
             key="capture-self" // 关键修改：添加 key
             label="步骤 1/2: 拍摄您的照片" 
             instruction="请确保面部清晰，光线充足。如果摄像头无法使用，可点击右上角图标上传照片。" 
             onCapture={handleSelfCapture} 
           />
        </div>
      </div>
    );
  }

  if (phase === 'upload_partner') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-full bg-white p-6 rounded-2xl shadow-xl">
           <div className="flex justify-center mb-4"><div className="w-full h-2 bg-slate-100 rounded-full"><div className="h-full bg-rose-500 w-2/3"></div></div></div>
           <CameraCapture 
             key="capture-partner" // 关键修改：添加 key
             label="步骤 2/2: 拍摄伴侣的照片" 
             instruction="若无伴侣在旁，可翻拍照片或上传现成照片。" 
             onCapture={handlePartnerCapture} 
           />
        </div>
      </div>
    );
  }

  if (phase === 'processing') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center text-white">
        <Loader2 size={64} className="animate-spin text-rose-500 mb-6" />
        <h2 className="text-2xl font-bold mb-2">正在进行面孔融合...</h2>
        <div className="text-slate-400 text-sm space-y-2">
          <p>正在根据 {selfGender === 'male' ? '男性' : '女性'} 数据库生成自我融合...</p>
          <p>正在连接 AI 服务器 (可能需要几秒钟)...</p>
        </div>
      </div>
    );
  }

  // ... (其余部分保持不变，包括 instructions, profile, questionnaire, experiment, finish)
  
  if (phase === 'instructions') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <h2 className="text-xl font-bold mb-4 text-slate-800">准备就绪</h2>
          {isDemoMode && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-xl mb-6 text-sm flex items-start gap-2">
              <AlertCircle size={20} className="shrink-0 mt-0.5"/>
              <div>
                <strong>演示模式已启动</strong>
                <p>后端连接超时或被拦截（403），当前使用模拟数据。如果这是预期外的，请检查 Ngrok 状态。</p>
              </div>
            </div>
          )}
          <p className="text-slate-600 mb-6 text-sm">系统已准备好 36 张潜在匹配对象。包含不同程度的相似面孔。请凭直觉操作。</p>
          <button onClick={() => setPhase('profile')} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl">开始实验</button>
        </div>
      </div>
    );
  }

  if (phase === 'profile') {
     return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">To improve your relationship quality, science has proven that the following method can be very helpful. Let's give it a try！！
Please take time to think carefully about a close relationship in which you find it easy to feel close to the other person and are comfortable relying on them. This person you are thinking about should be someone who is always there for you when you are in need.

You should now have a person in mind. Please imagine what they look like and what it is like to be in their company.

Now you have the person in mind, think about how you do not worry about being abandoned by this person or worry that this person would try to get closer to you than you are comfortable being.</h2>
          <textarea className="w-full border p-3 h-32 mb-6 rounded-lg" placeholder="


Please write about this person, your shared time together, and how this person makes you feel safe, comforted, and loved. There may be a particular time or example of these good things in the relationship that you could recall here. The task will be timed with a 10-minute countdown timer." value={userProfileText} onChange={e=>setUserProfileText(e.target.value)} />
          <button onClick={() => setPhase('questionnaire')} className="w-full bg-rose-500 text-white font-bold py-3 rounded-xl">下一步</button>
        </div>
      </div>
     );
  }

  if (phase === 'questionnaire') {
    const isComplete = Object.keys(questionnaireAnswers).length === PRE_QUESTIONS.length;
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex justify-center">
        <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md overflow-y-auto max-h-screen">
           <h2 className="text-xl font-bold mb-4">Ratings</h2>
           {PRE_QUESTIONS.map((q, idx) => (
              <div key={idx} className="mb-4 text-sm">
                <p className="mb-2">{idx + 1}. {q}</p>
                <div className="flex justify-between">{[1,2,3,4,5,6,7].map(n=><button key={n} onClick={()=>setQuestionnaireAnswers(p=>({...p,[idx]:n}))} className={`w-8 h-8 rounded-full ${questionnaireAnswers[idx]===n?'bg-rose-500 text-white':'bg-slate-100'}`}>{n}</button>)}</div>
              </div>
            ))}
            <button disabled={!isComplete} onClick={() => setPhase('experiment')} className={`w-full mt-4 font-bold py-3 rounded-xl ${!isComplete?'bg-slate-300':'bg-slate-900 text-white'}`}>开始浏览 (共36张)</button>
        </div>
      </div>
    );
  }

  const handleCardAction = (action) => {
    const rt = performance.now() - trialStartTime;
    const stim = stimuli[currentTrialIndex];
    setCurrentTrialData({
      trial_index: currentTrialIndex + 1,
      stimulus_id: stim.id,
      stimulus_type: stim.type, 
      ratio_level: stim.ratio_self || stim.ratio_partner || 0,
      action: action,
      reaction_time_ms: Math.round(rt),
    });
    setRatingDesirability(4); setRatingWillingness(4); setTrialStep('rating');
  };

  const handleRatingSubmit = () => {
    const completeData = { ...currentTrialData, rating_desirability: ratingDesirability, rating_willingness: ratingWillingness };
    setData([...data, completeData]);

    if (currentTrialIndex < stimuli.length - 1) {
      setCurrentTrialIndex(prev => prev + 1);
      setTrialStep('card');
    } else {
      setPhase('finish');
    }
  };

  if (phase === 'experiment' && trialStep === 'card') {
    const currentStim = stimuli[currentTrialIndex];
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm mb-4 h-1.5 bg-slate-200 rounded-full"><div className="h-full bg-rose-500 transition-all" style={{ width: `${((currentTrialIndex+1)/stimuli.length)*100}%` }} /></div>
        <div className="relative w-full max-w-sm aspect-[3/4] bg-white rounded-3xl shadow-2xl overflow-hidden mb-6">
          <img src={currentStim.url} className="w-full h-full object-cover" alt="Stimulus" />
          <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent p-6 text-white pt-20">
            <h3 className="text-sm font-light opacity-50">{currentStim.description}</h3>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => handleCardAction('dislike')} className="w-16 h-16 bg-white rounded-full shadow-lg text-rose-500 flex items-center justify-center hover:scale-110 transition"><X size={32} /></button>
          <button onClick={() => handleCardAction('superlike')} className="w-12 h-12 bg-white rounded-full shadow text-blue-400 flex items-center justify-center hover:scale-110 transition -mt-2"><Star size={24} /></button>
          <button onClick={() => handleCardAction('like')} className="w-16 h-16 bg-rose-500 rounded-full shadow-lg text-white flex items-center justify-center hover:scale-110 transition"><Heart size={32} fill="currentColor" /></button>
        </div>
      </div>
    );
  }

  if (phase === 'experiment' && trialStep === 'rating') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
           <h2 className="text-xl font-bold text-center mb-6">How do you think about him/her？</h2>
           <div className="mb-6"><label className="block mb-2 font-bold text-slate-700">desirebility: {ratingDesirability}</label><input type="range" min="1" max="7" value={ratingDesirability} onChange={e => setRatingDesirability(Number(e.target.value))} className="w-full accent-rose-500" /></div>
           <div className="mb-8"><label className="block mb-2 font-bold text-slate-700">willingness to dating: {ratingWillingness}</label><input type="range" min="1" max="7" value={ratingWillingness} onChange={e => setRatingWillingness(Number(e.target.value))} className="w-full accent-rose-500" /></div>
           <button onClick={handleRatingSubmit} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl">确认</button>
        </div>
      </div>
    );
  }

  if (phase === 'finish') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
         <CheckCircle size={64} className="text-green-500 mx-auto mb-6" />
         <h2 className="text-2xl font-bold mb-4">实验结束</h2>
         <p className="text-slate-500 mb-6">感谢您的参与。数据已自动记录。</p>
         
         {saveStatus === 'idle' && (
           <button onClick={saveDataToServer} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl mb-4">保存数据 (下载到本地)</button>
         )}
         {saveStatus === 'saving' && <div className="text-slate-500 animate-pulse">正在处理数据...</div>}
         {saveStatus === 'saved' && <div className="text-green-600 font-bold mb-4">数据已成功保存！文件已下载。</div>}
         {saveStatus === 'error' && <div className="text-red-500 font-bold mb-4">保存失败，请重试。</div>}
         
         {isDemoMode && <p className="text-xs text-amber-500 mt-4">* 当前为演示模式，数据仅保存在本地，未上传至服务器。</p>}
      </div>
    );
  }

  return null;
}
