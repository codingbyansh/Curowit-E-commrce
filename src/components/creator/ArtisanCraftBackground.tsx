import React from 'react';

interface ArtisanCraftBackgroundProps {
  className?: string;
  theme?: 'warm-paper' | 'canvas-cream' | 'raw-linen';
  interactive?: boolean;
  intensity?: 'subtle' | 'medium' | 'vibrant';
  children?: React.ReactNode;
}

export const ArtisanCraftBackground: React.FC<ArtisanCraftBackgroundProps> = ({
  className = '',
  theme = 'warm-paper',
  children,
}) => {
  // Clean, warm organic artisan background tones without drafting matrix clutter
  const bgClass =
    theme === 'canvas-cream'
      ? 'bg-[#FFFDF7]'
      : theme === 'raw-linen'
      ? 'bg-[#F9F3EA]'
      : 'bg-[#FFFDF7]';

  return (
    <div className={`relative isolate ${bgClass} ${className} w-full max-w-full overflow-hidden`}>
      {/* Pristine warm organic artisan paper texture without drafting matrix */}
      <div className="relative z-10 w-full max-w-full">{children}</div>
    </div>
  );
};
