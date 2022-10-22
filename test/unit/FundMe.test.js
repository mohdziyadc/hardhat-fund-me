const { assert, expect } = require("chai")
const { deployments, getNamedAccounts, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name) ? describe.skip
    : describe("FundMe", async () => {
        let fundMe
        let deployer
        let mockV3Aggregator
        const sendValue = ethers.utils.parseEther("25") // parses 1 ether to 10**18 wei
        beforeEach(async () => {
            deployer = (await getNamedAccounts()).deployer
            await deployments.fixture() //deploy everything in the deploy folder
            fundMe = await ethers.getContract("FundMe", deployer) //gives the most recently deployed FundMe contract
            //here fundMe is connected with the deployer
            mockV3Aggregator = await ethers.getContract(
                "MockV3Aggregator",
                deployer
            )
        })

        describe("constructor", async () => {
            it("sets the aggregator address correctly", async function () {
                // const response = await fundMe.priceFeed(); //for this line to work
                // the price feed variable should be public
                const response = await fundMe.getPriceFeed();
                assert.equal(response, mockV3Aggregator.address)
            })
        })

        describe("fund", async () => {
            it("Fails if you don't send enough ETH!", async () => {
                await expect(fundMe.fund()).to.be.revertedWith(
                    "You need to spend more ETH!"
                )
            })

            it("Updated the amount funded data structure", async () => {
                await fundMe.fund({ value: sendValue })
                const response = await fundMe.getAddressToAmountFunded(deployer)
                assert.equal(response.toString(), sendValue.toString())
            })

            it("Adds funder to array of funders", async () => {
                //to test this function, it is enough to prove that 
                // the funder and deployer is same
                await fundMe.fund({ value: sendValue })
                const funder = await fundMe.getFunder(0) //funder at 0th position
                assert.equal(funder, deployer)

            })
        })

        describe("withdraw", async () => {
            beforeEach(async () => {
                await fundMe.fund({ value: sendValue })
            })

            it("Withdraw ETH from a single funder", async () => {
                //Arrange
                const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

                //Act
                const transactionResponse = await fundMe.withdraw()
                const transactionReceipt = await transactionResponse.wait(1)

                const { gasUsed, effectiveGasPrice } = transactionReceipt
                const gasCost = gasUsed.mul(effectiveGasPrice)


                //Assert
                const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                const endingDeployerBalance = await fundMe.provider.getBalance(deployer)
                //This is the logic. endingFundMeBalance should be zero after withdraw()
                //and the endingDeployerBalance should be the sum of startingDeployerBalance
                //and startingFundMeBalance after withdraw()
                //But in this logic we haven't considered the gas cost
                //We also should consider all these variables as BigNumbers and not as uints.

                // assert(startingFundMeBalance, 0)
                // assert(startingDeployerBalance + startingFundMeBalance, endingDeployerBalance)

                assert(endingFundMeBalance.toString(), 0)
                assert(
                    startingDeployerBalance.add(startingFundMeBalance).toString(),
                    endingDeployerBalance.add(gasCost).toString()
                )

            })

            it("Withdraw from multiple funders", async () => {
                //Arrange
                const accounts = await ethers.getSigners()
                //We need to connect fundMe with the respective accounts
                //So that they can individually fund the fund() function
                for (let i = 1; i < 6; i++) {
                    const fundMeConnectedContract = await fundMe.connect(accounts[i])

                    fundMeConnectedContract.fund({ value: sendValue })

                }

                const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                const startingDeployerBalance = await fundMe.provider.getBalance(deployer)
                //Act
                const transactionResponse = await fundMe.withdraw()
                const transactionReceipt = await transactionResponse.wait(1)

                const { gasUsed, effectiveGasPrice } = transactionReceipt
                const gasCost = gasUsed.mul(effectiveGasPrice)

                //Assert
                const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                const endingDeployerBalance = await fundMe.provider.getBalance(deployer)
                assert(endingFundMeBalance.toString(), 0)
                assert(
                    startingDeployerBalance.add(startingFundMeBalance).toString(),
                    endingDeployerBalance.add(gasCost).toString()
                )

                //Make sure the funders array is reset
                await expect(fundMe.getFunder(0)).to.be.reverted //nothing won't be there in the array

                for (i = 1; i < 6; i++) {
                    assert.equal(await fundMe.getAddressToAmountFunded(accounts[i].address), 0)
                }


            })

            it("Test if only the owner accesses withdraw", async () => {
                const accounts = await ethers.getSigners()
                const attacker = accounts[1]

                const attackerConnectedContract = await fundMe.connect(attacker)
                await expect(attackerConnectedContract.withdraw()).to.be.revertedWithCustomError(fundMe,
                    "FundMe__NotOwner"
                )
            })
        })
    })
