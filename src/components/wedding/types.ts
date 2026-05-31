export type EventItem = {
  id: string;
  name: string;
  date: string; // human-friendly
  time: string;
  venue: string;
  address: string;
  mapsQuery: string; // search string for google maps
  emoji: string;
};

export type OtherFeature = {
  id: string;
  label: string;
  url: string;
};

export type MemoryItem = {
  id: string;
  dataUrl: string;       // base64 data URL of the photo/video
  caption: string;       // optional caption for the memory
  mediaType: 'image' | 'video'; // type of media
};

export type CardData = {
  brideName: string;
  brideParents: string;
  groomName: string;
  groomParents: string;
  weddingISO: string; // for countdown
  muhurtam: string;
  invitation: string;
  events: EventItem[];
  contactPhones: { label: string; phone: string }[];
  otherFeatures: OtherFeature[];
  brideGrandparents?: string;
  groomGrandparents?: string;
  accommodation?: string;
  accommodationIcon?: string;
  accommodationAddress?: string;
  accommodationMapsQuery?: string;
  memories?: MemoryItem[];
};

export const DEFAULT_DATA: CardData = {
  brideName: "Parvati",
  brideParents: "D/o Sri. Himavan & Smt. Mena",
  groomName: "Shiva",
  groomParents: "S/o Divine Lineage of Kailash",
  weddingISO: "2026-11-26T10:30:00",
  muhurtam: "Thursday, 26th November 2026 · 10:30 AM",
  invitation:
    "With the blessings of the Almighty and our beloved elders, we joyfully invite you to grace the auspicious wedding ceremony of our dear children.",
  events: [
    {
      id: "haldi",
      name: "Haldi",
      date: "24th November 2026",
      time: "10:00 AM",
      venue: "Sharma Residence",
      address: "Plot 14, Jubilee Hills, Hyderabad",
      mapsQuery: "Jubilee Hills Hyderabad",
      emoji: "🌼",
    },
    {
      id: "mehndi",
      name: "Mehndi",
      date: "24th November 2026",
      time: "5:00 PM",
      venue: "Sharma Residence Lawn",
      address: "Plot 14, Jubilee Hills, Hyderabad",
      mapsQuery: "Jubilee Hills Hyderabad",
      emoji: "🌿",
    },
    {
      id: "sangeet",
      name: "Sangeet",
      date: "25th November 2026",
      time: "7:30 PM",
      venue: "Taj Krishna Ballroom",
      address: "Banjara Hills, Hyderabad",
      mapsQuery: "Taj Krishna Banjara Hills Hyderabad",
      emoji: "🎶",
    },
    {
      id: "wedding",
      name: "Wedding",
      date: "26th November 2026",
      time: "10:30 AM",
      venue: "Sri Venkateshwara Kalyana Mandapam",
      address: "Road No. 12, Banjara Hills, Hyderabad",
      mapsQuery: "Sri Venkateshwara Kalyana Mandapam Banjara Hills Hyderabad",
      emoji: "🪔",
    },
    {
      id: "reception",
      name: "Reception",
      date: "27th November 2026",
      time: "7:00 PM",
      venue: "ITC Kakatiya Grand Ballroom",
      address: "Begumpet, Hyderabad",
      mapsQuery: "ITC Kakatiya Hyderabad",
      emoji: "✨",
    },
  ],
  contactPhones: [
    { label: "Bride's family", phone: "+91 98765 43210" },
    { label: "Groom's family", phone: "+91 98765 12345" },
  ],
  otherFeatures: [],
  brideGrandparents: "",
  groomGrandparents: "",
  accommodation: "",
  accommodationIcon: "🏨",
  accommodationAddress: "",
  accommodationMapsQuery: "",
  memories: [],
};
