export const AMAL_TYPE = {
  PAHALA: 'pahala',
  DOSA: 'dosa'
};

export const getRandomHadist = () => {
  const hadists = [
    "Setiap anak Adam pasti pernah berbuat salah, dan sebaik-baik orang yang berbuat salah adalah mereka yang bertaubat. (HR. Tirmidzi)",
    "Jauhilah oleh kalian dosa-dosa kecil, karena sesungguhnya dosa-dosa kecil itu jika menumpuk pada diri seseorang niscaya akan membinasakannya. (HR. Ahmad)",
    "Sesungguhnya Allah menerima taubat hamba-Nya selama nyawanya belum sampai ke tenggorokan. (HR. Tirmidzi)",
    "Bertaubatlah kalian kepada Allah dan mohonlah ampunan kepada-Nya, sesungguhnya aku bertaubat dalam sehari sebanyak seratus kali. (HR. Muslim)",
    "Barangsiapa yang berbuat keburukan atau menganiaya dirinya sendiri, kemudian ia memohon ampun kepada Allah, niscaya ia akan mendapati Allah Maha Pengampun. (QS. An-Nisa: 110)"
  ];
  return hadists[Math.floor(Math.random() * hadists.length)];
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