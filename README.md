# Contract Addresses

### Mainnet:

1. **Zoracle Token**: [0xD8E3FB3b08eBA982F2754988d70D57eDc0055ae6](https://etherscan.io/address/0xD8E3FB3b08eBA982F2754988d70D57eDc0055ae6)<br/>
2. **Governance**: [0xA7D2556Ac0F6cdCf264Ab882e5145A850e0cf7c3](https://etherscan.io/address/0xA7D2556Ac0F6cdCf264Ab882e5145A850e0cf7c3)<br/>
3. **Timelock**: [0x1e3c7B78d1c50Eb08e1bf85622b3e1611aeA9C51](https://etherscan.io/address/0x1e3c7B78d1c50Eb08e1bf85622b3e1611aeA9C51)<br/>

### Testnet (Ropsten):

1. **Zoracle Token**: [0x5f994DD72D2Dd56E8F4895b244AB5Ec21C2893ed](https://ropsten.etherscan.io/address/0x5f994DD72D2Dd56E8F4895b244AB5Ec21C2893ed)<br/>
2. **Governance**: [0x53Bf04b6d0818b0Df53494Fda641b38c2275eF28](https://ropsten.etherscan.io/address/0x53Bf04b6d0818b0Df53494Fda641b38c2275eF28)<br/>
3. **Timelock**: [0x700FdFd395410826aC4e8f8f83534410fC1eC0F8](https://ropsten.etherscan.io/address/0x700FdFd395410826aC4e8f8f83534410fC1eC0F8)<br/>

# Steps to deploy

### Prerequisites:

- You should have `npm` installed in your system.
- You should have `INFURA API Key` which can be obtained from [Infura](https://infura.io/).

### Steps:

1. Clone the repository and, go inside the project directory.
2. Install all dependencies using command `npm install`.
3. Create a `.env` file by copying content of `sample.env`.
4. Fill the blank fields (_INFURA_KEY_ & _PRIVATE_KEY_) inside `.env` file.
5. Run command `npm run deploy:token --network mainnet` to deploy Zoracles (ZORA) token on mainnet.
6. Aftet completion of step 5, Run command `npm run deploy:timelock --network mainnet` to deploy Timelock contract.
7. Then, Run command `npm run deploy:governance --network mainnet` to deploy Governance contract and transferring ownerships.

**NOTE**: The step 5, 6 and 7 can take some time so, keep patience. Also, you can deploy all contracts using single command `npm run deploy --network mainnet` but, that is not recommended because if one will fail any state will not be saved.
