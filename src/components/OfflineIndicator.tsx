import { WifiOff } from 'lucide-react';

interface OfflineIndicatorProps {
  isOffline: boolean;
}

export default function OfflineIndicator({ isOffline }: OfflineIndicatorProps) {
  if (!isOffline) return null;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 animate-fadeIn">
      <div className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-full shadow-medium text-xs font-semibold">
        <WifiOff size={14} />
        <span>You're offline. Some features may be limited.</span>
      </div>
    </div>
  );
}
