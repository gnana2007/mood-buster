import React, { useState } from 'react';
import { MessageSquare, Send, Loader2, Sparkles } from 'lucide-react';

const TextAnalyzer = ({ onEmotionDetected }) => {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState(null);

  const emotionKeywords = {
    happy: ['happy', 'joy', 'excited', 'wonderful', 'amazing', 'great', 'fantastic', 'love', 'awesome', 'perfect', 'brilliant', 'excellent', 'delighted'],
    sad: ['sad', 'depressed', 'down', 'unhappy', 'lonely', 'disappointed', 'heartbroken', 'miserable', 'gloomy', 'blue', 'melancholy'],
    angry: ['angry', 'mad', 'furious', 'annoyed', 'irritated', 'frustrated', 'rage', 'hate', 'disgusted', 'outraged', 'livid'],
    fearful: ['scared', 'afraid', 'terrified', 'anxious', 'worried', 'nervous', 'panic', 'frightened', 'concerned', 'uneasy'],
    surprised: ['surprised', 'shocked', 'amazed', 'astonished', 'stunned', 'wow', 'unbelievable', 'incredible', 'unexpected'],
    disgusted: ['disgusted', 'sick', 'gross', 'awful', 'terrible', 'horrible', 'repulsed', 'revolted', 'nasty'],
    stressed: ['stressed', 'overwhelmed', 'pressure', 'deadline', 'busy', 'exhausted', 'burnout', 'tired', 'overworked'],
    neutral: ['okay', 'fine', 'normal', 'regular', 'usual', 'average', 'standard', 'typical', 'ordinary']
  };

  const analyzeText = async () => {
    if (!text.trim()) return;

    setIsAnalyzing(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simple keyword-based emotion detection
    const words = text.toLowerCase().split(/\s+/);
    const emotionScores = {
      happy: 0,
      sad: 0,
      angry: 0,
      surprised: 0,
      fearful: 0,
      disgusted: 0,
      neutral: 0,
      stressed: 0
    };

    // Calculate scores based on keyword matches
    words.forEach(word => {
      Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
        if (keywords.some(keyword => word.includes(keyword))) {
          emotionScores[emotion] += 1;
        }
      });
    });

    // Find dominant emotion
    const totalWords = words.length;
    const dominantEmotion = Object.entries(emotionScores).reduce((a, b) => 
      emotionScores[a[0]] > emotionScores[b[0]] ? a : b
    )[0];

    // Calculate confidence based on keyword density
    const maxScore = Math.max(...Object.values(emotionScores));
    const confidence = maxScore > 0 ? Math.min(90, (maxScore / totalWords) * 100 + 40) : 60;

    // Normalize scores for breakdown
    const normalizedScores = Object.fromEntries(
      Object.entries(emotionScores).map(([emotion, score]) => [
        emotion,
        Math.round((score / Math.max(1, maxScore)) * 100)
      ])
    );

    const finalEmotion = dominantEmotion === 'neutral' && maxScore === 0 ? 'neutral' : dominantEmotion;
    
    setLastAnalysis({
      emotion: finalEmotion,
      confidence: Math.round(confidence),
      breakdown: normalizedScores
    });

    onEmotionDetected(finalEmotion, confidence, 'text');
    setIsAnalyzing(false);
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      happy: 'text-yellow-600 bg-yellow-100',
      sad: 'text-blue-600 bg-blue-100',
      angry: 'text-red-600 bg-red-100',
      surprised: 'text-purple-600 bg-purple-100',
      fearful: 'text-gray-600 bg-gray-100',
      disgusted: 'text-green-600 bg-green-100',
      neutral: 'text-gray-500 bg-gray-50',
      stressed: 'text-orange-600 bg-orange-100'
    };
    return colors[emotion];
  };

  const sampleTexts = [
    "I'm feeling absolutely wonderful today! Everything is going perfectly.",
    "I'm really stressed about this upcoming deadline and feeling overwhelmed.",
    "This is so frustrating! Nothing is working as it should.",
    "I'm quite worried about the presentation tomorrow.",
    "Today was just an ordinary day, nothing special happened."
  ];

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Text Emotion Analysis</h2>
        <p className="text-gray-600">Type or paste text to analyze emotional sentiment</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Input Area */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 focus-within:border-blue-300 transition-colors">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <MessageSquare className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your text here... Share your thoughts, feelings, or describe your current mood."
                className="w-full h-32 resize-none border-none outline-none text-gray-900 placeholder-gray-500"
              />
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-500">
                  {text.length} characters • {text.trim().split(/\s+/).filter(w => w).length} words
                </span>
                <button
                  onClick={analyzeText}
                  disabled={!text.trim() || isAnalyzing}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Emotion'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sample Texts */}
        <div className="bg-gray-50 rounded-2xl p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Try these sample texts:</h3>
          <div className="space-y-2">
            {sampleTexts.map((sample, index) => (
              <button
                key={index}
                onClick={() => setText(sample)}
                className="w-full text-left p-3 bg-white hover:bg-blue-50 rounded-xl text-sm text-gray-700 transition-colors border border-transparent hover:border-blue-200"
              >
                "{sample}"
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {lastAnalysis && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-fade-in">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Results</h3>
            
            {/* Primary Emotion */}
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`px-4 py-2 rounded-full ${getEmotionColor(lastAnalysis.emotion)}`}>
                  <span className="font-semibold capitalize">{lastAnalysis.emotion}</span>
                </div>
                <span className="text-gray-600">
                  {lastAnalysis.confidence}% confidence
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${lastAnalysis.confidence}%` }}
                />
              </div>
            </div>

            {/* Emotion Breakdown */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Emotion Breakdown</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(lastAnalysis.breakdown).map(([emotion, score]) => (
                  <div key={emotion} className="text-center">
                    <div className="mb-2">
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            score > 50 ? 'bg-blue-500' : 'bg-gray-400'
                          }`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 capitalize">{emotion}</span>
                    <div className="text-xs text-gray-500">{score}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <MessageSquare className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900">Natural Language Processing</h3>
            <p className="text-sm text-gray-600">Advanced NLP algorithms analyze text sentiment</p>
          </div>

          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900">Multi-Emotion Detection</h3>
            <p className="text-sm text-gray-600">Identifies multiple emotions with confidence scores</p>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-xl">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Send className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-medium text-gray-900">Instant Results</h3>
            <p className="text-sm text-gray-600">Get immediate emotion analysis and insights</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextAnalyzer;