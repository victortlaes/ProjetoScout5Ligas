export const LEAGUE_MAP = {
  'Brasileirão Série A': [
    'Atlético Mineiro','Bahia','Botafogo','Corinthians','Cruzeiro',
    'Flamengo','Fluminense','Fortaleza','Fortaleza FC','Grêmio','Internacional',
    'Juventude','Mirassol','Palmeiras','Red Bull Bragantino','Santos',
    'São Paulo','Sport Recife','Vasco da Gama','Vitória','Ceará',
  ],
  'Liga Profesional Argentina': [
    'Aldosivi','Argentinos Juniors','Atlético Tucumán','Banfield','Barracas Central',
    'Boca Juniors','CA Independiente','CA Lanús','CA Talleres','Central Córdoba',
    'Club Atlético Belgrano','Club Atlético Unión de Santa Fe','Defensa y Justicia',
    'Estudiantes de La Plata','Gimnasia y Esgrima','Godoy Cruz','Huracán',
    'Independiente Rivadavia','Instituto De Córdoba',"Newell's Old Boys",
    'Platense','Racing Club','River Plate','Rosario Central','San Lorenzo',
    'San Martín de San Juan','Sarmiento','Tigre','Vélez Sarsfield',
  ],
  'Dimayor Colombia': [
    'Alianza Valledupar FC','América de Cali','Atlético Bucaramanga','Atlético Nacional',
    'Boyacá Chicó FC','Deportes Tolima','Deportivo Cali','Deportivo La Equidad',
    'Deportivo Pasto','Deportivo Pereira','Deportivo Riestra','Envigado FC',
    'Independiente Medellín','Independiente Santa Fe','Junior Barranquilla',
    'Llaneros FC','Millonarios','Once Caldas','Rionegro Águilas Doradas','Unión Magdalena',
  ],
  'Liga MX': [
    'Atlas FC','Atlético San Luis','CD Guadalajara','CD Toluca','CF Monterrey',
    'CF Pachuca','Club América','Club León','Club Necaxa','Club Puebla',
    'Club Tijuana','Cruz Azul','FC Juárez','Mazatlán FC','Pumas UNAM',
    'Querétaro FC','Santos Laguna','Tigres UANL',
  ],
  'MLS': [
    'Atlanta United','Austin FC','CF Montréal','Charlotte FC','Chicago Fire',
    'Colorado Rapids','Columbus Crew','DC United','FC Cincinnati','FC Dallas',
    'Houston Dynamo','Inter Miami CF','LA Galaxy','Los Angeles FC',
    'Minnesota United','Nashville SC','New England Revolution','New York City FC',
    'New York Red Bulls','Orlando City SC','Philadelphia Union','Portland Timbers',
    'Real Salt Lake','San Diego FC','San Jose Earthquakes','Seattle Sounders FC',
    'Sporting Kansas City','St.Louis City','Toronto FC','Vancouver Whitecaps',
  ],
};

export const LEAGUE_FLAGS = {
  'Brasileirão Série A':        'BR',
  'Liga Profesional Argentina': 'AR',
  'Dimayor Colombia':           'CO',
  'Liga MX':                    'MX',
  'MLS':                        'US',
};

export function getLeague(teamName) {
  for (const [liga, times] of Object.entries(LEAGUE_MAP)) {
    if (times.includes(teamName)) return liga;
  }
  return 'Outra';
}

export const ALL_LEAGUES = Object.keys(LEAGUE_MAP);