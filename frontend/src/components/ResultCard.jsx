import React, { useState } from 'react';
import { Lock, Unlock } from 'lucide-react';

const ResultCard = ({ split, onTimeChange, onLockToggle, isDoubles, athleteNames, onWorkSplitChange }) => {
    const isRun = split.type === 'run';
    const [inputValue, setInputValue] = useState(split.suggested_time_formatted);

    // Sync local state with prop when parent updates (e.g. Reset or Global Pace change)
    React.useEffect(() => {
        setInputValue(split.suggested_time_formatted);
    }, [split.suggested_time_formatted]);

    // Status color: if forced (locked) or modified, indicate? 
    // Just indicate Lock status for now.

    const handleBlur = () => {
        onTimeChange(split.station, inputValue);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.target.blur();
        }
    };

    return (
        <div className={`
      relative overflow-hidden rounded-xl p-6 border transition-all duration-300
      ${isRun
                ? 'bg-[#1a1a1a] border-[#333]'
                : 'bg-[#252525] border-hyrox-orange/30'
            }
      ${split.locked ? 'ring-1 ring-hyrox-orange' : ''}
    `}>
            <div className="flex justify-between items-start mb-4">
                <h3 className={`font-bold text-sm truncate pr-2 ${isRun ? 'text-gray-300' : 'text-white'}`}>
                    {split.station}
                </h3>
                <button
                    onClick={() => onLockToggle(split.station)}
                    className="text-gray-500 hover:text-white transition"
                    title={split.locked ? "Unlock time" : "Lock time"}
                >
                    {split.locked ? <Lock size={14} className="text-hyrox-orange" /> : <Unlock size={14} />}
                </button>
            </div>

            <div className="flex items-center">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className="bg-transparent text-3xl font-bold tracking-tighter text-white w-full focus:outline-none focus:border-b focus:border-hyrox-orange transition-colors font-mono"
                    spellCheck="false"
                />
            </div>


            {/* Diff Indicator (future feature based on original vs new) */}
            {split.diff && ( // Assuming split object might carry a diff string in future
                <span className="text-xs text-gray-400 mt-2 block">{split.diff}</span>
            )}

            {isDoubles && !isRun && (
                <div className="mt-4 pt-4 border-t border-gray-700/50 animate-fade-in">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter mb-2">
                        <span className="text-hyrox-orange truncate max-w-[45%]">{athleteNames?.A || 'A'}</span>
                        <span className="text-gray-400 truncate max-w-[45%] text-right">{athleteNames?.B || 'B'}</span>
                    </div>

                    {/* Progress Bar (Visualizing Split) */}
                    <div className="h-2 w-full bg-[#111] rounded-full overflow-hidden flex mb-4 border border-white/5">
                        <div
                            style={{ width: `${split.workSplit?.A || 50}%` }}
                            className="h-full bg-hyrox-orange transition-all duration-500 ease-out shadow-[0_0_10px_rgba(255,107,0,0.3)]"
                        ></div>
                        <div
                            style={{ width: `${split.workSplit?.B || 50}%` }}
                            className="h-full bg-gray-600 transition-all duration-500 ease-out"
                        ></div>
                    </div>

                    {/* Quick Select Buttons */}
                    <div className="flex gap-1 mb-4">
                        {[50, 70, 100].map(val => (
                            <button
                                key={val}
                                onClick={() => onWorkSplitChange(split.station, 'A', val)}
                                className={`flex-1 py-1 text-[8px] font-black rounded border transition-all ${split.workSplit?.A === val
                                        ? 'bg-hyrox-orange text-black border-hyrox-orange'
                                        : 'bg-black text-gray-500 border-[#333] hover:border-gray-500'}`}
                            >
                                {val}/{100 - val}
                            </button>
                        ))}
                    </div>

                    {/* Precise Inputs */}
                    <div className="flex gap-2">
                        <div className="flex-1 relative group">
                            <input
                                type="number"
                                value={split.workSplit?.A || 50}
                                onChange={(e) => onWorkSplitChange(split.station, 'A', e.target.value)}
                                className="w-full bg-black text-hyrox-orange text-xs text-center p-2 rounded border border-[#333] focus:border-hyrox-orange/50 outline-none font-mono font-black"
                            />
                            <span className="absolute right-2 top-2 text-[8px] text-gray-600 pointer-events-none">%</span>
                        </div>
                        <div className="flex-1 relative group">
                            <input
                                type="number"
                                value={split.workSplit?.B || 50}
                                onChange={(e) => onWorkSplitChange(split.station, 'B', e.target.value)}
                                className="w-full bg-black text-gray-400 text-xs text-center p-2 rounded border border-[#333] focus:border-gray-400/50 outline-none font-mono font-black"
                            />
                            <span className="absolute right-2 top-2 text-[8px] text-gray-600 pointer-events-none">%</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResultCard;
