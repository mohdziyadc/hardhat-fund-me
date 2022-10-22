require("dotenv").config()
require("@nomicfoundation/hardhat-toolbox")
require("hardhat-deploy") //for easy deployement of contracts. run hardhat-deploy
//after running it, run yarn add --dev @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers ethers for ethers support
/** @type import('hardhat/config').HardhatUserConfig */

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const COINMARKETCAP_KEY = process.env.COINMARKET_API_KEY

module.exports = {
    solidity: {
        compilers: [
            {
                version: "0.8.7"
            },
            {
                version: "0.6.6"
            }
        ]
    }, //Multiple solidity compilers
    namedAccounts: {
        deployer: {
            default: 0
        },
        user: {
            default: 1
        }
    },
    networks: {
        goerli: {
            url: GOERLI_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 5
        }
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COINMARKETCAP_KEY
    }
}
