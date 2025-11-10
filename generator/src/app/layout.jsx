import { Provider } from "@/components/ui/provider"
import { Flex } from '@chakra-ui/react'
import Header from '@/components/Header'
import Navbar from '@/components/Navbar'
import Main from '@/components/Main'
import Footer from '@/components/Footer'

export default function RootLayout({ children }) {
    return (
        <html suppressHydrationWarning lang="en">
            <body><Provider>
                <Flex direction="column" minH="100dvh">
                    <Header/>
                    <Navbar/>
                        <Main >
                            {children}
                        </Main>
                    <Footer/>
                </Flex>
            </Provider></body>
        </html>
    )
}