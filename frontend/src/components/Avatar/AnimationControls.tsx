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
    <div className="absolute bottom-5 right-5 bg-black/70 p-4 rounded-lg text-white z-[1000] min-w-[250px] max-w-[300px]">
      <div className="flex justify-between items-center mb-2.5">
        <h3 className="m-0 text-base">ジェスチャー</h3>
        {isPlaying && (
          <button
            onClick={onStop}
            className="px-2.5 py-1 bg-red-500 text-white border-none rounded cursor-pointer text-xs hover:bg-red-600 transition-colors"
          >
            停止
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2.5">
        {animations.map((animation) => {
          const isCurrentlyPlaying = isPlaying && currentAnimation === animation.id;

          return (
            <button
              key={animation.id}
              onClick={() => onAnimationSelect(animation.id)}
              disabled={isCurrentlyPlaying}
              className={`
                py-3 px-2 border-none rounded-md text-[10px] transition-all
                ${isCurrentlyPlaying
                  ? 'bg-green-500 cursor-not-allowed opacity-70'
                  : 'bg-[#333] cursor-pointer hover:bg-[#555]'
                }
                text-white
              `}
            >
              {animation.name}
              {isCurrentlyPlaying && (
                <span className="ml-1">▶</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="pt-2.5 border-t border-[#555] text-[11px] text-[#aaa]">
        <p className="m-0">
          {isPlaying ? '再生中...' : 'ジェスチャーを選択してください'}
        </p>
      </div>
    </div>
  );
};

export default AnimationControls;
