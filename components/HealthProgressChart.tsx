import React from 'react';
import { HealthPrediction } from '../types';
import { APP_COLORS } from '../constants';

type StoredHealthPrediction = HealthPrediction & { date: string };

interface HealthProgressChartProps {
  history: StoredHealthPrediction[];
}

const HealthProgressChart: React.FC<HealthProgressChartProps> = ({ history }) => {
  if (history.length < 2) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
        <p className="text-gray-500 text-center p-4">
          Need at least two health scores to show progress. Keep tracking!
        </p>
      </div>
    );
  }

  // Copy before sort to avoid mutating props
  const sortedHistory = [...history].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const svgWidth = 350;
  const svgHeight = 150;
  const margin = { top: 20, right: 20, bottom: 30, left: 30 };
  const width = svgWidth - margin.left - margin.right;
  const height = svgHeight - margin.top - margin.bottom;

  const minScore = 0;
  const maxScore = 100;

  const points = sortedHistory
    .map((item, index) => {
      const x = (index / (sortedHistory.length - 1)) * width;
      const y = height - ((item.healthScore - minScore) / (maxScore - minScore)) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="w-full overflow-x-auto p-2">
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="font-sans">
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Y Axis */}
          <line x1="0" y1="0" x2="0" y2={height} stroke="#d1d5db" />
          {[0, 25, 50, 75, 100].map((val) => {
            const y = height - (val / maxScore) * height;
            return (
              <g key={val}>
                <line x1="-5" y1={y} x2={width} y2={y} stroke="#e5e7eb" strokeDasharray="2" />
                <text x="-10" y={y + 3} textAnchor="end" fontSize="10" fill="#6b7280">
                  {val}
                </text>
              </g>
            );
          })}
          <text
            transform={`rotate(-90)`}
            y={-margin.left + 10}
            x={-height / 2}
            dy="1em"
            textAnchor="middle"
            fontSize="10"
            fill="#374151"
            fontWeight="bold"
          >
            Score
          </text>

          {/* X Axis */}
          <line x1="0" y1={height} x2={width} y2={height} stroke="#d1d5db" />
          {sortedHistory.map((item, index) => {
            const x = (index / (sortedHistory.length - 1)) * width;
            return (
              <g key={item.date}>
                <text x={x} y={height + 15} textAnchor="middle" fontSize="9" fill="#6b7280">
                  {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </text>
              </g>
            );
          })}
          <text
            x={width / 2}
            y={height + margin.bottom - 5}
            textAnchor="middle"
            fontSize="10"
            fill="#374151"
            fontWeight="bold"
          >
            Date
          </text>

          {/* Data Line */}
          <polyline fill="none" stroke={APP_COLORS.primary} strokeWidth="2" points={points} />
          {/* Data Points */}
          {sortedHistory.map((item, index) => {
            const x = (index / (sortedHistory.length - 1)) * width;
            const y = height - ((item.healthScore - minScore) / (maxScore - minScore)) * height;
            return <circle key={index} cx={x} cy={y} r="3" fill={APP_COLORS.primary} />;
          })}
        </g>
      </svg>
    </div>
  );
};

export default HealthProgressChart;
