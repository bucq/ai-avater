import { VRMExpressionPresetName } from '@pixiv/three-vrm';

interface ExpressionControlsProps {
  onExpressionChange: (expression: VRMExpressionPresetName | 'neutral') => void;
  currentExpression: VRMExpressionPresetName | 'neutral';
}

const ExpressionControls = ({ onExpressionChange, currentExpression }: ExpressionControlsProps) => {
  const expressions: Array<{ name: VRMExpressionPresetName | 'neutral'; label: string; emoji: string }> = [
    { name: 'neutral', label: 'ニュートラル', emoji: '😐' },
    { name: 'happy', label: '喜び', emoji: '😊' },
    { name: 'angry', label: '怒り', emoji: '😠' },
    { name: 'sad', label: '悲しみ', emoji: '😢' },
    { name: 'relaxed', label: 'リラックス', emoji: '😌' },
    { name: 'surprised', label: '驚き', emoji: '😲' },
  ];

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      background: 'rgba(0, 0, 0, 0.7)',
      padding: '15px',
      borderRadius: '8px',
      color: 'white',
      zIndex: 1000,
      minWidth: '200px'
    }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>表情</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {expressions.map(({ name, label, emoji }) => (
          <button
            key={name}
            onClick={() => onExpressionChange(name)}
            style={{
              padding: '4px',
              background: currentExpression === name ? '#4CAF50' : '#333',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => {
              if (currentExpression !== name) {
                e.currentTarget.style.background = '#555';
              }
            }}
            onMouseLeave={(e) => {
              if (currentExpression !== name) {
                e.currentTarget.style.background = '#333';
              }
            }}
          >
            <span style={{ fontSize: '15px' }}>{emoji}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
      <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #555', fontSize: '12px', color: '#aaa' }}>
        <p style={{ margin: 0 }}>キーボードショートカット:</p>
        <p style={{ margin: '5px 0 0 0' }}>1-6: 表情切り替え</p>
      </div>
    </div>
  );
};

export default ExpressionControls;
