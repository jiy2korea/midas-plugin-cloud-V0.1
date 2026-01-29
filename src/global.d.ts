// global.d.ts
import React from 'react';

declare global {
  const pyscript: any;
  interface Window {
    hideLoadingScreen?: () => void;
    updateLoadingStatus?: (message: string, progress?: number) => void;
  }
}