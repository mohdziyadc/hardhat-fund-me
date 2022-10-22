const networkConfig = {
    5: {
        name: "goerli",
        ethToUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e"
    },

    137: {
        name: "polygon",
        ethToUsdPriceFeed: "0xffffffffffffffffffffff"
    }
}

const developmentChains = ["hardhat", "localhost"]

const DECIMALS = 8
const INITIAL_ANSWER = 200000000 //8 decimal places

module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER
}
