import React, { useState, useEffect, useRef } from 'react';
import { Brain } from 'lucide-react';
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
      console.log('✅ Face-API models loaded');
    } catch (err) {
      console.error('❌ Error loading models:', err);
    }
  };

  /* -------------------- Emotion handling -------------------- */
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
    setShowRecommendations(true); // show popup after fetching suggestions
  };

  const fetchGeminiResponse = async (emotion) => {
    try {
      setLoadingAI(true);
      setGeminiAnswer('Fetching suggestions...');
      const res = await getGeminiSuggestions(null, emotion); // image null, emotion string
      setGeminiAnswer(res.suggestions || 'No suggestions found.');
    } catch (err) {
      console.error('Gemini fetch error:', err);
      setGeminiAnswer('Could not fetch suggestions. Try again later.');
    } finally {
      setLoadingAI(false);
    }
  };

  /* -------------------- Camera & Detection -------------------- */
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError(err.message);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current) return;
    if (!modelsLoaded) {
      alert('Models are still loading — please wait.');
      return;
    }

    try {
      const options = new faceapi.TinyFaceDetectorOptions({
        inputSize: 224,
        scoreThreshold: 0.5,
      });

      const detection = await faceapi
        .detectSingleFace(videoRef.current, options)
        .withFaceExpressions();

      if (detection && detection.expressions) {
        const sorted = Object.entries(detection.expressions)
          .sort((a, b) => b[1] - a[1]);
        const [emotion, confidence] = sorted[0];
        handleEmotionDetected(emotion, Math.round(confidence * 100), 'camera');
      } else {
        alert('No face detected. Make sure your face is visible and well-lit.');
      }
    } catch (err) {
      console.error('Detection error:', err);
      alert('An error occurred while analyzing the image.');
    }
  };

  // stop camera when component unmounts
  useEffect(() => {
    return () => {
      try {
        stopCamera();
      } catch (e) {
        /* ignore during unmount */
      }
    };
  }, []);

  /* -------------------- Recommendations Popup -------------------- */
 const Recommendations = ({ emotion, geminiAnswer, loading, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] p-6 relative shadow-lg flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close recommendations"
        >
          ×
        </button>
        <h3 className="text-xl font-semibold mb-4 capitalize">
          Suggestions for feeling {emotion}
        </h3>

        {loading ? (
          <p>Loading suggestions...</p>
        ) : (
          <div className="prose max-w-none whitespace-pre-wrap overflow-y-auto flex-grow">
            <ReactMarkdown>
              {geminiAnswer}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};


  /* -------------------- UI -------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Emotion Detector</h1>
                <p className="text-sm text-gray-500">Your Personal Wellness Companion</p>
              </div>
            </div>

            {currentEmotion && (
              <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-sm border">
                <span className="font-medium capitalize">{currentEmotion}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Nav */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Detection Mode</h2>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('camera')}
                  className={`w-full px-4 py-3 rounded-xl ${
                    activeTab === 'camera'
                      ? 'bg-blue-50 border-blue-200 border'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  Face Detection
                </button>

                <button
                  onClick={() => setActiveTab('text')}
                  className={`w-full px-4 py-3 rounded-xl ${
                    activeTab === 'text'
                      ? 'bg-green-50 border-green-200 border'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  Text / Photo
                </button>

                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full px-4 py-3 rounded-xl ${
                    activeTab === 'dashboard'
                      ? 'bg-purple-50 border-purple-200 border'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  Dashboard
                </button>
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6">
                {activeTab === 'camera' && (
                  <div className="flex flex-col items-center space-y-4">
                    {cameraError && <p className="text-red-500">{cameraError}</p>}
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      width={400}
                      height={300}
                      className="border rounded-lg"
                    />

                    <div className="space-x-4">
                      {!cameraActive ? (
                        <button
                          onClick={startCamera}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                          Start Camera
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={stopCamera}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                          >
                            Stop Camera
                          </button>
                          <button
                            onClick={captureAndAnalyze}
                            disabled={!modelsLoaded}
                            className={`px-4 py-2 text-white rounded-lg ${
                              modelsLoaded
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-gray-300 cursor-not-allowed'
                            }`}
                          >
                            {modelsLoaded ? 'Capture & Analyze' : 'Loading models...'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'text' && (
                  <TextAnalyzer
                    onEmotionDetected={handleEmotionDetected}
                    geminiAnswer={geminiAnswer}
                  />
                )}

                {activeTab === 'dashboard' && (
                  <Dashboard emotionHistory={emotionHistory} />
                )}
              </div>

              {/* Recommendations Popup */}
              {showRecommendations && currentEmotion && (
                <Recommendations
                  emotion={currentEmotion}
                  geminiAnswer={geminiAnswer}
                  loading={loadingAI}
                  onClose={() => setShowRecommendations(false)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
