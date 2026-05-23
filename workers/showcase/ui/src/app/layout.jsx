import { Provider } from "@/components/ui/provider"
import { Flex } from '@chakra-ui/react'
import { Fraunces, Inter_Tight } from 'next/font/google'
import Header from '@/components/Header'
import Navbar from '@/components/Navbar'
import Main from '@/components/Main'
import Footer from '@/components/Footer'

const fraunces = Fraunces({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    style: ['normal', 'italic'],
    variable: '--font-fraunces',
    display: 'swap',
})

const interTight = Inter_Tight({
    subsets: ['latin'],
    weight: ['400', '500', '600'],
    variable: '--font-inter-tight',
    display: 'swap',
})

export const metadata = {
    title: {
        default: 'Student Experience Story Archive Project',
        template: '%s | SESAP',
    },
}

export default function RootLayout({ children }) {
    return (
        <html suppressHydrationWarning lang="en" className={`${fraunces.variable} ${interTight.variable}`}>
            <body><Provider forcedTheme='light'>
                <Flex direction="column" minH="100dvh">
                    <Header/>
                    <Navbar/>
                    <Main>
                        {children}
                    </Main>
                    <Footer/>
                </Flex>
            </Provider></body>
        </html>
    )
}