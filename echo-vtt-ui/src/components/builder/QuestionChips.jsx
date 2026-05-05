export default function QuestionChips({ options, selected = [], onChange, multi = true }) {
  const toggle = (opt) => {
    if (!multi) {
      onChange([opt])
      return
    }
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt))
    } else {
      onChange([...selected, opt])
    }
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map((opt) => (
        <div
          key={opt}
          className={`chip${selected.includes(opt) ? ' selected' : ''}`}
          onClick={() => toggle(opt)}
        >
          {opt}
        </div>
      ))}
    </div>
  )
}
