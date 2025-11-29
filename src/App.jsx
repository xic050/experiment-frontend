import React, { useState, useEffect, useRef } from 'react';
import { Heart, X, Star, User, ArrowRight, Download, CheckCircle, Loader2, Camera, RefreshCw, Check, UploadCloud, AlertCircle, Image as ImageIcon, Clock, ShoppingCart, Maximize, Minimize } from 'lucide-react';

// --- 配置 ---
// ⚠️⚠️⚠️ 关键修改：请填入你终端里显示的最新 Ngrok 地址 ⚠️⚠️⚠️
const API_BASE_URL = 'https://betty-unhoneyed-fred.ngrok-free.dev'; 

const PRE_QUESTIONS = [
  "comforted",
  "supported",
  "looked after",
  "cared for",
  "secure",
  "safe",
  "protected",
  "unthreatened",
  "better about myself",
  "valued",
  "more positive about myself",
  "I really like myself",
  "loved",
  "cherished",
  "treasured",
  "adored",
];

// --- 布局组件 ---
const Layout = ({ children }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const handleChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative">
      <button 
        onClick={toggleFullScreen}
        className="fixed top-4 right-4 z-50 p-2 bg-white/60 hover:bg-white backdrop-blur-md rounded-full shadow-md text-slate-600 transition-all duration-300 hover:scale-110"
        title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
      >
        {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
      </button>
      {children}
    </div>
  );
};

// --- 摄像头组件 (保持不变) ---
const CameraCapture = ({ onCapture, label, instruction }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);

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
    startCamera();
  };

  const confirm = () => {
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
              <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover transform -scale-x-100" />
              {!stream && !error && <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">Starting camera...</div>}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-50">
                 <svg viewBox="0 0 100 100" className="w-2/3 h-2/3 text-white border-2 border-dashed border-white rounded-full">
                    <path d="M50,10 C30,10 15,25 15,45 C15,60 25,70 30,75 C10,85 0,100 0,100 L100,100 C100,100 90,85 70,75 C75,70 85,60 85,45 C85,25 70,10 50,10 Z" fill="none" stroke="white" strokeWidth="1" strokeDasharray="4"/>
                 </svg>
                 <p className="absolute bottom-10 text-white text-sm font-bold bg-black/50 px-3 py-1 rounded">Align face here</p>
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <button onClick={takePhoto} className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white rounded-full border-4 border-slate-200 flex items-center justify-center hover:bg-slate-100 transition shadow-lg z-10" title="Take Photo"><Camera className="text-slate-800" size={32} /></button>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
              <button onClick={() => fileInputRef.current.click()} className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition pointer-events-auto" title="Upload Photo"><UploadCloud size={20} /></button>
            </>
          ) : (
            <>
              <img src={image} alt="Captured" className="w-full h-full object-cover" />
              <div className="absolute bottom-0 w-full bg-black/60 p-4 flex justify-between z-20">
                <button onClick={retake} className="flex items-center gap-2 text-white hover:text-rose-400 font-medium"><RefreshCw size={20} /> Retake</button>
                <button onClick={confirm} className="flex items-center gap-2 text-white hover:text-green-400 font-bold"><Check size={20} /> Confirm</button>
              </div>
            </>
          )}
        </div>
    </div>
  );
};

