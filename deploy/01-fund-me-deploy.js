const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")



module.exports.default = async hre => {
    const { getNamedAccounts, deployments } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethToUsdPriceFeed"]
    let ethUsdPriceFeedAddress

    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethToUsdPriceFeed"]
    }

    //if the contract doesn't exist, we deploy a minimal version for our
    //local testing.

    await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress], //add price feed address to FundMe's constructor
        log: true
    })
}

module.exports.tags = ["all", "mocks"]
/**
 * Why are we parameterizing the address of the aggregatorV3interface?
 * --> Its bcz the contract of the pricefeed we specified does not exist in the
 * hardhat local network node. That is, in order to work in a local blockchain network
 * like hardhat, a parameter should be sent while the creation of contract and not hardcode it.
 *
 * --> That is, we use mocking when working on a local chain
 * --> We can use hardcoded address if use the concept of forking.
 *
 */

