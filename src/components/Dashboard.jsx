import React, { useMemo } from 'react';
import { BarChart3, Calendar, Target } from 'lucide-react';

const Dashboard = ({ emotionHistory, currentUserId }) => {
  // Filter history for the current user only
  const userHistory = useMemo(
    () => emotionHistory.filter(e => e.userId === currentUserId),
    [emotionHistory, currentUserId]
  );

  const stats = useMemo(() => {
    if (userHistory.length === 0) {
      return {
        totalDetections: 0,
        todayDetections: 0,
        dominantEmotion: 'neutral',
        averageConfidence: 0,
        emotionDistribution: {},
        hourlyActivity: Array(24).fill(0),
        weeklyTrend: Array(7).fill(0)
      };
    }

    const today = new Date();

    // Detections for today
    const todayDetections = userHistory.filter(
      e => e.timestamp.toDateString() === today.toDateString()
    ).length;

    // Emotion counts
    const emotionCounts = {
      happy: 0, sad: 0, angry: 0, surprised: 0,
      fearful: 0, disgusted: 0, neutral: 0, stressed: 0
    };
    userHistory.forEach(e => { emotionCounts[e.emotion]++; });

    // Dominant emotion
    const dominantEmotion = Object.entries(emotionCounts).reduce((a, b) =>
      emotionCounts[a[0]] > emotionCounts[b[0]] ? a : b
    )[0];

    // Average confidence
    const averageConfidence = Math.round(
      userHistory.reduce((sum, e) => sum + e.confidence, 0) / userHistory.length
    );

    // Hourly activity
    const hourlyActivity = Array(24).fill(0);
    userHistory.forEach(e => hourlyActivity[e.timestamp.getHours()]++);

    // Weekly trend
    const weeklyTrend = Array(7).fill(0);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    userHistory.forEach(e => {
      if (e.timestamp >= weekAgo) weeklyTrend[e.timestamp.getDay()]++;
    });

    return {
      totalDetections: userHistory.length,
      todayDetections,
      dominantEmotion,
      averageConfidence,
      emotionDistribution: emotionCounts,
      hourlyActivity,
      weeklyTrend
    };
  }, [userHistory]);

  const getEmotionIcon = (emotion) => {
    const icons = {
      happy: '😊', sad: '😢', angry: '😠', surprised: '😲',
      fearful: '😨', disgusted: '🤢', neutral: '😐', stressed: '😰'
    };
    return icons[emotion];
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      happy: 'bg-yellow-100 text-yellow-700',
      sad: 'bg-blue-100 text-blue-700',
      angry: 'bg-red-100 text-red-700',
      surprised: 'bg-purple-100 text-purple-700',
      fearful: 'bg-gray-100 text-gray-700',
      disgusted: 'bg-green-100 text-green-700',
      neutral: 'bg-gray-50 text-gray-600',
      stressed: 'bg-orange-100 text-orange-700'
    };
    return colors[emotion];
  };

  if (userHistory.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Data Yet</h2>
          <p className="text-gray-600 mb-6">
            Start using face detection or text analysis to see your emotion insights here.
          </p>
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-sm text-blue-700">
              Your emotional well-being data will appear here once you begin using the detection features.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Get max for user-specific scaling
  const maxHourly = Math.max(...stats.hourlyActivity, 1);
  const maxWeekly = Math.max(...stats.weeklyTrend, 1);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Emotion Dashboard</h2>
        <p className="text-gray-600">Track your emotional patterns and well-being over time</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-blue-700">{stats.totalDetections}</span>
          </div>
          <h3 className="font-semibold text-blue-900">Total Detections</h3>
          <p className="text-sm text-blue-600">All-time emotion tracking</p>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-200 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-green-700">{stats.todayDetections}</span>
          </div>
          <h3 className="font-semibold text-green-900">Today's Sessions</h3>
          <p className="text-sm text-green-600">Emotions detected today</p>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-200 rounded-xl flex items-center justify-center">
              <span className="text-xl">{getEmotionIcon(stats.dominantEmotion)}</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getEmotionColor(stats.dominantEmotion)}`}>
              {stats.dominantEmotion}
            </div>
          </div>
          <h3 className="font-semibold text-purple-900">Dominant Emotion</h3>
          <p className="text-sm text-purple-600">Most frequent mood</p>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-200 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-2xl font-bold text-orange-700">{stats.averageConfidence}%</span>
          </div>
          <h3 className="font-semibold text-orange-900">Avg. Confidence</h3>
          <p className="text-sm text-orange-600">Detection accuracy</p>
        </div>
      </div>

      {/* Emotion Distribution */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Emotion Distribution</h3>
        <div className="space-y-4">
          {Object.entries(stats.emotionDistribution).map(([emotion, count]) => {
            const percentage = stats.totalDetections > 0 ? (count / stats.totalDetections) * 100 : 0;
            return (
              <div key={emotion} className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 w-32">
                  <span className="text-xl">{getEmotionIcon(emotion)}</span>
                  <span className="font-medium capitalize text-gray-900">{emotion}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600 w-12">
                      {Math.round(percentage)}%
                    </span>
                    <span className="text-sm text-gray-500 w-8">
                      ({count})
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Activity */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Hourly Activity</h3>
          <div className="space-y-2">
            {stats.hourlyActivity.map((count, hour) => {
              const percentage = (count / maxHourly) * 100;
              return (
                <div key={hour} className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600 w-8">
                    {hour.toString().padStart(2, '0')}:00
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600 w-8">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Trend */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Weekly Trend</h3>
          <div className="space-y-3">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => {
              const count = stats.weeklyTrend[index];
              const percentage = (count / maxWeekly) * 100;
              return (
                <div key={day} className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600 w-20">{day}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-purple-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600 w-8">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
