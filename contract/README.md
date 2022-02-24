## Requirements

Truffle (and some plugins) are required to compile, deploy, verify and testing the contract.
```
npm install
npm install -g truffle
npm install @truffle/hdwallet-provider
npm install truffle-plugin-verify
npm install solidity-coverage
```

Openzeppelin and Chainlink libraries are also required.
```
npm install @openzeppelin/contracts
npm install @chainlink/contracts
```

Some files are not included for privacy, they need to be manually created:

`mnemonic.secret` with your secret mnemonic phrase.

`providerlink.secret` with the link to the node's provider for the choosen network, with API key if needed (Eg.: https://polygon-mumbai.g.alchemy.com/v2/SECRET).

`apikey.secret` with your Etherscan/BSCscan/Polygonscan API key, for verifying the contract's code.

## Compiling, Deploying and Verifying

```
truffle compile
```
to compile.
```
truffle deploy --network <YOUR-NETWORK>
```
to deploy. Add ```--reset --compile-none``` or change ```providerlink.secret``` from https to wss if any timeout errors show up while deploying.
```
truffle run verify ShopContract --network <YOUR-NETWORK>
```
to verify.

Networks are defined in `truffle-config.js`, the network included in this project by default is polygon_mumbai.

## Testing
```
truffle test --network <YOUR-NETWORK> ./test/shopcontract.js
```
to test (without coverage).
```
truffle run coverage --file="./test/shopcontract.js" --solcoverjs ./.solcover.js
```
to test (with coverage).

