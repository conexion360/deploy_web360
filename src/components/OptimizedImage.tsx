// src/components/OptimizedImage.tsx
import React from 'react';
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  fill = false,
  objectFit = 'cover'
}) => {
  // For external URLs, we need to configure domains in next.config.js
  // For local testing or when images aren't yet optimized
  const useImgFallback = src.startsWith('data:') || !src.startsWith('http');

  if (useImgFallback) {
    return (
      <img 
        src={src} 
        alt={alt} 
        width={width} 
        height={height}
        className={className}
      />
    );
  }

  if (fill) {
    return (
      <div className={`relative ${className}`}>
        <Image
          src={src}
          alt={alt}
          fill={true}
          priority={priority}
          style={{ objectFit }}
        />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 800}
      height={height || 600}
      className={className}
      priority={priority}
    />
  );
};

export default OptimizedImage;