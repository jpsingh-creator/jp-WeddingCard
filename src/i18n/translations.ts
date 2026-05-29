import type { CardData } from "@/components/wedding/types";

export type LangCode = "en" | "hi" | "te" | "ta" | "kn" | "ml";

export type LangMeta = {
  code: LangCode;
  label: string; // native label e.g. हिन्दी
  short: string; // EN / हि / తె
};

// Extensible — add Tamil/Kannada/Malayalam by filling their entries.
export const LANGUAGES: LangMeta[] = [
  { code: "en", label: "English", short: "EN" },
  { code: "hi", label: "हिन्दी", short: "हि" },
  { code: "te", label: "తెలుగు", short: "తె" },
  { code: "ta", label: "தமிழ்", short: "த" },
  { code: "kn", label: "ಕನ್ನಡ", short: "ಕ" },
  { code: "ml", label: "മലയാളം", short: "മ" },
];

export type UIStrings = {
  ganeshaSalutation: string;
  ganeshaMantra: string;
  ganeshaSub: string;
  tapToContinue: string;
  shubhVivah: string;
  weds: string;
  invitation: string;
  bride: string;
  groom: string;
  countingMoments: string;
  tillBigDay: string;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  celebrations: string;
  ourRituals: string;
  getDirections: string;
  blessingTitle: string;
  blessingSub: string;
  withWarmRegards: string;
  thanks: string;
  thanksSub: string;
  closing: string;
  language: string;
};

