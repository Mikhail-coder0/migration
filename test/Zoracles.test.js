const { expectRevert } = require('@openzeppelin/test-helpers');
const Zoracles = artifacts.require('Zoracles');

contract('Zoracles', ([alice, bob, carol]) => {
    beforeEach(async () => {
        this.zora = await Zoracles.new({ from: alice });
        await this.zora.initialize();
    });

    it('should have correct name, symbol, decimal and totalSupply', async () => {
        const name = await this.zora.name();
        const symbol = await this.zora.symbol();
        const decimals = await this.zora.decimals();
        const totalSupply = await this.zora.totalSupply();
        assert.equal(name.valueOf(), 'Zoracles');
        assert.equal(symbol.valueOf(), 'ZORA');
        assert.equal(decimals.valueOf(), '9');
        assert.equal(totalSupply.valueOf(), '10000000000000');
    });

    it('should supply token transfers properly', async () => {
        await this.zora.transfer(bob, '4000000000000', { from: alice });
        await this.zora.transfer(carol, '1000000000000', { from: bob });
        const totalSupply = await this.zora.totalSupply();
        const aliceBal = await this.zora.balanceOf(alice);
        const bobBal = await this.zora.balanceOf(bob);
        const carolBal = await this.zora.balanceOf(carol);
        assert.equal(totalSupply.valueOf(), '10000000000000');
        assert.equal(aliceBal.valueOf(), '6000000000000');
        assert.equal(bobBal.valueOf(), '3000000000000');
        assert.equal(carolBal.valueOf(), '1000000000000');
    });

    it('should fail if you try to do bad transfers', async () => {
        await expectRevert(
            this.zora.transfer(carol, '10000000000001', { from: alice }),
            'ERC20: transfer amount exceeds balance',
        );
        await expectRevert(
            this.zora.transfer(carol, '1', { from: bob }),
            'ERC20: transfer amount exceeds balance',
        );
    });
});