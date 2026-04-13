// Detect if running in Electron
export const isElectron = () => {
  return !!(
    window && 
    window.process && 
    window.process.type === 'renderer'
  );
};
