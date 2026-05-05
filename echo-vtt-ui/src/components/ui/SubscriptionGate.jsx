/**
 * SubscriptionGate — wraps premium features with a soft lock overlay.
 * Shows the feature but displays a "Subscribe to unlock" CTA when locked.
 */
export default function SubscriptionGate({ tier = 'standard', requiredTier = 'epic', featureName = 'This feature', children }) {
  const isLocked = requiredTier === 'epic' && tier !== 'epic'

  if (!isLocked) return children

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ opacity: 0.4, pointerEvents: 'none', filter: 'blur(1px)' }}>
        {children}
      </div>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(13,15,20,0.85)',
        borderRadius: 8,
        backdropFilter: 'blur(4px)',
        border: '1px solid #4A3F6B',
      }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>🔒</div>
        <div style={{ color: '#C9A84C', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Epic Tier</div>
        <div style={{ color: '#9A9080', fontSize: 12, textAlign: 'center', maxWidth: 200, marginBottom: 12 }}>
          {featureName} requires an Epic subscription.
        </div>
        <button className="echo-btn echo-btn-gold echo-btn-sm">
          Upgrade to Epic
        </button>
      </div>
    </div>
  )
}
