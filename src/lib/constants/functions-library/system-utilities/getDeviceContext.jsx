export const getDeviceContext = async () => {
  const context = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: {
      width: window.screen.width,
      height: window.screen.height,
    },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    connectionType: navigator.connection
      ? navigator.connection.effectiveType
      : 'unknown',
  };
  return context;
};

export default getDeviceContext;
