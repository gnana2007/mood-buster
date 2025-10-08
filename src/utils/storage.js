const STORAGE_KEY = 'emotion-detector-data';

export const getStoredEmotions = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const data = JSON.parse(stored);
    return data.map((item) => ({
      ...item,
      timestamp: new Date(item.timestamp)
    }));
  } catch (error) {
    console.error('Error loading stored emotions:', error);
    return [];
  }
};

export const storeEmotion = (emotion) => {
  try {
    const existing = getStoredEmotions();
    const updated = [emotion, ...existing].slice(0, 1000); // Keep last 1000 entries
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error storing emotion:', error);
  }
};

export const clearEmotionData = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing emotion data:', error);
  }
};

export const exportEmotionData = () => {
  try {
    const data = getStoredEmotions();
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Error exporting emotion data:', error);
    return '[]';
  }
};