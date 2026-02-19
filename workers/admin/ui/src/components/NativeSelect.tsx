interface NativeSelectProps {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '6px 12px',
  borderRadius: '6px',
  fontSize: '14px',
  border: '1px solid #e5e7eb',
  background: '#f1f5f9',
  outline: 'none',
  fontFamily: 'inherit',
};

export function NativeSelect({ value, onChange, children }: NativeSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={selectStyle}
    >
      {children}
    </select>
  );
}
