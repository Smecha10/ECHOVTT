import './MapDisplay.css';

export default function MapDisplay({ mapData, entities, effects = [] }) {
  const { width, height } = mapData;

  return (
    <div className="map-container">
      {/* The background map texture */}
      <div className="map-background" style={{ backgroundImage: 'url(/map_bg.png)' }}>
        
        {/* Optional overlay grid to help with positioning visually */}
        <div 
          className="map-grid-overlay"
          style={{
            backgroundSize: `${100 / width}% ${100 / height}%`
          }}
        ></div>

        {/* Tokens are absolute positioned on the map */}
        {entities.map(entity => {
          const [x, y] = entity.position;
          const leftPercent = (x / width) * 100;
          const topPercent = (y / height) * 100;
          const tokenSize = 100 / width; // roughly 10% of map width/height

          let bgImage = 'none';
          if (entity.name.toLowerCase() === 'orc') bgImage = 'url(/orc_token.png)';
          if (entity.name.toLowerCase() === 'player') bgImage = 'url(/player_token.png)';

          return (
            <div 
              key={entity.id}
              className={`entity-token ${entity.status || ''}`}
              style={{
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
                width: `${tokenSize}%`,
                height: `${tokenSize}%`,
                backgroundImage: bgImage
              }}
            >
              {/* Optional HP Ring SVG could go here */}
              <div className="token-glow"></div>
              <span className="tooltip">{entity.name}</span>
            </div>
          );
        })}

        {/* Render Effects */}
        {effects.map(effect => {
          if (effect.type === 'slash') {
            const [x, y] = effect.target;
            const leftPercent = (x / width) * 100;
            const topPercent = (y / height) * 100;
            const tokenSize = 100 / width;
            return (
              <div 
                key={effect.id} 
                className="effect-slash"
                style={{
                  left: `${leftPercent}%`,
                  top: `${topPercent}%`,
                  width: `${tokenSize}%`,
                  height: `${tokenSize}%`
                }}
              ></div>
            );
          }
          if (effect.type === 'fireball') {
            const [sx, sy] = effect.source;
            const [tx, ty] = effect.target;
            
            const startLeft = (sx / width) * 100;
            const startTop = (sy / height) * 100;
            const endLeft = (tx / width) * 100;
            const endTop = (ty / height) * 100;
            const tokenSize = 100 / width;

            // Calculate distance and angle for the projectile
            const dx = endLeft - startLeft;
            const dy = endTop - startTop;
            const distance = Math.sqrt(dx*dx + dy*dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);

            return (
              <div 
                key={effect.id} 
                className="effect-fireball-container"
                style={{
                  left: `${startLeft + tokenSize/2}%`,
                  top: `${startTop + tokenSize/2}%`,
                  width: `${distance}%`, // Width is the total distance to travel
                  transform: `rotate(${angle}deg)`,
                  transformOrigin: 'left center'
                }}
              >
                <div className="effect-fireball-projectile"></div>
              </div>
            );
          }
          return null;
        })}

      </div>
    </div>
  );
}
