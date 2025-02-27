import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/home/Home';
import Calender from './components/calender/Calender';
import LifeOnAnime from './components/lifeonanime/LifeOnAnime';
import RandomAnime from './components/randomanime/RandomAnime';
import Radio from './components/radio/Radio';
import WhereToWatch from './components/wheretowatch/WhereToWatch';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/random-anime" element={<RandomAnime />} />
        <Route path="/calender" element={<Calender />} />
        <Route path="/life-on-anime" element={<LifeOnAnime />} />
        <Route path="/radio" element={<Radio />} />
        <Route path="/where-to-watch" element={<WhereToWatch />} />
      </Routes>
    </Router>
  );
}

export default App;