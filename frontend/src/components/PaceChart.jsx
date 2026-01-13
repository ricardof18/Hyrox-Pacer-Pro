import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const PaceChart = ({ splits }) => {
    const labels = splits.map(s => s.station);
    const dataPoints = splits.map(s => s.suggested_time_seconds);

    const data = {
        labels,
        datasets: [
            {
                label: 'Seconds per Station',
                data: dataPoints,
                backgroundColor: splits.map(s => s.type === 'run' ? '#333333' : '#FF4500'),
                borderColor: splits.map(s => s.type === 'run' ? '#555555' : '#FF4500'),
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Effort Distribution (Fatigue Analysis)',
                color: '#9CA3AF',
                font: { size: 16 }
            },
            tooltip: {
                callbacks: {
                    // Format tooltip to show time string instead of seconds if possible
                    label: (context) => {
                        const sec = context.raw;
                        const m = Math.floor(sec / 60);
                        const s = sec % 60;
                        return `${m}:${s < 10 ? '0' + s : s}`;
                    }
                }
            }
        },
        scales: {
            y: {
                grid: {
                    color: '#333'
                },
                ticks: {
                    color: '#666'
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: '#999',
                    maxRotation: 45,
                    minRotation: 45
                }
            }
        }
    };

    return <Bar options={options} data={data} />;
};

export default PaceChart;
