import type { AnimationInfo } from '../../hooks/useVRMAnimationPlayer';

interface AnimationControlsProps {
  animations: AnimationInfo[];
  onAnimationSelect: (animationId: string) => void;
  currentAnimation: string | null;
  isPlaying: boolean;
  onStop: () => void;
}

const AnimationControls = ({
  animations,
  onAnimationSelect,
  currentAnimation,
  isPlaying,
  onStop,
}: AnimationControlsProps) => {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '15px',
        borderRadius: '8px',
        color: 'white',
        zIndex: 1000,
        minWidth: '250px',
        maxWidth: '300px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>ジェスチャー</h3>
        {isPlaying && (
          <button
            onClick={onStop}
            style={{
              padding: '5px 10px',
              background: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            停止
          </button>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
          marginBottom: '10px',
        }}
      >
        {animations.map((animation) => (
          <button
            key={animation.id}
            onClick={() => onAnimationSelect(animation.id)}
            disabled={isPlaying && currentAnimation === animation.id}
            style={{
              padding: '12px 8px',
              background:
                currentAnimation === animation.id && isPlaying
                  ? '#4CAF50'
                  : '#333',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: isPlaying && currentAnimation === animation.id ? 'not-allowed' : 'pointer',
              fontSize: '10px',
              transition: 'background 0.2s',
              opacity: isPlaying && currentAnimation === animation.id ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!(isPlaying && currentAnimation === animation.id)) {
                e.currentTarget.style.background = '#555';
              }
            }}
            onMouseLeave={(e) => {
              if (!(isPlaying && currentAnimation === animation.id)) {
                e.currentTarget.style.background = '#333';
              }
            }}
          >
            {animation.name}
            {currentAnimation === animation.id && isPlaying && (
              <span style={{ marginLeft: '5px' }}>▶</span>
            )}
          </button>
        ))}
      </div>

      <div
        style={{
          paddingTop: '10px',
          borderTop: '1px solid #555',
          fontSize: '11px',
          color: '#aaa',
        }}
      >
        <p style={{ margin: 0 }}>
          {isPlaying ? '再生中...' : 'ジェスチャーを選択してください'}
        </p>
      </div>
    </div>
  );
};

export default AnimationControls;
