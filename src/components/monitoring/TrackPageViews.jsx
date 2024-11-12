import { useLocation } from "react-router-dom";
import { Suspense, useEffect } from "react";

function NavigationEventsImplementation() {
  const location = useLocation();

  useEffect(() => {
    // Check if Google Analytics is configured
    if (import.meta.env.VITE_GA_MEASUREMENT_ID) {
      // Track page view
      window.gtag?.("event", "page_view", {
        page_path: location.pathname + location.search,
        page_location: window.location.href,
        page_title: document.title,
      });
    }
  }, [location]);

  return null;
}

export default function TrackPageViews() {
  return (
    <Suspense fallback={null}>
      <NavigationEventsImplementation />
    </Suspense>
  );
}
