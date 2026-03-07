import { createContext, useContext, useState, useCallback, type FC, type ReactNode } from 'react';
import type { SignatureSource } from '../../types/pdf';

interface SignatureContextValue {
  signature: SignatureSource | null;
  setSignature: (sig: SignatureSource) => void;
  clearSignature: () => void;
}

const SignatureContext = createContext<SignatureContextValue | null>(null);

export const SignatureProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [signature, setSignatureState] = useState<SignatureSource | null>(null);

  const setSignature = useCallback((sig: SignatureSource) => {
    setSignatureState(sig);
  }, []);

  const clearSignature = useCallback(() => {
    setSignatureState(null);
  }, []);

  return (
    <SignatureContext.Provider value={{ signature, setSignature, clearSignature }}>
      {children}
    </SignatureContext.Provider>
  );
};

export function useSignatureContext(): SignatureContextValue {
  const ctx = useContext(SignatureContext);
  if (!ctx) {
    throw new Error('useSignatureContext must be used within a SignatureProvider');
  }
  return ctx;
}
