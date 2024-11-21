import { useEffect } from 'react';
import TrackPageViews from './TrackPageViews';

export const GoogleAnalytics = () => {
  const gaMeasurementID = import.meta.env.VITE_GA_MEASUREMENT_ID;

  useEffect(() => {
    if (!gaMeasurementID) {
      return;
    }

    // Create and load Google Analytics script
    const createGAScript = () => {
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementID}`;
      script.async = true;
      document.head.appendChild(script);

      script.onload = () => {
        window.dataLayer = window.dataLayer || [];
        function gtag() {
          window.dataLayer.push(arguments);
        }
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', gaMeasurementID, { send_page_view: false });
      };
    };

    // Check if script already exists
    if (!document.querySelector(`script[src*="googletagmanager.com/gtag"]`)) {
      createGAScript();
    }

    // Cleanup function
    return () => {
      // Optional: Remove GA script on component unmount
      const script = document.querySelector(
        `script[src*="googletagmanager.com/gtag"]`
      );
      if (script) {
        document.head.removeChild(script);
      }
      // Clean up window properties
      delete window.dataLayer;
      delete window.gtag;
    };
  }, [gaMeasurementID]);

  if (!gaMeasurementID) {
    return null;
  }

  return <TrackPageViews />;
};

export default GoogleAnalytics;
