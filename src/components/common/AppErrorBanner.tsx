'use client';

import { IconAlertTriangle } from '@tabler/icons-react';
import classNames from 'classnames';

interface AppErrorBannerProps {
  onReload?: () => void;
  className?: string;
}

export const AppErrorBanner: React.FC<AppErrorBannerProps> = ({ onReload, className }) => {
  const handleReload = () => {
    if (onReload) return onReload();
    window.location.reload();
  };

  return (
    <div className={classNames('relative flex size-full flex-row', className)}>
      <div className="size-full flex-1">
        <div className="flex size-full flex-col items-center justify-center gap-4">
          <IconAlertTriangle size={80} stroke={0.5} role="alert" />
          <div className="text-center text-lg font-semibold">Something went wrong</div>
          <div className="text-center text-sm text-secondary">We ran into an unexpected error. Please try again.</div>
          <button onClick={handleReload} className="button button-primary">
            Reload
          </button>
        </div>
      </div>
    </div>
  );
};