export default function App() {
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
  const [profileTimer, setProfileTimer] = useState(120);
  const [condition, setCondition] = useState('relationship');
  const [participantId, setParticipantId] = useState(null);

  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const randomCondition = Math.random() < 0.5 ? 'relationship' : 'grocery';
    setCondition(randomCondition);
    console.log(`Experiment Condition Assigned: ${randomCondition}`);
  }, []);

  // 监听 Phase 变化 (页面切换时保存)
  useEffect(() => {
    window.scrollTo(0, 0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    
    if (phase !== 'gender_select') {
        saveDataToServer(true); 
    }
  }, [phase]);

  // ⚠️ 关键新增：监听 Data 变化 (每次添加新数据时保存) ⚠️
  useEffect(() => {
    if (data.length > 0) {
        console.log(`Data updated (Count: ${data.length}), saving to server...`);
        saveDataToServer(true); // 静默保存
    }
  }, [data]);

  const handleGenderConfirm = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(e => console.log(e));
    }
    setPhase('upload_self'); 
  };

  const handleSelfCapture = (imgData) => {
    if (!imgData) return;
    setSelfPhoto(imgData);
    setTimeout(() => { setPhase('upload_partner'); }, 100);
  };

  const handlePartnerCapture = (imgData) => {
    if (!imgData) return;
    setPartnerPhoto(imgData);
    setTimeout(() => { setPhase('processing'); }, 100);
  };

  useEffect(() => {
    let interval;
    if (phase === 'profile' && profileTimer > 0) {
      interval = setInterval(() => {
        setProfileTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [phase, profileTimer]);

  const generateMockData = () => {
    const mockStimuli = [];
    let idCounter = 1;
    for(let i=0; i<12; i++) {
        mockStimuli.push({id: `mock_self_${idCounter++}`, url: `https://api.dicebear.com/7.x/avataaars/svg?seed=self${i}`, type: 'self_morph', ratio_self: (i % 6) * 0.2, description: `Self Morph ${(i%6)*20}% (Demo)`});
    }
    for(let i=0; i<12; i++) {
        mockStimuli.push({id: `mock_partner_${idCounter++}`, url: `https://api.dicebear.com/7.x/avataaars/svg?seed=partner${i}`, type: 'partner_morph', ratio_partner: (i % 6) * 0.2, description: `Partner Morph ${(i%6)*20}% (Demo)`});
    }
    for(let i=0; i<12; i++) {
        mockStimuli.push({id: `mock_random_${idCounter++}`, url: `https://api.dicebear.com/7.x/avataaars/svg?seed=random${i}`, type: 'random_opposite', ratio_self: 0, description: `Random Face (Demo)`});
    }
    return mockStimuli.sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    if (phase === 'processing') {
      const processImages = async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 40000);

        try {
          console.log("Connecting to:", API_BASE_URL);
          const response = await fetch(`${API_BASE_URL}/merge_faces`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
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
          console.warn("Backend connection failed", error);
          setIsDemoMode(true);
          const mockData = generateMockData();
          setTimeout(() => { setStimuli(mockData); setPhase('instructions'); }, 2000);
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

  const saveDataToServer = async (isPartial = false) => {
    if (!isPartial) setSaveStatus('saving');
    
    const exportData = {
      participant_id: participantId, 
      timestamp: new Date().toISOString(),
      condition_group: condition, 
      gender_info: { self: selfGender, partner: partnerGender },
      user_profile: userProfileText,
      pre_questionnaire: questionnaireAnswers,
      experiment_data: data,
      mode: isDemoMode ? 'demo' : 'production',
      is_complete: phase === 'finish'
    };

    if (isDemoMode) {
        if (!isPartial) setSaveStatus('saved'); 
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
      
      if(response.ok) {
          const result = await response.json();
          if (result.participant_id) {
              setParticipantId(result.participant_id);
          }
          if (!isPartial) setSaveStatus('saved');
      } else {
          throw new Error('Upload failed');
      }
    } catch (e) {
      console.error(e);
      if (!isPartial) setSaveStatus('error');
    }
  };

  // --- 界面渲染 ---

  if (phase === 'gender_select') {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center p-6 pt-20">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
            <h1 className="text-2xl font-bold text-center mb-6">Basic Information</h1>
            <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">Your Gender</label>
                <div className="flex gap-4">
                <button onClick={() => setSelfGender('male')} className={`flex-1 py-3 rounded-lg border-2 ${selfGender === 'male' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200'}`}>Male</button>
                <button onClick={() => setSelfGender('female')} className={`flex-1 py-3 rounded-lg border-2 ${selfGender === 'female' ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-200'}`}>Female</button>
                </div>
            </div>
            <div className="mb-8">
                <label className="block text-sm font-bold text-slate-700 mb-2">Partner's Gender (or Preferred)</label>
                <div className="flex gap-4">
                <button onClick={() => setPartnerGender('male')} className={`flex-1 py-3 rounded-lg border-2 ${partnerGender === 'male' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200'}`}>Male</button>
                <button onClick={() => setPartnerGender('female')} className={`flex-1 py-3 rounded-lg border-2 ${partnerGender === 'female' ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-200'}`}>Female</button>
                </div>
            </div>
            <button onClick={handleGenderConfirm} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition">Next: Upload Photos</button>
            </div>
        </div>
      </Layout>
    );
  }

  if (phase === 'upload_self') {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center p-6 pt-20">
            <div className="w-full bg-white p-6 rounded-2xl shadow-xl max-w-md">
            <div className="flex justify-center mb-4"><div className="w-full h-2 bg-slate-100 rounded-full"><div className="h-full bg-rose-500 w-1/3"></div></div></div>
            <CameraCapture key="capture-self" label="Step 1/2: Take Your Photo" instruction="Please ensure your face is clear and well-lit. If the camera fails, click the icon on the top right to upload." onCapture={handleSelfCapture} />
            </div>
        </div>
      </Layout>
    );
  }

  if (phase === 'upload_partner') {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center p-6 pt-20">
            <div className="w-full bg-white p-6 rounded-2xl shadow-xl max-w-md">
            <div className="flex justify-center mb-4"><div className="w-full h-2 bg-slate-100 rounded-full"><div className="h-full bg-rose-500 w-2/3"></div></div></div>
            <CameraCapture key="capture-partner" label="Step 2/2: Take Partner's Photo" instruction="If partner is not present, you can upload an existing photo." onCapture={handlePartnerCapture} />
            </div>
        </div>
      </Layout>
    );
  }

  if (phase === 'processing') {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center p-6 pt-20 h-screen bg-slate-900">
            <Loader2 size={64} className="animate-spin text-rose-500 mb-6" />
            <h2 className="text-2xl font-bold mb-2 text-white">Processing Face Morphing...</h2>
            <div className="text-slate-400 text-sm space-y-2 text-center">
            <p>Generating stimuli based on {selfGender} database...</p>
            <p>Connecting to AI Server (this may take a few seconds)...</p>
            </div>
        </div>
      </Layout>
    );
  }

  if (phase === 'instructions') {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center p-6 pt-20">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-slate-800">Ready</h2>
            {isDemoMode && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-xl mb-6 text-sm flex items-start gap-2">
                <AlertCircle size={20} className="shrink-0 mt-0.5"/>
                <div><strong>Demo Mode Active</strong><p>Backend connection timed out or blocked (403). Using mock data. Please check Ngrok status if this is unexpected.</p></div>
                </div>
            )}
            <p className="text-slate-600 mb-6 text-sm">System has prepared 36 potential matches. Please follow your intuition.</p>
            <button onClick={() => setPhase('profile')} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl">Start Experiment</button>
            </div>
        </div>
      </Layout>
    );
  }

  if (phase === 'profile') {
     const minutes = Math.floor(profileTimer / 60);
     const seconds = profileTimer % 60;
     return (
      <Layout>
        <div className="flex flex-col items-center justify-center p-6 pt-10">
            <div ref={scrollContainerRef} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl overflow-y-auto max-h-[85vh]">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className={`p-3 rounded-full ${condition === 'relationship' ? 'bg-rose-100 text-rose-500' : 'bg-blue-100 text-blue-500'}`}>
                {condition === 'relationship' ? <Heart size={24} fill="currentColor" /> : <ShoppingCart size={24} />}
                </div>
                <h2 className="text-2xl font-bold text-slate-800">{condition === 'relationship' ? 'Relationship Reflection' : 'Shopping Experience'}</h2>
            </div>
            <div className="text-slate-600 space-y-4 mb-8 text-sm leading-relaxed text-justify">
                {condition === 'relationship' ? (
                    <>
                        <p>To improve your relationship quality, science has proven that the following method can be very helpful. <span className="font-semibold text-rose-600 block mt-1">Let's give it a try!</span></p>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <p className="mb-2">Please take time to think carefully about a <strong>close relationship</strong> in which you find it easy to feel close to the other person and are comfortable relying on them. </p>
                            <p>This person you are thinking about should be someone who is <strong>always there for you</strong> when you are in need.</p>
                        </div>
                        <p>You should now have a person in mind. Please imagine what they look like and what it is like to be in their company.</p>
                        <p>Now you have the person in mind, think about how you do not worry about being abandoned by this person or worry that this person would try to get closer to you than you are comfortable being.</p>
                        <p>Please write about this person, your shared time together, and how this person makes you feel safe, comforted, and loved. There may be a particular time or example of these good things in the relationship that you could recall here. The task will be timed.</p>
                    </>
                ) : (
                    <>
                        <p>This page requires you to identify and write for 10 minutes (in the box below) about a recent retail experience you had. We won’t read or keep what you write (though we will check that you have written at least a few paragraphs of text), so please feel free to write in a disinhibited and unguarded way. The exercise is just about having you visualise a situation.</p>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <p className="mb-2">Please take time to think carefully about a time when you visited a <strong>grocery store alone</strong> to buy grocery products.</p>
                            <p>This must be a time when you were out shopping alone, with no friends or acquaintances.</p>
                        </div>
                        <p>You should now have a recent shopping time in mind. Please imagine the details of this trip.</p>
                        <p>Now you have a particular shopping trip in mind, imagine and describe the route from your home to the store, the appearance of the store, the ease with which you found what you were looking for and the groceries you purchased.</p>
                        <p>Please write down as much as you can about this grocery store trip. The task will be timed with a 10-minute countdown timer.</p>
                    </>
                )}
            </div>
            <div className="mb-6">
                <label className="block text-slate-700 font-bold mb-2 flex items-center gap-2 justify-between flex-wrap">
                    <span>Your Response:</span>
                    {profileTimer > 0 && (<span className="text-xs font-normal text-rose-500 bg-rose-50 px-2 py-1 rounded-full flex items-center gap-1 whitespace-nowrap"><Clock size={12}/> Time remaining: {minutes}:{seconds.toString().padStart(2, '0')}</span>)}
                </label>
                <textarea className="w-full border border-slate-300 rounded-xl p-4 h-48 focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all resize-none text-sm leading-relaxed" 
                    placeholder={condition === 'relationship' ? "There may be a particular time or example of these good things in the relationship that you could recall here. The task will be timed." : "Please write down as much as you can about this grocery store trip. The task will be timed."}
                    value={userProfileText} onChange={e=>setUserProfileText(e.target.value)} 
                />
            </div>
            <button disabled={profileTimer > 0} onClick={() => setPhase('questionnaire')} className={`w-full font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${profileTimer > 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'}`}>
                {profileTimer > 0 ? <><Loader2 className="animate-spin" size={20} /><span className="whitespace-nowrap">Please reflect & write ({minutes}:{seconds.toString().padStart(2, '0')})</span></> : <><span>Next Step</span><ArrowRight size={20} /></>}
            </button>
            </div>
        </div>
      </Layout>
     );
  }

  if (phase === 'questionnaire') {
    const isComplete = Object.keys(questionnaireAnswers).length === PRE_QUESTIONS.length;
    return (
      <Layout>
        <div className="flex justify-center p-6 pt-20 min-h-screen">
            <div ref={scrollContainerRef} className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md overflow-y-auto max-h-[85vh]">
            <h2 className="text-xl font-bold mb-4">Ratings</h2>
            {PRE_QUESTIONS.map((q, idx) => (
                <div key={idx} className="mb-4 text-sm">
                    <p className="mb-2">{idx + 1}. {q}</p>
                    <div className="flex justify-between">{[1,2,3,4,5,6,7].map(n=><button key={n} onClick={()=>setQuestionnaireAnswers(p=>({...p,[idx]:n}))} className={`w-8 h-8 rounded-full ${questionnaireAnswers[idx]===n?'bg-rose-500 text-white':'bg-slate-100'}`}>{n}</button>)}</div>
                </div>
                ))}
                <button disabled={!isComplete} onClick={() => setPhase('experiment')} className={`w-full mt-4 font-bold py-3 rounded-xl ${!isComplete?'bg-slate-300':'bg-slate-900 text-white'}`}>Start Browsing (36 Photos)</button>
            </div>
        </div>
      </Layout>
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
      source_db_image: stim.source_db,
      source_upload_image: stim.source_upload,
      action: action,
      reaction_time_ms: Math.round(rt),
    });
    setRatingDesirability(4); setRatingWillingness(4); setTrialStep('rating');
  };

  const handleRatingSubmit = () => {
    const completeData = { ...currentTrialData, rating_desirability: ratingDesirability, rating_willingness: ratingWillingness };
    const newData = [...data, completeData];
    
    // 更新数据 -> 触发 useEffect 监听器 -> 触发自动保存
    setData(newData);

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
      <Layout>
        <div className="flex flex-col items-center justify-center p-4 min-h-screen">
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
      </Layout>
    );
  }

  if (phase === 'experiment' && trialStep === 'rating') {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center p-6 min-h-screen">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold text-center mb-6">What do you think about him/her?</h2>
            <div className="mb-6"><label className="block mb-2 font-bold text-slate-700">Desirability: {ratingDesirability}</label><input type="range" min="1" max="7" value={ratingDesirability} onChange={e => setRatingDesirability(Number(e.target.value))} className="w-full accent-rose-500" /></div>
            <div className="mb-8"><label className="block mb-2 font-bold text-slate-700">Willingness to Date: {ratingWillingness}</label><input type="range" min="1" max="7" value={ratingWillingness} onChange={e => setRatingWillingness(Number(e.target.value))} className="w-full accent-rose-500" /></div>
            <button onClick={handleRatingSubmit} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl">Confirm</button>
            </div>
        </div>
      </Layout>
    );
  }

  if (phase === 'finish') {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center p-6 text-center min-h-screen">
            <CheckCircle size={64} className="text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Experiment Completed</h2>
            <p className="text-slate-500 mb-6">Thank you for your participation. Data is recorded.</p>
            
            {saveStatus === 'idle' && (
            <button onClick={() => saveDataToServer(false)} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl mb-4">Save Data (Download Local)</button>
            )}
            {saveStatus === 'saving' && <div className="text-slate-500 animate-pulse">Saving data...</div>}
            {saveStatus === 'saved' && <div className="text-green-600 font-bold mb-4">Data saved successfully! File downloaded.</div>}
            {saveStatus === 'error' && <div className="text-red-500 font-bold mb-4">Save failed, please try again.</div>}
            
            {isDemoMode && <p className="text-xs text-amber-500 mt-4">* Demo mode active, data saved locally only.</p>}
        </div>
      </Layout>
    );
  }

  return null;
}