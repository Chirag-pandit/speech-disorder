import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppSidebar } from './components/AppSidebar';
import Dashboard from './pages/Dashboard';
import Activities from './pages/Activities';
import Practice from './pages/Practice';
import Journal from './pages/Journal';
import Reminder from './pages/Reminder';
import Progress from './pages/Progress';
import Settings from './pages/Settings';
import KaraokeTherapy from './pages/karaoke';
import Chat from './pages/chat';
import VoiceRecognition from './pages/recogination';

// Demo pages with long content to test scrolling
const Recognition = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-gray-800 mb-4">Recognition</h1>
    <p className="text-gray-600 mb-8">Recognition features and tools.</p>
    
    <div className="space-y-6">
      {Array.from({ length: 15 }, (_, i) => (
        <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Recognition Feature {i + 1}</h3>
          <p className="text-gray-600">
            Advanced recognition capabilities for better care management. Test scrolling with long content.
          </p>
        </div>
      ))}
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <AppSidebar />
        <main className="lg:ml-64 min-h-screen">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/reminders" element={<Reminder />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/karaoke" element={<KaraokeTherapy />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/recogination" element={<VoiceRecognition />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;