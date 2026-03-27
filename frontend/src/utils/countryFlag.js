const COUNTRY_TO_CODE = {
  brasil: 'BRA',
  brazil: 'BRA',
  argentina: 'ARG',
  uruguai: 'URY',
  uruguay: 'URY',
  paraguai: 'PRY',
  paraguay: 'PRY',
  colombia: 'COL',
  mexico: 'MEX',
  chile: 'CHL',
  peru: 'PER',
  bolivia: 'BOL',
  venezuela: 'VEN',
  equador: 'ECU',
  ecuador: 'ECU',
  'estados unidos': 'USA',
  'united states': 'USA',
  usa: 'USA',
  canada: 'CAN',
  espanha: 'ESP',
  spain: 'ESP',
  portugal: 'PRT',
  franca: 'FRA',
  france: 'FRA',
  alemanha: 'DEU',
  germany: 'DEU',
  italia: 'ITA',
  italy: 'ITA',
  holanda: 'NLD',
  netherlands: 'NLD',
  belgica: 'BEL',
  belgium: 'BEL',
  inglaterra: 'GBR',
  england: 'GBR',
  'reino unido': 'GBR',
  'united kingdom': 'GBR',
  escocia: 'GBR',
  scotland: 'GBR',
  irlanda: 'IRL',
  ireland: 'IRL',
  suica: 'CHE',
  switzerland: 'CHE',
  austria: 'AUT',
  dinamarca: 'DNK',
  denmark: 'DNK',
  suecia: 'SWE',
  sweden: 'SWE',
  noruega: 'NOR',
  norway: 'NOR',
  polonia: 'POL',
  poland: 'POL',
  servia: 'SRB',
  serbia: 'SRB',
  croacia: 'HRV',
  croatia: 'HRV',
  eslovenia: 'SVN',
  slovenia: 'SVN',
  eslovaquia: 'SVK',
  slovakia: 'SVK',
  russia: 'RUS',
  japao: 'JPN',
  japan: 'JPN',
  'coreia do sul': 'KOR',
  coreia: 'KOR',
  korea: 'KOR',
  'south korea': 'KOR',
  china: 'CHN',
  marrocos: 'MAR',
  morocco: 'MAR',
  nigeria: 'NGA',
  gana: 'GHA',
  ghana: 'GHA',
  camaroes: 'CMR',
  cameroon: 'CMR',
  'costa do marfim': 'CIV',
  'ivory coast': 'CIV',
  egito: 'EGY',
  egypt: 'EGY',
  tunisia: 'TUN',
  argelia: 'DZA',
  algeria: 'DZA',
  australia: 'AUS',
  'nova zelandia': 'NZL',
  'new zealand': 'NZL',
};

function normalize(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

export function resolveBirthCountryName(player) {
  return (
    player?.pais_nascimento ||
    player?.paisNascimento ||
    player?.country_of_birth ||
    player?.birth_country ||
    player?.countryOfBirth ||
    player?.nacionalidade ||
    ''
  );
}

export function resolveBirthCountryCode(player) {
  const countryName = resolveBirthCountryName(player);
  const normalized = normalize(countryName);
  return COUNTRY_TO_CODE[normalized] || null;
}
