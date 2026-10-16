import React, { useState, useEffect } from 'react';
import { Wifi, Signal, Battery, Bell } from 'lucide-react';

interface AndroidDeviceFrameProps {
  children: React.ReactNode;
  activeRemindersCount: number;
  onOpenNotifications?: () => void;
  showPhoneChassis?: boolean;
}

export const AndroidDeviceFrame: React.FC<AndroidDeviceFrameProps> = ({
  children,
  activeRemindersCount,
  onOpenNotifications,
  showPhoneChassis = true,
}) => {
  const [currentTime, setCurrentTime] = useState('10:42');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!showPhoneChassis) {
    return (
      <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
        {children}
      </div>
    );
  }

  return (
    <div className="relative mx-auto my-auto w-full max-w-[420px] h-[820px] max-h-[92vh] bg-slate-950 rounded-[48px] p-3 border-4 border-slate-750 android-device-shadow flex flex-col overflow-hidden select-none">
      {/* Physical button accents */}
      <div className="absolute -right-5 top-28 w-1.5 h-12 bg-slate-700 rounded-r-md"></div>
      <div className="absolute -right-5 top-44 w-1.5 h-20 bg-slate-700 rounded-r-md"></div>

      {/* Screen Container */}
      <div className="relative flex-1 bg-slate-950 rounded-[38px] flex flex-col overflow-hidden border border-slate-800">
        {/* Android Status Bar */}
        <div className="h-9 px-6 bg-slate-950 flex items-center justify-between text-xs text-slate-300 z-30 select-none shrink-0 border-b border-slate-900/50">
          {/* Time & Android Notification Indicator */}
          <div className="flex items-center gap-2">
            <span className="font-mono tabular-nums font-semibold tracking-tight text-[12px]">
              {currentTime}
            </span>
            {activeRemindersCount > 0 && (
              <button
                onClick={onOpenNotifications}
                className="flex items-center text-amber-400 hover:text-amber-300"
                title={`${activeRemindersCount} active reminders`}
              >
                <Bell className="w-3 h-3 animate-pulse" />
              </button>
            )}
          </div>

          {/* Punch Hole Camera Notch */}
          <div className="w-4 h-4 bg-black rounded-full border border-slate-800 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-slate-900 rounded-full"></div>
          </div>

          {/* Network and Battery Icons */}
          <div className="flex items-center gap-1.5 text-slate-300 text-[11px]">
            <Signal className="w-3 h-3 text-slate-300" />
            <span className="text-[10px] font-mono font-medium">5G</span>
            <Wifi className="w-3.5 h-3.5 text-slate-300" />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] font-mono tabular-nums">94%</span>
              <Battery className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            </div>
          </div>
        </div>

        {/* Screen Content Viewport */}
        <div className="flex-1 overflow-hidden flex flex-col relative bg-slate-950">
          {children}
        </div>

        {/* Android Bottom Navigation Gesture Bar */}
        <div className="h-6 bg-slate-950 flex items-center justify-center z-30 shrink-0 border-t border-slate-900/50">
          <div className="w-32 h-1 bg-slate-600 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
