// src/ChartComponent.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Chart, ChartData, ChartOptions, registerables } from 'chart.js';
import './ChartComponent.css';

Chart.register(...registerables);
Chart.register(zoomPlugin);

interface DataPoint {
  timestamp: string;
  value: number;
}

const fetchData = async (): Promise<DataPoint[]> => {
  const response = await fetch('/data.json');
  const data = await response.json();
  return data;
};

const ChartComponent: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData<'line'>>({ datasets: [] });
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('day');
  const chartRef = useRef<Chart<'line'>>(null);

  useEffect(() => {
    const processChartData = (data: DataPoint[]) => {
      const labels = data.map(item => new Date(item.timestamp));
      const values = data.map(item => item.value);

      return {
        labels,
        datasets: [
          {
            label: 'Value over Time',
            data: values,
            fill: false,
            backgroundColor: 'rgba(75,192,192,0.2)',
            borderColor: 'rgba(75,192,192,1)',
          },
        ],
      };
    };

    fetchData().then(data => setChartData(processChartData(data)));
  }, []);

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: timeframe,
        },
      },
    },
    plugins: {
      zoom: {
        pan: {
          enabled: true,
          mode: 'x',
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: 'x',
        },
      },
    },
    onClick: (e, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const datasetIndex = elements[0].datasetIndex;
        const dataPoint = chartData.datasets[datasetIndex].data[index] as number;
        const label = chartData.labels?.[index] as Date;
        alert(`Data point: ${dataPoint}\nLabel: ${label}`);
      }
    },
  };

  const handleTimeframeChange = (newTimeframe: 'day' | 'week' | 'month') => {
    setTimeframe(newTimeframe);
  };

  const exportChart = (format: 'png' | 'jpg') => {
    const chart = chartRef.current;
    if (chart) {
      const url = chart.toBase64Image(`image/${format}`);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chart.${format}`;
      link.click();
    }
  };

  return (
    <div className="chart-container">
      <div className="controls">
        <button onClick={() => handleTimeframeChange('day')}>Daily</button>
        <button onClick={() => handleTimeframeChange('week')}>Weekly</button>
        <button onClick={() => handleTimeframeChange('month')}>Monthly</button>
      </div>
      <div className="export-controls">
        <button onClick={() => exportChart('png')}>Export as PNG</button>
        <button onClick={() => exportChart('jpg')}>Export as JPG</button>
      </div>
      <div className="chart-wrapper">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
};

export default ChartComponent;
