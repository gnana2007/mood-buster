import React, { useState, useRef, useEffect } from 'react';
import { Camera, CameraOff, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

const EmotionDetector = ({ onEmotionDetected, onCapturePhoto }) => {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detectedEmotion, setDetectedEmotion] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('prompt');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  const emotions = ['happy', 'sad', 'angry', 'surprised', 'fearful', 'disgusted', 'neutral', 'stressed'];

  useEffect(() => {
    checkCameraPermission();
    return () => stopCamera();
  }, []);

  const checkCameraPermission = async () => {
    try {
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'camera' });
        setPermissionStatus(permission.state);
        permission.addEventListener('change', () => setPermissionStatus(permission.state));
      }
    } catch (err) {
      console.log('Permission API not supported');
    }
  };

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const constraints = {
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
            .then(() => {
              setIsActive(true);
              setPermissionStatus('granted');

              intervalRef.current = setInterval(simulateEmotionDetection, 3000);
            })
            .catch(err => setError('Failed to play video'));
        };
      }
    } catch (err) {
      console.error(err);
      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera permissions.');
        setPermissionStatus('denied');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found.');
      } else if (err.name === 'NotReadableError') {
        setError('Camera is already in use.');
      } else {
        setError('Unable to access camera.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;

    setIsActive(false);
    setDetectedEmotion(null);
  };

  const simulateEmotionDetection = () => {
    const weights = { happy: 0.25, neutral: 0.20, surprised: 0.15, sad: 0.10, stressed: 0.10, angry: 0.08, fearful: 0.07, disgusted: 0.05 };
    const random = Math.random();
    let cumulative = 0;
    let selectedEmotion = 'neutral';
    for (const [emotion, weight] of Object.entries(weights)) {
      cumulative += weight;
      if (random <= cumulative) {
        selectedEmotion = emotion;
        break;
      }
    }
    const confidence = Math.floor(Math.random() * 25) + 75;
    setDetectedEmotion(selectedEmotion);
    onEmotionDetected(selectedEmotion, confidence, 'camera');
  };

  // ✅ Capture Photo Function
  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const imageDataUrl = canvas.toDataURL('image/png');
    console.log('Captured photo:', imageDataUrl);

    if (onCapturePhoto) onCapturePhoto(imageDataUrl); // send captured image to parent
  };

  const retryCamera = () => { setError(null); startCamera(); };

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Facial Emotion Detection</h2>
        <p className="text-gray-600">Enable your camera to detect emotions in real-time</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="relative bg-gray-900 rounded-2xl overflow-hidden mb-6 aspect-video">
          {isActive ? (
            <>
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              {detectedEmotion && (
                <div className="absolute top-4 left-4 bg-black/70 rounded-xl px-4 py-2">
                  <span className="text-white font-medium capitalize">{detectedEmotion}</span>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <Camera className="w-16 h-16 mx-auto mb-4" />
                <p>Camera is off</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center space-x-4 mb-4">
          {!isActive ? (
            <button onClick={startCamera} className="px-6 py-3 bg-blue-600 text-white rounded-xl">Start Detection</button>
          ) : (
            <>
              <button onClick={stopCamera} className="px-6 py-3 bg-red-600 text-white rounded-xl">Stop Detection</button>
              <button onClick={capturePhoto} className="px-6 py-3 bg-green-600 text-white rounded-xl">Capture Photo</button>
            </>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center justify-between">
            <span>{error}</span>
            <button onClick={retryCamera}><RefreshCw className="w-5 h-5" /></button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmotionDetector;
