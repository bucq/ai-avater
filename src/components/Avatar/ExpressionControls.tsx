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
    <div className="absolute top-5 right-5 bg-black/70 p-4 rounded-lg text-white z-[1000] min-w-[200px]">
      <h3 className="m-0 mb-2.5 text-base">表情</h3>
      <div className="flex flex-col gap-2">
        {expressions.map(({ name, label, emoji }) => {
          const isActive = currentExpression === name;

          return (
            <button
              key={name}
              onClick={() => onExpressionChange(name)}
              className={`
                p-1 border-none rounded-md cursor-pointer text-xs
                flex items-center gap-1 transition-colors
                ${isActive ? 'bg-green-500' : 'bg-[#333] hover:bg-[#555]'}
                text-white
              `}
            >
              <span className="text-[15px]">{emoji}</span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-[#555] text-xs text-[#aaa]">
        <p className="m-0">キーボードショートカット:</p>
        <p className="mt-1 mb-0">1-6: 表情切り替え</p>
      </div>
    </div>
  );
};

export default ExpressionControls;