export const UI: Record<LangCode, UIStrings> = {
  en: {
    ganeshaSalutation: "॥ Shri Ganeshaya Namah ॥",
    ganeshaMantra: "Vakratunda Mahakaya",
    ganeshaSub: "Seeking the blessings of Lord Ganesha for an auspicious beginning",
    tapToContinue: "Tap to Continue",
    shubhVivah: "Shubh Vivah",
    weds: "WEDS",
    invitation: "INVITATION",
    bride: "Bride",
    groom: "Groom",
    countingMoments: "COUNTING THE MOMENTS",
    tillBigDay: "till our big day",
    days: "Days",
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds",
    celebrations: "CELEBRATIONS",
    ourRituals: "Our Rituals",
    getDirections: "Get Live Directions",
    blessingTitle: "Sneham Sada",
    blessingSub: "May love forever bloom 🌸",
    withWarmRegards: "WITH WARM REGARDS",
    thanks: "Dhanyavaad 🙏",
    thanksSub: "Your presence is our greatest blessing.",
    closing: "॥ Shubham Bhavatu ॥",
    language: "Language",
  },
  hi: {
    ganeshaSalutation: "॥ श्री गणेशाय नमः ॥",
    ganeshaMantra: "वक्रतुण्ड महाकाय",
    ganeshaSub: "शुभ आरम्भ के लिए श्री गणेश का आशीर्वाद",
    tapToContinue: "आगे बढ़ें",
    shubhVivah: "शुभ विवाह",
    weds: "विवाह",
    invitation: "निमंत्रण",
    bride: "वधू",
    groom: "वर",
    countingMoments: "पल गिनते हुए",
    tillBigDay: "हमारे विशेष दिन तक",
    days: "दिन",
    hours: "घंटे",
    minutes: "मिनट",
    seconds: "सेकंड",
    celebrations: "उत्सव",
    ourRituals: "हमारी रस्में",
    getDirections: "मार्ग देखें",
    blessingTitle: "स्नेहं सदा",
    blessingSub: "प्रेम सदा खिलता रहे 🌸",
    withWarmRegards: "सादर सहित",
    thanks: "धन्यवाद 🙏",
    thanksSub: "आपकी उपस्थिति हमारा सबसे बड़ा आशीर्वाद है।",
    closing: "॥ शुभम् भवतु ॥",
    language: "भाषा",
  },
  te: {
    ganeshaSalutation: "॥ శ్రీ గణేశాయ నమః ॥",
    ganeshaMantra: "వక్రతుండ మహాకాయ",
    ganeshaSub: "శుభారంభానికి శ్రీ గణేశుని ఆశీర్వాదము",
    tapToContinue: "ముందుకు సాగండి",
    shubhVivah: "శుభ వివాహం",
    weds: "వివాహం",
    invitation: "ఆహ్వానం",
    bride: "వధువు",
    groom: "వరుడు",
    countingMoments: "క్షణాలను లెక్కిస్తూ",
    tillBigDay: "మా శుభదినం వరకు",
    days: "రోజులు",
    hours: "గంటలు",
    minutes: "నిమిషాలు",
    seconds: "క్షణాలు",
    celebrations: "వేడుకలు",
    ourRituals: "మా ఆచారాలు",
    getDirections: "దారి చూపండి",
    blessingTitle: "స్నేహం సదా",
    blessingSub: "ప్రేమ ఎప్పటికీ వికసించుగాక 🌸",
    withWarmRegards: "సాదర అభినందనలతో",
    thanks: "ధన్యవాదాలు 🙏",
    thanksSub: "మీ సమక్షమే మాకు గొప్ప ఆశీర్వాదం.",
    closing: "॥ శుభం భవతు ॥",
    language: "భాష",
  },
  ta: {
    ganeshaSalutation: "॥ ஶ்ரீ கணேஶாய நமঃ ॥",
    ganeshaMantra: "வக்ரதுண்ட மஹாகாய",
    ganeshaSub: "சுப ஆரம்பத்திற்கு விநாயகரின் ஆசீர்வாதம்",
    tapToContinue: "தொடரவும்",
    shubhVivah: "சுப விவாஹம்",
    weds: "திருமணம்",
    invitation: "அழைப்பிதழ்",
    bride: "மணமகள்",
    groom: "மணமகன்",
    countingMoments: "நொடிகளை எண்ணி",
    tillBigDay: "எங்கள் சிறப்பு நாள் வரை",
    days: "நாட்கள்",
    hours: "மணி",
    minutes: "நிமிடம்",
    seconds: "வினாடி",
    celebrations: "கொண்டாட்டங்கள்",
    ourRituals: "எங்கள் சடங்குகள்",
    getDirections: "வழி காட்டு",
    blessingTitle: "ஸ்நேஹம் ஸதா",
    blessingSub: "அன்பு என்றும் மலரட்டும் 🌸",
    withWarmRegards: "அன்புடன்",
    thanks: "நன்றி 🙏",
    thanksSub: "உங்கள் வருகையே எங்கள் பேரானந்தம்.",
    closing: "॥ ஶுபம் பவது ॥",
    language: "மொழி",
  },
  kn: {
    ganeshaSalutation: "॥ ಶ್ರೀ ಗಣೇಶಾಯ ನಮಃ ॥",
    ganeshaMantra: "ವಕ್ರತುಂಡ ಮಹಾಕಾಯ",
    ganeshaSub: "ಶುಭಾರಂಭಕ್ಕಾಗಿ ಶ್ರೀ ಗಣೇಶನ ಆಶೀರ್ವಾದ",
    tapToContinue: "ಮುಂದುವರಿಯಿರಿ",
    shubhVivah: "ಶುಭ ವಿವಾಹ",
    weds: "ವಿವಾಹ",
    invitation: "ಆಮಂತ್ರಣ",
    bride: "ವಧು",
    groom: "ವರ",
    countingMoments: "ಕ್ಷಣಗಳನ್ನು ಎಣಿಸುತ್ತ",
    tillBigDay: "ನಮ್ಮ ವಿಶೇಷ ದಿನದವರೆಗೆ",
    days: "ದಿನಗಳು",
    hours: "ಗಂಟೆಗಳು",
    minutes: "ನಿಮಿಷಗಳು",
    seconds: "ಕ್ಷಣಗಳು",
    celebrations: "ಆಚರಣೆಗಳು",
    ourRituals: "ನಮ್ಮ ಸಂಪ್ರದಾಯಗಳು",
    getDirections: "ದಾರಿ ತೋರಿಸಿ",
    blessingTitle: "ಸ್ನೇಹಂ ಸದಾ",
    blessingSub: "ಪ್ರೀತಿ ಸದಾ ಅರಳಲಿ 🌸",
    withWarmRegards: "ಸಾದರ ಶುಭಾಶಯಗಳೊಂದಿಗೆ",
    thanks: "ಧನ್ಯವಾದಗಳು 🙏",
    thanksSub: "ನಿಮ್ಮ ಉಪಸ್ಥಿತಿಯೇ ನಮ್ಮ ಆಶೀರ್ವಾದ.",
    closing: "॥ ಶುಭಂ ಭವತು ॥",
    language: "ಭಾಷೆ",
  },
  ml: {
    ganeshaSalutation: "॥ ശ്രീ ഗണേശായ നമഃ ॥",
    ganeshaMantra: "വക്രതുണ്ഡ മഹാകായ",
    ganeshaSub: "ശുഭാരംഭത്തിന് ഗണപതിയുടെ അനുഗ്രഹം",
    tapToContinue: "തുടരുക",
    shubhVivah: "ശുഭ വിവാഹം",
    weds: "വിവാഹം",
    invitation: "ക്ഷണപത്രം",
    bride: "വധു",
    groom: "വരൻ",
    countingMoments: "നിമിഷങ്ങൾ എണ്ണി",
    tillBigDay: "ഞങ്ങളുടെ വലിയ ദിനം വരെ",
    days: "ദിവസങ്ങൾ",
    hours: "മണിക്കൂർ",
    minutes: "മിനിറ്റ്",
    seconds: "സെക്കൻഡ്",
    celebrations: "ആഘോഷങ്ങൾ",
    ourRituals: "ഞങ്ങളുടെ ചടങ്ങുകൾ",
    getDirections: "വഴി കാണിക്കുക",
    blessingTitle: "സ്നേഹം സദാ",
    blessingSub: "സ്നേഹം എന്നും വിരിയട്ടെ 🌸",
    withWarmRegards: "സ്നേഹപൂർവ്വം",
    thanks: "നന്ദി 🙏",
    thanksSub: "നിങ്ങളുടെ സാന്നിധ്യമാണ് ഞങ്ങളുടെ വലിയ അനുഗ്രഹം.",
    closing: "॥ ശുഭം ഭവതു ॥",
    language: "ഭാഷ",
  },
};

