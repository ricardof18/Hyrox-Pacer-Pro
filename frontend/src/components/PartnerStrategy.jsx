
import React from 'react';
import { splitTimeToSeconds, secondsToMMSS } from '../utils/timeUtils';
import Card from './Card';

const PartnerStrategy = ({ splits, athleteNames }) => {
    // 1. Calculate Total Volume %
    const calculateVolume = () => {
        let totalTimeA = 0;
        let totalTimeB = 0;
        let totalExerciseTime = 0;

        splits.forEach(split => {
            if (split.type === 'exercise') {
                const totalSeconds = splitTimeToSeconds(split.suggested_time_formatted);
                const percentA = split.workSplit?.A || 50;
                const percentB = split.workSplit?.B || 50;

                totalTimeA += totalSeconds * (percentA / 100);
                totalTimeB += totalSeconds * (percentB / 100);
                totalExerciseTime += totalSeconds;
            }
        });

        if (totalExerciseTime === 0) return { percentA: 50, percentB: 50 };

        return {
            percentA: Math.round((totalTimeA / totalExerciseTime) * 100),
            percentB: Math.round((totalTimeB / totalExerciseTime) * 100),
            timeA: secondsToMMSS(totalTimeA),
            timeB: secondsToMMSS(totalTimeB)
        };
    };

    const volume = calculateVolume();
    const nameA = athleteNames?.A || 'Athlete A';
    const nameB = athleteNames?.B || 'Athlete B';

    // 2. Generate Recommendations
    const getRecommendation = (split) => {
        if (split.type !== 'exercise') return null;

        const percentA = split.workSplit?.A || 50;
        // Simple logic: He who does MORE starts? Or alternate?
        // User Request: "Recomendação de Transição: O sistema deve indicar quem começa"
        // Let's assume the dominant athlete starts to set pace, or split strategy.
        // Or specific logic: "Atleta A does first X%". 

        if (percentA > 50) return `${nameA} starts (${percentA}%)`;
        if (percentA < 50) return `${nameB} starts (${100 - percentA}%)`;
        return "Equal Split - Alternate";
    };

    return (
        <Card>
            <h3 className="text-xl font-bold text-white mb-4">Partner Strategy</h3>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Volume Summary */}
                <div className="flex-1 space-y-4">
                    <div className="bg-[#121212] p-6 rounded-2xl border border-white/5 ring-1 ring-white/5">
                        <h4 className="text-gray-500 text-[10px] font-black uppercase mb-4 tracking-widest">Distribuição de Esforço Total</h4>
                        <div className="flex items-center gap-6">
                            <div className="text-center min-w-[60px]">
                                <p className="text-3xl font-black text-hyrox-orange leading-none">{volume.percentA}%</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{nameA}</p>
                                <p className="text-[10px] text-gray-600 font-mono mt-0.5">{volume.timeA}</p>
                            </div>
                            <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden flex border border-white/5">
                                <div style={{ width: `${volume.percentA}%` }} className="h-full bg-hyrox-orange shadow-[0_0_10px_rgba(255,107,0,0.3)]"></div>
                                <div style={{ width: `${volume.percentB}%` }} className="h-full bg-gray-500"></div>
                            </div>
                            <div className="text-center min-w-[60px]">
                                <p className="text-3xl font-black text-gray-400 leading-none">{volume.percentB}%</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{nameB}</p>
                                <p className="text-[10px] text-gray-600 font-mono mt-0.5">{volume.timeB}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transition Plan */}
                <div className="flex-1 bg-[#121212] p-4 rounded-lg border border-[#333] max-h-60 overflow-y-auto custom-scrollbar">
                    <h4 className="text-gray-400 text-xs font-bold uppercase mb-2 sticky top-0 bg-[#121212] py-1">Transition Tactics</h4>
                    <ul className="space-y-2">
                        {splits.map((split, idx) => {
                            if (split.type !== 'exercise') return null;
                            const rec = getRecommendation(split);
                            return (
                                <li key={idx} className="flex justify-between text-xs border-b border-gray-800 pb-1 last:border-0">
                                    <span className="text-gray-300">{split.station}</span>
                                    <span className="font-mono text-gray-500">{rec}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </Card>
    );
};

export default PartnerStrategy;
