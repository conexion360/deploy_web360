// src/components/ImageKitProvider.tsx
'use client'
import React from 'react';
import { IKContext } from 'imagekitio-react';

interface ImageKitProviderProps {
  children: React.ReactNode;
}

const ImageKitProvider: React.FC<ImageKitProviderProps> = ({ children }) => {
  return (
    <IKContext
      publicKey="public_nJIM9VeYDWasBIUi3ixlGpRzZz4="
      urlEndpoint="https://ik.imagekit.io/qpdyvnppk"
      transformationPosition="path"
      authenticationEndpoint="/api/imagekit-auth"
    >
      {children}
    </IKContext>
  );
};

export default ImageKitProvider;