import { useState } from 'react';
import { EXTERNAL_LINKS } from '../config/constants';

export function useWindowManager() {
  const [openWindows, setOpenWindows] = useState({});
  const [selectedIcon, setSelectedIcon] = useState(null);

  const openWindow = (key, external = null) => {
    if (external) {
      window.open(external, '_blank');
    } else {
      setOpenWindows(prev => ({ ...prev, [key]: true }));
    }
  };

  const closeWindow = (key) => {
    setOpenWindows(prev => ({ ...prev, [key]: false }));
    setSelectedIcon(null);
  };

  const minimizeWindow = (key) => {
    setOpenWindows(prev => ({ ...prev, [key]: false }));
  };

  const isWindowOpen = (key) => {
    return openWindows[key] || false;
  };

  const getOpenWindowsCount = () => {
    return Object.values(openWindows).filter(Boolean).length;
  };

  return {
    openWindows,
    selectedIcon,
    setSelectedIcon,
    openWindow,
    closeWindow,
    minimizeWindow,
    isWindowOpen,
    getOpenWindowsCount
  };
}
