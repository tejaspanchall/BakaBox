import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/home/Home';
import Calender from './components/calender/Calender';
import LifeOnAnime from './components/lifeonanime/LifeOnAnime';
import RandomAnime from './components/randomanime/RandomAnime';
import Tracking from './components/tracking/Tracking';
import Wallpapers from './components/wallpapers/Wallpapers';
import Websites from './components/websites/Websites';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/random-anime" element={<RandomAnime />} />
        <Route path="/calender" element={<Calender />} />
        <Route path="/life-on-anime" element={<LifeOnAnime />} />
        <Route path="/tracking" element={<Tracking />} />
        <Route path="/wallpapers" element={<Wallpapers />} />
        <Route path="/websites" element={<Websites />} />
      </Routes>
    </Router>
  );
}

export default App;
