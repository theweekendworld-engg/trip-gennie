'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

interface Option {
    value: string;
    label: string;
    subtitle?: string;
}

interface SearchableSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    emptyMessage?: string;
}

export default function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = 'Search...',
    className = '',
    emptyMessage = 'No results found',
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(search.toLowerCase()) ||
        option.subtitle?.toLowerCase().includes(search.toLowerCase())
    );

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === 'Enter' || e.key === ' ') {
                setIsOpen(true);
                e.preventDefault();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev < filteredOptions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
                break;
            case 'Enter':
                e.preventDefault();
                if (filteredOptions[highlightedIndex]) {
                    onChange(filteredOptions[highlightedIndex].value);
                    setIsOpen(false);
                    setSearch('');
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setSearch('');
                break;
        }
    };

    return (
        <div ref={containerRef} className={cn('relative', className)}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-left flex items-center justify-between hover:border-primary-500 transition-colors"
            >
                <span className={cn(
                    selectedOption ? 'text-foreground' : 'text-muted-foreground'
                )}>
                    {selectedOption?.label || placeholder}
                </span>
                <svg
                    className={cn(
                        'w-5 h-5 text-muted-foreground transition-transform',
                        isOpen && 'rotate-180'
                    )}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden"
                    >
                        <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                            <input
                                ref={inputRef}
                                type="text"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setHighlightedIndex(0);
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder="Type to search..."
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                            {filteredOptions.length === 0 ? (
                                <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                                    {emptyMessage}
                                </div>
                            ) : (
                                filteredOptions.map((option, index) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => {
                                            onChange(option.value);
                                            setIsOpen(false);
                                            setSearch('');
                                        }}
                                        className={cn(
                                            'w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
                                            index === highlightedIndex && 'bg-gray-100 dark:bg-gray-700',
                                            option.value === value && 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                        )}
                                    >
                                        <div className="font-medium">{option.label}</div>
                                        {option.subtitle && (
                                            <div className="text-xs text-muted-foreground mt-0.5">
                                                {option.subtitle}
                                            </div>
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
