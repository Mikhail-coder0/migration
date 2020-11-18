const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const Zoracles = artifacts.require('Zoracles');
const Timelock = artifacts.require('Timelock');
const GovernorAlpha = artifacts.require('GovernorAlpha');

module.exports = async function (deployer, network, accounts) {
    // Deploying Zoracles Token
    const zoracles = await deployProxy(
        Zoracles,
        [],
        {
            deployer,
            unsafeAllowCustomTypes: true,
            initializer: 'initialize',
        });

    console.log("Successfully Deployed Zoracles token", zoracles.address);

    // Deploying Timelock contract
    const timelock = await deployer.deploy(
        Timelock,
        accounts[0],   // Admin account
        172800,    // 2 days delay
    );

    console.log("Successfully Deployed Timelock", timelock.address);

    // Deploying Governance contract
    const governance = await deployer.deploy(
        GovernorAlpha,
        timelock.address,   // Timelock address
        zoracles.address,   // Zoracles address
        accounts[0],   // Guardian account
    );

    console.log("Successfully Deployed Governance", governance.address);

    // Set pending admin for timelock
    console.log("\nsetting pending admin for timelock...")
    await timelock.setPendingAdmin(governance.address);
    console.log("Successfully set governance as pending admin for timelock !!\n");

    // Accept admin from governance'
    console.log("accepting admin for timelock...")
    await governance.__acceptAdmin();
    console.log("Successfully accepted governance as new admin for timelock !!\n");

    // Set Timelock to be admin for zoracles token
    console.log("transferring ownership of zoracles token....")
    await zoracles.transferOwnership(timelock.address);
    console.log("Successfully transferred Zoracles token owneship to timelock !!\n");
};
