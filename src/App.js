import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/home/Home';
import Calender from './components/calender/Calender';
import LifeOnAnime from './components/lifeonanime/LifeOnAnime';
import RandomAnime from './components/randomanime/RandomAnime';
import SubDub from './components/subdub/SubDub';
import Radio from './components/radio/Radio';
import LiveWebsites from './components/livewebsites/LiveWebsites';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/random-anime" element={<RandomAnime />} />
        <Route path="/calender" element={<Calender />} />
        <Route path="/life-on-anime" element={<LifeOnAnime />} />
        <Route path="/sub-vs-dub" element={<SubDub />} />
        <Route path="/radio" element={<Radio />} />
        <Route path="/live-websites" element={<LiveWebsites />} />
      </Routes>
    </Router>
  );
}

export default App;
