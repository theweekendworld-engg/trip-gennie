'use client';

import { motion } from 'framer-motion';
import type { WeatherInfo, AirQuality, BestVisitTime } from '../../types/destination';

interface WeatherWidgetProps {
    weatherInfo: WeatherInfo | null;
    airQuality: AirQuality | null;
    bestVisitTime: BestVisitTime | null;
}

export default function WeatherWidget({ weatherInfo, airQuality, bestVisitTime }: WeatherWidgetProps) {
    if (!weatherInfo && !airQuality) {
        return null;
    }

    const getAQIColor = (aqi: number) => {
        if (aqi <= 50) return 'bg-green-500';
        if (aqi <= 100) return 'bg-yellow-500';
        if (aqi <= 150) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const getWeatherEmoji = (condition: string) => {
        const lower = condition.toLowerCase();
        if (lower.includes('sun') || lower.includes('clear')) return '☀️';
        if (lower.includes('cloud')) return '☁️';
        if (lower.includes('rain')) return '🌧️';
        if (lower.includes('storm')) return '⛈️';
        return '🌤️';
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="absolute top-4 right-4 z-10"
        >
            <div className="card-glass p-4 space-y-3 backdrop-blur-md bg-white/90 dark:bg-gray-900/90 shadow-xl">
                {weatherInfo && (
                    <div className="flex items-center gap-3">
                        <span className="text-4xl">{getWeatherEmoji(weatherInfo.condition)}</span>
                        <div>
                            <div className="text-2xl font-bold">{weatherInfo.temp}°C</div>
                            <div className="text-xs text-muted-foreground">{weatherInfo.condition}</div>
                        </div>
                    </div>
                )}

                {weatherInfo && (
                    <div className="flex items-center gap-2 text-sm">
                        <span>💧</span>
                        <span className="text-muted-foreground">Humidity: {weatherInfo.humidity}%</span>
                    </div>
                )}

                {airQuality && (
                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/50">
                        <div className="text-sm">
                            <div className="text-xs text-muted-foreground">Air Quality</div>
                            <div className="font-medium">{airQuality.status}</div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-white text-xs font-bold ${getAQIColor(airQuality.aqi)}`}>
                            AQI {airQuality.aqi}
                        </div>
                    </div>
                )}

                {bestVisitTime && bestVisitTime.best_months && bestVisitTime.best_months.length > 0 && (
                    <div className="pt-2 border-t border-border/50">
                        <div className="text-xs text-muted-foreground mb-1">Best Time to Visit</div>
                        <div className="flex flex-wrap gap-1">
                            {bestVisitTime.best_months.slice(0, 3).map((month) => (
                                <span
                                    key={month}
                                    className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded text-xs font-medium"
                                >
                                    {month.slice(0, 3)}
                                </span>
                            ))}
                            {bestVisitTime.best_months.length > 3 && (
                                <span className="px-2 py-0.5 text-xs text-muted-foreground">
                                    +{bestVisitTime.best_months.length - 3} more
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