// Per-language defaults for the editable content. The English version
// matches DEFAULT_DATA so behavior is unchanged for existing users.
export const DATA_BY_LANG: Record<LangCode, Partial<CardData>> = {
  en: {
    brideName: "Parvati",
    brideParents: "D/o Sri. Himavan & Smt. Mena",
    groomName: "Shiva",
    groomParents: "S/o Divine Lineage of Kailash",
    muhurtam: "Thursday, 26th November 2026 · 10:30 AM",
    invitation:
      "With the blessings of the Almighty and our beloved elders, we joyfully invite you to grace the auspicious wedding ceremony of our dear children.",
    events: [
      { id: "haldi", name: "Haldi", date: "24th November 2026", time: "10:00 AM", venue: "Sharma Residence", address: "Plot 14, Jubilee Hills, Hyderabad", mapsQuery: "Jubilee Hills Hyderabad", emoji: "🌼" },
      { id: "mehndi", name: "Mehndi", date: "24th November 2026", time: "5:00 PM", venue: "Sharma Residence Lawn", address: "Plot 14, Jubilee Hills, Hyderabad", mapsQuery: "Jubilee Hills Hyderabad", emoji: "🌿" },
      { id: "sangeet", name: "Sangeet", date: "25th November 2026", time: "7:30 PM", venue: "Taj Krishna Ballroom", address: "Banjara Hills, Hyderabad", mapsQuery: "Taj Krishna Banjara Hills Hyderabad", emoji: "🎶" },
      { id: "wedding", name: "Wedding", date: "26th November 2026", time: "10:30 AM", venue: "Sri Venkateshwara Kalyana Mandapam", address: "Road No. 12, Banjara Hills, Hyderabad", mapsQuery: "Sri Venkateshwara Kalyana Mandapam Banjara Hills Hyderabad", emoji: "🪔" },
      { id: "reception", name: "Reception", date: "27th November 2026", time: "7:00 PM", venue: "ITC Kakatiya Grand Ballroom", address: "Begumpet, Hyderabad", mapsQuery: "ITC Kakatiya Hyderabad", emoji: "✨" },
    ],
    contactPhones: [
      { label: "Bride's family", phone: "+91 98765 43210" },
      { label: "Groom's family", phone: "+91 98765 12345" },
    ],
  },
  hi: {
    brideName: "पार्वती",
    brideParents: "सुपुत्री श्री हिमवान् एवं श्रीमती मेना",
    groomName: "शिव",
    groomParents: "सुपुत्र कैलाश के दिव्य वंश",
    muhurtam: "गुरुवार, 26 नवंबर 2026 · प्रातः 10:30",
    invitation:
      "परमेश्वर तथा हमारे आदरणीय बुजुर्गों के आशीर्वाद से, हम अपने प्रिय बच्चों के शुभ विवाह में आपकी उपस्थिति की सादर प्रार्थना करते हैं।",
    events: [
      { id: "haldi", name: "हल्दी", date: "24 नवंबर 2026", time: "प्रातः 10:00", venue: "शर्मा निवास", address: "प्लॉट 14, जुबली हिल्स, हैदराबाद", mapsQuery: "Jubilee Hills Hyderabad", emoji: "🌼" },
      { id: "mehndi", name: "मेहंदी", date: "24 नवंबर 2026", time: "सायं 5:00", venue: "शर्मा निवास लॉन", address: "प्लॉट 14, जुबली हिल्स, हैदराबाद", mapsQuery: "Jubilee Hills Hyderabad", emoji: "🌿" },
      { id: "sangeet", name: "संगीत", date: "25 नवंबर 2026", time: "सायं 7:30", venue: "ताज कृष्णा बॉलरूम", address: "बंजारा हिल्स, हैदराबाद", mapsQuery: "Taj Krishna Banjara Hills Hyderabad", emoji: "🎶" },
      { id: "wedding", name: "विवाह", date: "26 नवंबर 2026", time: "प्रातः 10:30", venue: "श्री वेंकटेश्वर कल्याण मंडपम", address: "रोड नं. 12, बंजारा हिल्स, हैदराबाद", mapsQuery: "Sri Venkateshwara Kalyana Mandapam Banjara Hills Hyderabad", emoji: "🪔" },
      { id: "reception", name: "स्वागत समारोह", date: "27 नवंबर 2026", time: "सायं 7:00", venue: "आईटीसी काकतीय ग्रैंड बॉलरूम", address: "बेगमपेट, हैदराबाद", mapsQuery: "ITC Kakatiya Hyderabad", emoji: "✨" },
    ],
    contactPhones: [
      { label: "वधू पक्ष", phone: "+91 98765 43210" },
      { label: "वर पक्ष", phone: "+91 98765 12345" },
    ],
  },
  te: {
    brideName: "పార్వతి",
    brideParents: "శ్రీ హిమవంతుని & శ్రీమతి మేన గారి కుమార్తె",
    groomName: "శివుడు",
    groomParents: "కైలాస దివ్య వంశీయుడు",
    muhurtam: "గురువారం, 26 నవంబర్ 2026 · ఉదయం 10:30",
    invitation:
      "భగవంతుని, పెద్దల ఆశీస్సులతో, మా ప్రియమైన పిల్లల శుభ వివాహ వేడుకకు మిమ్మల్ని సాదరంగా ఆహ్వానిస్తున్నాము.",
    events: [
      { id: "haldi", name: "హల్దీ (పసుపు)", date: "24 నవంబర్ 2026", time: "ఉదయం 10:00", venue: "శర్మ నివాసం", address: "ప్లాట్ 14, జూబ్లీ హిల్స్, హైదరాబాద్", mapsQuery: "Jubilee Hills Hyderabad", emoji: "🌼" },
      { id: "mehndi", name: "మెహందీ", date: "24 నవంబర్ 2026", time: "సాయంత్రం 5:00", venue: "శర్మ నివాస లాన్", address: "ప్లాట్ 14, జూబ్లీ హిల్స్, హైదరాబాద్", mapsQuery: "Jubilee Hills Hyderabad", emoji: "🌿" },
      { id: "sangeet", name: "సంగీత్", date: "25 నవంబర్ 2026", time: "సాయంత్రం 7:30", venue: "తాజ్ కృష్ణ బాల్‌రూమ్", address: "బంజారా హిల్స్, హైదరాబాద్", mapsQuery: "Taj Krishna Banjara Hills Hyderabad", emoji: "🎶" },
      { id: "wedding", name: "వివాహం", date: "26 నవంబర్ 2026", time: "ఉదయం 10:30", venue: "శ్రీ వేంకటేశ్వర కల్యాణ మండపం", address: "రోడ్ నం. 12, బంజారా హిల్స్, హైదరాబాద్", mapsQuery: "Sri Venkateshwara Kalyana Mandapam Banjara Hills Hyderabad", emoji: "🪔" },
      { id: "reception", name: "రిసెప్షన్", date: "27 నవంబర్ 2026", time: "సాయంత్రం 7:00", venue: "ఐటీసీ కాకతీయ గ్రాండ్ బాల్‌రూమ్", address: "బేగంపేట, హైదరాబాద్", mapsQuery: "ITC Kakatiya Hyderabad", emoji: "✨" },
    ],
    contactPhones: [
      { label: "వధువు కుటుంబం", phone: "+91 98765 43210" },
      { label: "వరుని కుటుంబం", phone: "+91 98765 12345" },
    ],
  },
  ta: {},
  kn: {},
  ml: {},
};
