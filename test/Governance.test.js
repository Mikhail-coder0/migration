const { expectRevert, time } = require('@openzeppelin/test-helpers');
const ethers = require('ethers');
const Zoracles = artifacts.require('Zoracles');
const Timelock = artifacts.require('Timelock');
const GovernorAlpha = artifacts.require('GovernorAlpha');

function encodeParameters(types, values) {
    const abi = new ethers.utils.AbiCoder();
    return abi.encode(types, values);
}

contract('Governor', ([alice, minter, dev]) => {
    it('should work', async () => {
        this.zora = await Zoracles.new({ from: alice });
        await this.zora.initialize();

        assert.equal((await this.zora.totalSupply()).valueOf(), '10000000000000');
        assert.equal((await this.zora.balanceOf(alice)).valueOf(), '10000000000000');

        await this.zora.transfer(minter, '100000000000', { from: alice });
        await this.zora.transfer(dev, '900000000000', { from: alice });

        assert.equal((await this.zora.balanceOf(alice)).valueOf(), '9000000000000');
        assert.equal((await this.zora.balanceOf(minter)).valueOf(), '100000000000');
        assert.equal((await this.zora.balanceOf(dev)).valueOf(), '900000000000');

        await this.zora.delegate(dev, { from: dev });
        await this.zora.delegate(minter, { from: minter });

        // Transfer ownership to timelock contract
        this.timelock = await Timelock.new({ from: alice });
        await this.timelock.initialize(alice, time.duration.days(2));

        this.gov = await GovernorAlpha.new({ from: alice });
        await this.gov.initialize(this.timelock.address, this.zora.address, alice);

        await this.timelock.setPendingAdmin(this.gov.address, { from: alice });
        await this.gov.__acceptAdmin({ from: alice });

        assert.equal((await this.gov.quorumVotes()).valueOf(), '1000000000000', "Qorum vote should be 10% of total supply");

        await this.zora.transferOwnership(this.timelock.address, { from: alice });
        await expectRevert(
            this.zora.mint(alice, 100, { from: alice }),
            'Ownable: caller is not the owner',
        );

        await expectRevert(
            this.gov.propose(
                [this.zora.address], ['0'], ['mint(address,uint256)'],
                [encodeParameters(['address', 'uint256'], [alice, 100])],
                'Mint Token',
                { from: minter },
            ),
            'GovernorAlpha::propose: proposer votes below proposal threshold',
        );

        await this.gov.propose(
            [this.zora.address], ['0'], ['mint(address,uint256)'],
            [encodeParameters(['address', 'uint256'], [alice, 100])],
            'Mint Token',
            { from: dev },
        );

        await time.advanceBlock();
        await this.gov.castVote('1', true, { from: dev });
        await this.gov.castVote('1', true, { from: minter });

        await expectRevert(this.gov.queue('1'), "GovernorAlpha::queue: proposal can only be queued if it is succeeded");

        console.log("Advancing 28800 blocks. Will take a while...");
        for (let i = 0; i < 28800; ++i) {
            await time.advanceBlock();
        };

        await this.gov.queue('1');
        await expectRevert(this.gov.execute('1'), "Timelock::executeTransaction: Transaction hasn't surpassed time lock.");
        await time.increase(time.duration.days(3));
        await this.gov.execute('1');
        assert.equal((await this.zora.totalSupply()).valueOf(), '10000000000100');
    });
});
