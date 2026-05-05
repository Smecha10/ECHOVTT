import './EntityList.css';

export default function EntityList({ entities }) {
  return (
    <div className="entity-list-container glass-panel">
      <div className="panel-header">
        <span className="icon">🛡️</span> Entities
      </div>
      <div className="entity-scroll-area">
        {entities.length === 0 ? (
          <div className="empty-state">No entities in the area.</div>
        ) : (
          entities.map((entity, index) => {
            let bgImage = 'none';
            if (entity.name.toLowerCase() === 'orc') bgImage = 'url(/orc_token.png)';
            if (entity.name.toLowerCase() === 'player') bgImage = 'url(/player_token.png)';

            return (
              <div 
                key={entity.id || index} 
                className={`entity-card ${entity.status === 'attacked' ? 'damage-flash' : ''}`}
              >
                <div className="entity-avatar">
                   <div 
                     className="avatar-circle"
                     style={{ backgroundImage: bgImage }}
                   ></div>
                </div>
                <div className="entity-info">
                  <div className="entity-name">{entity.name}</div>
                  <div className="hp-bar-container">
                    <div 
                      className="hp-bar-fill" 
                      style={{ 
                        width: `${Math.max(0, entity.hp)}%`,
                        backgroundColor: entity.hp > 50 ? 'var(--hp-high)' : entity.hp > 20 ? 'var(--hp-med)' : 'var(--hp-low)',
                        boxShadow: `0 0 10px ${entity.hp > 50 ? 'var(--hp-high)' : entity.hp > 20 ? 'var(--hp-med)' : 'var(--hp-low)'}`
                      }}
                    ></div>
                  </div>
                  <div className="hp-text">{entity.hp} / 100 HP</div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  );
}
