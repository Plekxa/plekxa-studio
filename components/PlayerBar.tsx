import {
  Heart,
  ListMusic,
  Maximize2,
  Pause,
  Repeat2,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";

export function PlayerBar() {
  return (
    <aside className="player-bar">
      <div className="player-current">
        <div className="player-artwork" />

        <div className="player-details">
          <strong>Late Night Reflections</strong>
          <span>Plekxa Original Experience</span>
        </div>

        <button className="player-icon" aria-label="Save">
          <Heart size={18} />
        </button>
      </div>

      <div className="player-centre">
        <div className="player-controls">
          <button className="player-icon" aria-label="Shuffle">
            <Shuffle size={17} />
          </button>

          <button className="player-icon" aria-label="Previous">
            <SkipBack size={19} fill="currentColor" />
          </button>

          <button className="player-main-button" aria-label="Pause">
            <Pause size={20} fill="currentColor" />
          </button>

          <button className="player-icon" aria-label="Next">
            <SkipForward size={19} fill="currentColor" />
          </button>

          <button className="player-icon" aria-label="Repeat">
            <Repeat2 size={17} />
          </button>
        </div>

        <div className="player-progress">
          <span>12:48</span>

          <div className="player-progress-track">
            <div className="player-progress-value" />
          </div>

          <span>42:00</span>
        </div>
      </div>

      <div className="player-tools">
        <button className="player-icon" aria-label="Queue">
          <ListMusic size={18} />
        </button>

        <Volume2 size={18} />

        <div className="volume-track">
          <div className="volume-value" />
        </div>

        <button className="player-icon" aria-label="Full screen">
          <Maximize2 size={17} />
        </button>
      </div>
    </aside>
  );
}