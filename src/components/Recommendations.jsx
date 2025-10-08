import React from 'react';
import { X } from 'lucide-react';

const Recommendations = ({ emotion, geminiAnswer, loading, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-400 to-gray-500 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <h2 className="text-2xl font-bold capitalize">Feeling {emotion}?</h2>
          <p className="text-white/90">{loading ? "Fetching suggestions..." : "Here are some suggestions for you"}</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!loading && geminiAnswer ? (
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <p className="text-gray-800 font-medium">{geminiAnswer}</p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <p className="text-gray-800 font-medium">No suggestions yet.</p>
            </div>
          )}

          <div className="text-center pt-4">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
            >
              I'll Try These Suggestions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
