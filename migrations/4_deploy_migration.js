const Zoracles = artifacts.require('Zoracles');
const Vesting = artifacts.require('Vesting');

module.exports = async function (deployer, network, accounts) {

    // Creating instance for zoracles token
    const zoracles = await Zoracles.deployed();

    // Deploy Vesting
    const vesting = await deployer.deploy(Vesting, zoracles.address);

    console.log("Successfully Deployed Vesting", vesting.address);
}
