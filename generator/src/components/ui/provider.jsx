'use client'

import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { ColorModeProvider } from './color-mode'
import {system} from '@/components/theme'

export function Provider(props) {
  //replace defaultSystem w system
  return (
    <ChakraProvider value={system}> 
      <ColorModeProvider {...props} />
    </ChakraProvider>
  )
}
