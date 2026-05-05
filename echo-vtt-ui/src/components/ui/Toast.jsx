import { useUIStore } from '../../store/uiStore'

const TYPE_STYLES = {
  info:    { background: '#1B1F2B', borderColor: '#4A3F6B', color: '#E8E0D0' },
  success: { background: '#0d2b1a', borderColor: '#27AE60', color: '#2ecc71' },
  warning: { background: '#2b1f0d', borderColor: '#F39C12', color: '#f39c12' },
  combat:  { background: '#2b0d0d', borderColor: '#C0392B', color: '#e87c7c' },
  gold:    { background: '#2b200d', borderColor: '#C9A84C', color: '#C9A84C' },
}

export default function ToastStack() {
  const { toasts, removeToast } = useUIStore()

  return (
    <div style={{ position: 'fixed', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 6, pointerEvents: 'none', alignItems: 'center' }}>
      {toasts.map((t) => {
        const style = TYPE_STYLES[t.type] || TYPE_STYLES.info
        return (
          <div
            key={t.id}
            className="toast-enter"
            style={{
              ...style,
              border: `1px solid ${style.borderColor}`,
              borderRadius: 4,
              padding: '7px 14px',
              fontSize: 13,
              fontWeight: 500,
              pointerEvents: 'auto',
              cursor: 'pointer',
              minWidth: 180,
              textAlign: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            }}
            onClick={() => removeToast(t.id)}
          >
            {t.text}
          </div>
        )
      })}
    </div>
  )
}
