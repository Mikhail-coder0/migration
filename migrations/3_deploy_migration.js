const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const Zoracles = artifacts.require('Zoracles');
const Timelock = artifacts.require('Timelock');
const GovernorAlpha = artifacts.require('GovernorAlpha');

module.exports = async function (deployer, network, accounts) {

    // Creating instance for timelock and zoracles token
    const timelock = await Timelock.deployed();
    const zoracles = await Zoracles.deployed();

    // Deploying Governance contract
    const governance = await deployProxy(
        GovernorAlpha,
        [
            timelock.address,   // Timelock address
            zoracles.address,   // Zoracles address
            accounts[0],   // Guardian account
        ],
        {
            deployer,
            unsafeAllowCustomTypes: true,
            initializer: 'initialize',
        });

    console.log("Successfully Deployed Governance", governance.address);
}
