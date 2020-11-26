const Zoracles = artifacts.require('Zoracles');
const Timelock = artifacts.require('Timelock');
const GovernorAlpha = artifacts.require('GovernorAlpha');

module.exports = async function (deployer, network, accounts) {

    // Creating instance for timelock and zoracles token
    const timelock = await Timelock.deployed();
    const zoracles = await Zoracles.deployed();
    const governance = await GovernorAlpha.deployed();

    // Set pending admin for timelock
    console.log("\nsetting pending admin for timelock...")
    await timelock.setPendingAdmin(governance.address, { from: accounts[0] });
    console.log("Successfully set governance as pending admin for timelock !!\n");

    // Accept admin from governance
    console.log("accepting admin for timelock...")
    await governance.__acceptAdmin({ from: accounts[0] });
    console.log("Successfully accepted governance as new admin for timelock !!\n");

    // Set Timelock to be admin for zoracles token
    console.log("transferring ownership of zoracles token....")
    await zoracles.transferOwnership(timelock.address, { from: accounts[0] });
    console.log("Successfully transferred Zoracles token owneship to timelock !!\n");
}
