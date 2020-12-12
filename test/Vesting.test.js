const { expectRevert, time } = require('@openzeppelin/test-helpers');
const Zoracles = artifacts.require('Zoracles');
const Vesting = artifacts.require('Vesting');

contract('Vesting', ([alice, bob]) => {
    beforeEach(async () => {
        this.zora = await Zoracles.new({ from: alice });
        await this.zora.initialize();

        this.vesting = await Vesting.new(this.zora.address);
    });

    it('should have correct contract address', async () => {
        const tokenAddress = await this.vesting.token();
        assert.equal(tokenAddress.valueOf(), this.zora.address);
    });

    it('should revert if token not approved for vesting', async () => {
        await expectRevert(
            this.vesting.deposit(bob, 100, 60, 180, { from: alice }),
            "ERC20: transfer amount exceeds allowance"
        );
    });

    it('should correctly return the vesting info of an address', async () => {
        await this.zora.approve(this.vesting.address, 50, { from: alice });

        // Vesting token for beneficary bob
        await this.vesting.deposit(bob, 50, 5, 25, { from: alice });

        let result = await this.vesting.addressInfo(bob);
        result = result.valueOf();

        assert.equal(result.vestedTokens, 50);
        assert.equal(result.cliffPeriod, 5);
        assert.equal(result.vestingPeriod, 25);
        assert.equal(result.withdrawalPerDay, 2);
    });

    it('should correctly vest and withdraw the token after cliff period', async () => {
        await this.zora.approve(this.vesting.address, 180, { from: alice });

        // Vesting token for beneficary bob
        await this.vesting.deposit(bob, 180, 60, 180, { from: alice });

        let result = await this.vesting.addressInfo(bob);
        result = result.valueOf();

        // Checking if vested token balance of bob is 180
        assert.equal(result.vestedTokens, 180);

        // Increasing time by 60 days
        await time.increase(time.duration.days(60));

        let availableTokens = await this.vesting.getAvailableTokens(bob);

        // Checking if available tokens become 0 after releasing token of cliff period
        assert.equal(Number(availableTokens.valueOf()), 60);

        // Releasing Vested Token
        await this.vesting.withdraw({ from: bob });

        const alreadyWithdrawn = await this.vesting.tokensAlreadyWithdrawn(bob);

        // Checking if tokens withdrawn is correct (60)
        assert.equal(Number(alreadyWithdrawn.valueOf()), 60);

        availableTokens = await this.vesting.getAvailableTokens(bob);

        // Checking if available tokens become 0 after releasing token of cliff period
        assert.equal(Number(availableTokens.valueOf()), 0);
    });

    it('should correctly return the available tokens to withdraw', async () => {
        await this.zora.approve(this.vesting.address, 180, { from: alice });

        // Vesting token for beneficary bob
        await this.vesting.deposit(bob, 180, 60, 180, { from: alice });

        // Increasing time by 99 days
        await time.increase(time.duration.days(99));

        let availableTokens = await this.vesting.getAvailableTokens(bob);

        // Checking if available tokens is correct
        assert.equal(Number(availableTokens.valueOf()), 99);
    });

    it('should correctly update the total token vested', async () => {
        await this.zora.approve(this.vesting.address, 1000);

        await this.vesting.deposit(bob, 100, 1, 5, { from: alice });

        let result = await this.vesting.totalTokensVested();
        assert.equal(result.valueOf(), 100);

        await this.vesting.deposit(alice, 500, 1, 5, { from: alice });

        result = await this.vesting.totalTokensVested();
        assert.equal(result.valueOf(), 600);
    });

    it('should revert for calling release before cliff period', async () => {
        await this.zora.approve(this.vesting.address, 100);

        // Vesting token for beneficary bob
        await this.vesting.deposit(bob, 100, 20, 100, { from: alice });

        let result = await this.vesting.addressInfo(bob);
        result = result.valueOf();

        // Checking if vested balance of bob is 100
        assert.equal(result.vestedTokens, 100);

        // Increasing time by 19 days
        await time.increase(time.duration.days(19));

        // Releasing Vested Token
        await expectRevert(
            this.vesting.withdraw({ from: bob }),
            "Vesting: Cliff period is not over yet"
        );
    });

    it('should revert for calling if no token vested', async () => {
        await expectRevert(
            this.vesting.withdraw({ from: bob }),
            "Vesting: You don't have any vested token"
        );
    });

    it('should revert if beneficary already have vested tokens', async () => {
        await this.zora.approve(this.vesting.address, 150);

        // Vesting token for beneficary bob
        await this.vesting.deposit(alice, 100, 20, 100, { from: alice });

        await expectRevert(
            this.vesting.deposit(alice, 50, 5, 25, { from: alice }),
            "Vesting: Beneficiary already have vested token. Use another address"
        );
    });
});
