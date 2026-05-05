import { useEffect, useRef } from 'react';
import './EventLog.css';

export default function EventLog({ events }) {
  const scrollRef = useRef(null);

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <div className="event-log-container">
      <div className="panel-header">
        <span className="icon">📜</span> Event Log
      </div>
      <div className="log-scroll-area" ref={scrollRef}>
        {events.map((event, index) => (
          <div key={index} className={`log-entry ${event.source.toLowerCase()}`}>
            <span className="log-timestamp">[{event.timestamp.split(':').slice(1).join(':')}]</span>
            <span className="log-source">{event.source}:</span>
            <span className="log-message">{event.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
