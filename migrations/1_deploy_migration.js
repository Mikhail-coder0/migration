const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const Zoracles = artifacts.require('Zoracles');

module.exports = async (deployer, network) => {

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
};
