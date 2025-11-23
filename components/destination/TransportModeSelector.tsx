'use client';

import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface TransportModeSelectorProps {
    selectedMode: string;
    onModeChange: (mode: string) => void;
    modes: Array<{ value: string; label: string; emoji: string }>;
}

export default function TransportModeSelector({ selectedMode, onModeChange, modes }: TransportModeSelectorProps) {
    return (
        <div className="relative bg-muted/30 p-1 rounded-xl backdrop-blur-sm">
            <div className="relative flex gap-1">
                {modes.map((mode) => {
                    const isSelected = selectedMode === mode.value;
                    return (
                        <button
                            key={mode.value}
                            onClick={() => onModeChange(mode.value)}
                            className={cn(
                                "relative flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200",
                                "hover:scale-[1.02] active:scale-[0.98]",
                                isSelected
                                    ? "text-white shadow-lg"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {isSelected && (
                                <motion.div
                                    layoutId="activeMode"
                                    className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                <span className="text-lg">{mode.emoji}</span>
                                <span>{mode.label}</span>
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
