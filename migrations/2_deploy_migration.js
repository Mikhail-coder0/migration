const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const Timelock = artifacts.require('Timelock');

module.exports = async (deployer, network, accounts) => {

    // Deploying Timelock contract
    const timelock = await deployProxy(
        Timelock,
        [
            accounts[0],
            172800
        ],
        {
            deployer,
            unsafeAllowCustomTypes: true,
            initializer: 'initialize',
        });

    console.log("Successfully Deployed Timelock", timelock.address);
};
