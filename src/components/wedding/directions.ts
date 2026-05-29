// Opens Google Maps directions from the user's current location to the venue.
// Falls back to a search URL if location is denied/unavailable.
export function openDirections(query: string) {
  const dest = encodeURIComponent(query);
  const fallback = () => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  if (!("geolocation" in navigator)) {
    fallback();
    return;
  }

  // Trigger permission prompt; on success, include origin coords for live directions.
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      const origin = `${latitude},${longitude}`;
      window.open(
        `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`,
        "_blank",
        "noopener,noreferrer"
      );
    },
    () => fallback(),
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
  );
}
