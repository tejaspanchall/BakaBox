import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/home/Home';
import Calender from './components/calender/Calender';
import Chat from './components/chat/Chat';
import Suggestion from './components/suggestion/Suggestion';
import Tracking from './components/tracking/Tracking';
import Wallpapers from './components/wallpapers/Wallpapers';
import Websites from './components/websites/Websites';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/calender" element={<Calender />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/suggestion" element={<Suggestion />} />
        <Route path="/tracking" element={<Tracking />} />
        <Route path="/wallpapers" element={<Wallpapers />} />
        <Route path="/websites" element={<Websites />} />
      </Routes>
    </Router>
  );
}

export default App;
