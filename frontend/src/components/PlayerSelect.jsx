import Select from 'react-select';
import Flag from 'react-world-flags';
import { getLeague } from '../utils/leagueMap';

const POSITION_LABEL = { F: 'ATA', M: 'MEI', D: 'DEF', G: 'GOL' };
const POSITION_COLOR = { F: '#e53e3e', M: '#1d6ef5', D: '#2f855a', G: '#d69e2e' };
const LEAGUE_CODE    = { 'Brasileirão Série A': 'BRA', 'Liga Profesional Argentina': 'ARG', 'Dimayor Colombia': 'COL', 'Liga MX': 'MEX', 'MLS': 'USA' };

function formatOptionLabel(opt) {
  const birthCode = opt.birthCountryCode || null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {opt.foto && (
        <img
          src={opt.foto}
          alt=""
          style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid #dde3ef' }}
          onError={e => { e.target.style.display = 'none'; }}
        />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 500, fontSize: 13, color: '#0d1f3c', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {opt.label}
        </div>
        <div style={{ fontSize: 11, color: '#8a9ab8', display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{
            background: POSITION_COLOR[opt.posicao] + '18',
            color: POSITION_COLOR[opt.posicao],
            padding: '1px 6px',
            borderRadius: 99,
            fontWeight: 600,
            fontSize: 10,
          }}>
            {POSITION_LABEL[opt.posicao]}
          </span>
          {birthCode && (
            <Flag
              code={birthCode}
              height="11"
              style={{ borderRadius: 2 }}
              fallback={<span style={{ fontSize: 10, fontWeight: 800 }}>{birthCode}</span>}
            />
          )}
          <span>{opt.time}</span>
          <span>·</span>
          <span>{getLeague(opt.time)}</span>
        </div>
      </div>
    </div>
  );
}

const customStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 46,
    border: state.isFocused ? '1.5px solid #1d6ef5' : '1.5px solid #dde3ef',
    borderRadius: 10,
    boxShadow: state.isFocused ? '0 0 0 3px rgba(29,110,245,0.1)' : 'none',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    background: '#fff',
    cursor: 'pointer',
    transition: 'border-color 0.15s',
    '&:hover': { borderColor: '#c4cfe3' },
  }),
  menu: base => ({
    ...base,
    borderRadius: 10,
    border: '1px solid #dde3ef',
    boxShadow: '0 8px 32px rgba(13,31,60,0.13)',
    overflow: 'hidden',
    zIndex: 200,
  }),
  option: (base, state) => ({
    ...base,
    background: state.isSelected ? '#e8f0fe' : state.isFocused ? '#f4f6fa' : '#fff',
    color: '#0d1f3c',
    padding: '8px 12px',
    cursor: 'pointer',
  }),
  placeholder: base => ({ ...base, color: '#8a9ab8', fontSize: 14 }),
  singleValue: base => ({ ...base, fontSize: 14 }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: base => ({ ...base, color: '#8a9ab8', padding: '0 10px' }),
  clearIndicator: base => ({ ...base, color: '#8a9ab8', padding: '0 4px', cursor: 'pointer' }),
};

export default function PlayerSelect({ options, value, onChange, placeholder, isDisabled }) {
  return (
    <Select
      options={options}
      value={options.find(o => o.value === value) || null}
      onChange={opt => onChange(opt ? opt.value : null)}
      placeholder={placeholder || 'Buscar jogador...'}
      formatOptionLabel={formatOptionLabel}
      filterOption={(opt, input) => {
        const q = input.toLowerCase();
        return (
          opt.data.label.toLowerCase().includes(q) ||
          opt.data.time.toLowerCase().includes(q)
        );
      }}
      styles={customStyles}
      isClearable
      isDisabled={isDisabled}
      noOptionsMessage={() => 'Nenhum jogador encontrado'}
      loadingMessage={() => 'Carregando...'}
    />
  );
}