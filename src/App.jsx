import React, { useState, useEffect, useRef } from 'react';
import { Brain, Camera, FileText, LayoutDashboard } from 'lucide-react';
import * as faceapi from 'face-api.js';
import ReactMarkdown from 'react-markdown';

import TextAnalyzer from './components/TextAnalyzer.jsx';
import Dashboard from './components/Dashboard.jsx';
import { getStoredEmotions, storeEmotion } from './utils/storage.js';
import { getGeminiSuggestions } from './utils/api.js';

function App() {
  const [activeTab, setActiveTab] = useState('camera');
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [geminiAnswer, setGeminiAnswer] = useState('');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const videoRef = useRef(null);

  /* -------------------- Load models & history -------------------- */
  useEffect(() => {
    setEmotionHistory(getStoredEmotions());
    (async () => {
      await loadModels();
      setModelsLoaded(true);
    })();
  }, []);

  const loadModels = async () => {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceExpressionNet.loadFromUri('/models');
    } catch (err) {
      console.error('Error loading models:', err);
    }
  };

  /* -------------------- Emotion Handling -------------------- */
  const handleEmotionDetected = async (emotion, confidence, source) => {
    const emotionData = {
      id: Date.now().toString(),
      emotion,
      confidence,
      timestamp: new Date(),
      source,
    };
    storeEmotion(emotionData);
    setEmotionHistory(prev => [emotionData, ...prev]);
    setCurrentEmotion(emotion);

    await fetchGeminiResponse(emotion);
    setShowRecommendations(true);
  };

  const fetchGeminiResponse = async (emotion) => {
    try {
      setLoadingAI(true);
      setGeminiAnswer('Fetching suggestions...');
      const res = await getGeminiSuggestions(null, emotion);
      setGeminiAnswer(res.suggestions || 'No suggestions found.');
    } catch {
      setGeminiAnswer('Could not fetch suggestions. Try again later.');
    } finally {
      setLoadingAI(false);
    }
  };

  /* -------------------- Camera -------------------- */
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      setCameraError(err.message);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) stream.getTracks().forEach(t => t.stop());
    setCameraActive(false);
  };

  useEffect(() => () => stopCamera(), []);

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !modelsLoaded) return;

    try {
      const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 });
      const detection = await faceapi.detectSingleFace(videoRef.current, options).withFaceExpressions();
      if (detection?.expressions) {
        const sorted = Object.entries(detection.expressions).sort((a, b) => b[1] - a[1]);
        const [emotion, confidence] = sorted[0];
        handleEmotionDetected(emotion, Math.round(confidence * 100), 'camera');
      } else alert('No face detected. Make sure your face is visible and well-lit.');
    } catch (err) {
      console.error('Detection error:', err);
      alert('Error analyzing image.');
    }
  };

  /* -------------------- Recommendations Popup -------------------- */
  const Recommendations = ({ emotion, geminiAnswer, loading, onClose }) => (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
      <div className="glass p-6 rounded-2xl w-full max-w-lg relative shadow-xl border">
        <button onClick={onClose} className="absolute top-3 right-4 text-gray-600 hover:text-gray-800">✕</button>
        <h3 className="text-xl font-semibold mb-3 capitalize text-gray-900">Suggestions for feeling {emotion}</h3>
        {loading ? <p>Loading suggestions...</p> : (
          <div className="prose max-h-[50vh] overflow-y-auto">
            <ReactMarkdown>{geminiAnswer}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );

  /* -------------------- Sidebar Tabs with Icons -------------------- */
  const tabs = [
    { key: 'camera', label: 'Face Detection', icon: <Camera className="w-5 h-5 mr-2" /> },
    { key: 'text', label: 'Text / Photo', icon: <FileText className="w-5 h-5 mr-2" /> },
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5 mr-2" /> },
  ];

  /* -------------------- UI -------------------- */
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-pink-100 via-blue-50 to-purple-100">
      {/* Animated background blobs */}
      <div className="blob top-[-50px] left-[-50px]"></div>
      <div className="blob bottom-[-50px] right-[-50px]"></div>

      {/* Header */}
      <header className="bg-white/60 backdrop-blur-lg border-b border-white/20 sticky top-0 z-40">
        <div className="w-full flex items-center justify-between h-16 px-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-xl shadow-md">
              <Brain className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="gradient-text text-xl font-bold tracking-tight">AI Emotion Detector</h1>
              <p className="text-sm text-gray-500">Your Personal Wellness Companion</p>
            </div>
          </div>

          {currentEmotion && (
            <div className="px-4 py-2 bg-white/70 rounded-full shadow-sm border border-gray-200">
              <span className="capitalize text-gray-800">{currentEmotion}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <nav className="glass border border-white/30 rounded-2xl shadow-lg p-6 sticky top-24">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Detection Mode</h2>
          <div className="space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center w-full py-3 px-3 rounded-xl transition-all ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-indigo-100 to-pink-100 border border-pink-300 shadow-inner'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <section className="lg:col-span-3 flex flex-col items-center w-full max-w-4xl mx-auto animate-fade-in">
          {/* Camera Tab */}
          {activeTab === 'camera' && (
            <div className="flex flex-col items-center w-full">
              {cameraError && <p className="text-red-500 mb-2">{cameraError}</p>}

              {/* Detection frame */}
              <div className="relative w-full rounded-2xl shadow-lg overflow-hidden border border-white/30 glass">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full aspect-video object-cover"
                />
                {currentEmotion && (
                  <div className="absolute top-2 left-2 bg-white/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/30 text-gray-800 font-semibold capitalize">
                    {currentEmotion}
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="mt-4 flex flex-wrap justify-center gap-4 w-full">
                {!cameraActive ? (
                  <button
                    onClick={startCamera}
                    className="px-6 py-2 bg-indigo-500 text-white rounded-lg shadow-md hover:bg-indigo-600 w-40"
                  >
                    Start Camera
                  </button>
                ) : (
                  <>
                    <button
                      onClick={stopCamera}
                      className="px-6 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 w-40"
                    >
                      Stop Camera
                    </button>
                    <button
                      onClick={captureAndAnalyze}
                      disabled={!modelsLoaded}
                      className={`px-6 py-2 rounded-lg shadow-md text-white w-40 ${
                        modelsLoaded ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300 cursor-not-allowed'
                      }`}
                    >
                      {modelsLoaded ? 'Capture & Analyze' : 'Loading...'}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Text / Photo Tab */}
          {activeTab === 'text' && (
            <TextAnalyzer onEmotionDetected={handleEmotionDetected} geminiAnswer={geminiAnswer} />
          )}

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <Dashboard emotionHistory={emotionHistory} />
          )}
        </section>

        {/* Recommendations */}
        {showRecommendations && currentEmotion && (
          <Recommendations
            emotion={currentEmotion}
            geminiAnswer={geminiAnswer}
            loading={loadingAI}
            onClose={() => setShowRecommendations(false)}
          />
        )}
      </main>
    </div>
  );
}

export default App;
