import { createSystem, defaultConfig } from "@chakra-ui/react"


export const system = createSystem(defaultConfig, {
    theme: {
        tokens: {
            colors: {
                osuOffWhite: {value:' #f7f5f5'},
                osuOffBlack: {value: '#212529'},
                osuGray: {value: '#423e3c'},
                osuNavGray: {value: '#e9e5e4'},
                beavOrange: {value: '#D73F09'}
            },
        },
    },
})

// All colors sourced from OSU brand colors https://communications.oregonstate.edu/brand-guide/colors