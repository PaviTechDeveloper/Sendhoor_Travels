import { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'eager' | 'lazy';
}

export default function SafeImage({ src, alt, className = '', loading = 'lazy' }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    const hasDefinedHeight = /(?:^|\s)(?:h-|min-h-|aspect-)/.test(className);
    return (
      <div
        role="img"
        aria-label={`${alt} unavailable`}
        className={`flex items-center justify-center bg-brand/10 text-brand ${hasDefinedHeight ? '' : 'min-h-48'} ${className.replace(/object-cover/g, '')}`}
      >
        <ImageOff className="size-10" aria-hidden />
      </div>
    );
  }

  return <img src={src} alt={alt} loading={loading} className={className} onError={() => setFailed(true)} />;
}
