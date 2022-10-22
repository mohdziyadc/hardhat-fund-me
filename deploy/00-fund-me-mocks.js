/**
 * We dont need to deploy mocks to rinkeby or goerli networks as they
 * already contain the priceFeed contract.
 * We need a mock priceFeed Contract for our local hardhat network.
 */

const { network } = require("hardhat")
const {
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER
} = require("../helper-hardhat-config")

module.exports.default = async hre => {
    /**
     * Equivalent to:
     * async ({getNamedAccounts, deployements}) => {}
     */
    const { getNamedAccounts, deployments } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    // const chainId = network.config.chainId

    if (developmentChains.includes(network.name)) {
        log("Local network detected. Deploying mocks..")
        await deploy("MockV3Aggregator", {
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER]
        })
        log("Mocks Deployed!!")
        log("-----------------------------------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]
