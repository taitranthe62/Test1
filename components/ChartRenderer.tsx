
import React, { useEffect, useRef, useContext } from 'react';
import { ChartElement, BackgroundDefinition } from '../types';
import { PresentationContext } from '../presentationContext';
import { hexToRgba } from '../utils';

declare const Chart: any;

interface ChartRendererProps {
  element: ChartElement;
  background?: BackgroundDefinition;
}

const ChartRenderer: React.FC<ChartRendererProps> = ({ element, background: propBackground }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null);
  const { state } = useContext(PresentationContext);

  const background = propBackground || state.currentSlide?.background || { color: '#ffffff', primaryTextColor: '#000', secondaryTextColor: '#333' };

  useEffect(() => {
    if (!canvasRef.current || !window.hasOwnProperty('Chart')) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const { chartType, data } = element;
    const colors = background.chartColors || ['#3b82f6', '#ef4444', '#f97316', '#eab308', '#22c55e'];
    
    // Tạo gradient cho mỗi dataset
    const createGradient = (color: string) => {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, hexToRgba(color, 0.2));
        return gradient;
    };

    const formattedData = {
      labels: data.labels,
      datasets: data.datasets.map((ds, i) => {
        const baseColor = colors[i % colors.length];
        return {
          label: ds.label,
          data: ds.data,
          backgroundColor: chartType === 'PIE' 
            ? data.labels.map((_, idx) => colors[idx % colors.length])
            : createGradient(baseColor),
          borderColor: baseColor,
          borderWidth: 2,
          borderRadius: 6, // Rounded bars
          tension: 0.4,
          fill: chartType === 'LINE' ? 'origin' : true
        };
      })
    };

    chartInstanceRef.current = new Chart(ctx, {
      type: chartType.toLowerCase(),
      data: formattedData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: chartType === 'PIE' ? 'right' : 'top',
            labels: {
              usePointStyle: true,
              font: { size: 11, family: 'Inter', weight: '600' },
              color: background.secondaryTextColor
            }
          }
        },
        scales: chartType === 'PIE' ? {} : {
          y: {
            beginAtZero: true,
            ticks: { font: { size: 10 }, color: background.secondaryTextColor },
            grid: { color: hexToRgba(background.secondaryTextColor, 0.1), drawBorder: false }
          },
          x: {
            ticks: { font: { size: 10 }, color: background.secondaryTextColor },
            grid: { display: false }
          }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [element, background]);

  return (
    <div className="w-full h-full p-4 bg-transparent flex items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default ChartRenderer;
