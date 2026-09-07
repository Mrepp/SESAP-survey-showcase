'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { createSesapSystem } from '@sesap/design-system';

const system = createSesapSystem();

export function Provider({ children }: { children: React.ReactNode }) {
  return <ChakraProvider value={system}>{children}</ChakraProvider>;
}
