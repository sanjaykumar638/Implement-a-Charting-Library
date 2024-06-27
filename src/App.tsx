// src/App.tsx
import React from 'react';
import ChartComponent from './ChartComponent';
import './App.css'

const App = () => {
  return (
    <div className='bg-container'>
      <h1 className='heading'>Timeframe Chart</h1>
      <ChartComponent />
    </div>
  );
};

export default App;
