
import React, { useEffect, useRef, useContext, useState } from 'react';
import { ChartElement, BackgroundDefinition } from '../types';
import { PresentationContext } from '../presentationContext';
import { hexToRgba } from '../utils';
import Chart from 'chart.js/auto';

interface ChartRendererProps {
  element: ChartElement;
  background?: BackgroundDefinition;
}

const ChartRenderer: React.FC<ChartRendererProps> = ({ element, background: propBackground }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null);
  const { state } = useContext(PresentationContext);
  const [error, setError] = useState<string | null>(null);

  const background = propBackground || state.currentSlide?.background || { color: '#ffffff', primaryTextColor: '#000', secondaryTextColor: '#333' };

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const { chartType, data } = element;
    
    // Safety check for data
    if (!data || !data.datasets) {
        return;
    }

    const colors = background.chartColors || ['#3b82f6', '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#6366f1', '#a855f7'];
    
    const createGradient = (color: string) => {
        try {
            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, hexToRgba(color, 0.2));
            return gradient;
        } catch (e) {
            return color;
        }
    };

    const formattedData = {
      labels: data.labels || [],
      datasets: data.datasets.map((ds, i) => {
        const baseColor = colors[i % colors.length];
        return {
          label: ds.label || `Series ${i+1}`,
          data: ds.data || [],
          backgroundColor: chartType === 'PIE' 
            ? (data.labels || []).map((_, idx) => colors[idx % colors.length])
            : createGradient(baseColor),
          borderColor: baseColor,
          borderWidth: 2,
          borderRadius: 4,
          tension: 0.3,
          fill: chartType === 'LINE' ? 'origin' : true,
          pointBackgroundColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4
        };
      })
    };

    try {
        chartInstanceRef.current = new Chart(ctx, {
        type: chartType.toLowerCase() as any,
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
                font: { size: 12, family: 'Inter', weight: '500' },
                color: background.secondaryTextColor
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                padding: 10,
                cornerRadius: 8,
                titleFont: { family: 'Inter', size: 13 },
                bodyFont: { family: 'Inter', size: 12 }
            }
            },
            scales: chartType === 'PIE' ? {} : {
            y: {
                beginAtZero: true,
                ticks: { font: { size: 11, family: 'Inter' }, color: background.secondaryTextColor },
                grid: { color: hexToRgba(background.secondaryTextColor, 0.1), drawBorder: false }
            },
            x: {
                ticks: { font: { size: 11, family: 'Inter' }, color: background.secondaryTextColor },
                grid: { display: false }
            }
            }
        }
        });
    } catch (e: any) {
        console.error("Chart Rendering Error:", e);
        setError("Could not render chart.");
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [element, background]);

  if (error) {
      return <div className="w-full h-full flex items-center justify-center text-red-500 border border-red-200 bg-red-50 rounded-lg">{error}</div>
  }

  return (
    <div className="w-full h-full p-4 bg-transparent flex items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default ChartRenderer;
