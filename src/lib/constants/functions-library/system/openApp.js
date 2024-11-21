export const execute = async options => {
  const { appName } = options;

  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    logger.error('Cannot open app in non-browser environment');
    throw new Error('App opening is only supported in browser environments');
  }

  try {
    // Use custom URL schemes to open apps
    const appSchemes = {
      calculator: 'calc:', // Windows calculator
      mail: 'mailto:', // Default mail client
      maps: 'maps:', // Maps application
      calendar: 'webcal:', // Calendar application
      skype: 'skype:', // Skype
      spotify: 'spotify:', // Spotify
      zoom: 'zoommtg:', // Zoom
      teams: 'msteams:', // Microsoft Teams
      slack: 'slack:', // Slack
      whatsapp: 'whatsapp:', // WhatsApp
      telegram: 'tg:', // Telegram
    };

    const scheme = appSchemes[appName.toLowerCase()];
    if (!scheme) {
      // For unsupported apps, try to open their web version
      window.open(`https://${appName}.com`, '_blank');
      return `Opened web version of ${appName}`;
    }

    // Try to open the app using URL scheme
    const opened = window.open(scheme, '_blank');
    if (opened) {
      return `${appName} opened successfully.`;
    } else {
      throw new Error('Failed to open app - popup might be blocked');
    }
  } catch (error) {
    console.error(`Error opening ${appName}:`, error);
    throw new Error(`Failed to open ${appName}: ${error.message}`);
  }
};

export const details = {
  name: 'openApp',
  description: 'Opens a specified application using browser URL schemes',
  parameters: {
    type: 'object',
    properties: {
      appName: {
        type: 'string',
        description: 'The name of the application to open',
        enum: [
          'calculator',
          'mail',
          'maps',
          'calendar',
          'skype',
          'spotify',
          'zoom',
          'teams',
          'slack',
          'whatsapp',
          'telegram',
        ],
      },
    },
    required: ['appName'],
  },
  example: 'Open the Calculator application',
};

export default {
  execute,
  details,
};
