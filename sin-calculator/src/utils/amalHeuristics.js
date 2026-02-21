export const AMAL_TYPE = {
  PAHALA: 'pahala',
  DOSA: 'dosa'
};

export const calculateWeight = (text, type) => {
  const lowerText = text.toLowerCase();
  let baseWeight = 5;

  if (type === AMAL_TYPE.DOSA) {
    if (lowerText.match(/(batal|makan|minum|zina|mabuk|judi|mencuri|bunuh|babi|miras)/)) {
      baseWeight = 40;
    } else if (lowerText.match(/(ghibah|fitnah|bohong|marah|berantem|pacaran|kasar|maki)/)) {
      baseWeight = 20;
    } else if (lowerText.match(/(telat|males|tidur|lupa|nunda)/)) {
      baseWeight = 10;
    }
  } else {
    if (lowerText.match(/(quran|ngaji|sedekah|zakat|tarawih|tahajud|puasa|umroh|haji)/)) {
      baseWeight = 30;
    } else if (lowerText.match(/(bantu|senyum|sabar|infaq|masjid|yatim|ibu|ayah)/)) {
      baseWeight = 20;
    } else if (lowerText.match(/(baca|belajar|doa|dzikir|maaf)/)) {
      baseWeight = 10;
    }
  }

  const firstChar = text.charCodeAt(0) || 0;
  const lastChar = text.charCodeAt(text.length - 1) || 0;
  const textHash = text.length + firstChar + lastChar;
  const randomVariance = textHash % 8; 

  return Math.min(baseWeight + randomVariance, 50); 
};