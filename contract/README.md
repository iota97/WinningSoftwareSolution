## Requisiti

Truffle (e alcuni plugin) sono richiesti per compilare, effettuare il deploy, verificare e testare il contratto.
```
npm install
npm install -g truffle
npm install @truffle/hdwallet-provider
npm install truffle-plugin-verify
npm install solidity-coverage
```

Sono richieste anche librerie di Openzeppelin e Chainlink.
```
npm install @openzeppelin/contracts
npm install @chainlink/contracts
```

Alcuni file non sono inclusi nella repo per privacy, devono essere invece creati manualmente:

`mnemonic.secret` con la frase mnemonica del proprio wallet.

`providerlink.secret` con il link al provider del nodo (con chiave API se richiesta) (Es.: https://polygon-mumbai.g.alchemy.com/v2/SECRET).

`apikey.secret` con la chiave API di Etherscan/BSCscan/Polygonscan, per verificare il codice del contratto.

## Compilazione, deployment e verifica

```
truffle compile
```
per compilare.
```
truffle deploy --network <YOUR-NETWORK>
```
per eseguire il deploy sulla rete scelta. Aggiungere ```--reset --compile-none``` e/o cambiare il link in ```providerlink.secret``` da https a wss se appaiono errori di timeout.
```
truffle run verify ShopContract --network <YOUR-NETWORK>
```
per verificare il codice.
Questo comando restituirà un link a PolygonScan dove sarà possibile visionare codice verificato, indirizzo sulla quale il contratto è stato deployato e ABI del contratto.

Le reti sono definite in `truffle-config.js`, la rete di default per questo progetto è polygon_mumbai.

## Testing
```
truffle test --network <YOUR-NETWORK> ./test/shopcontract.js
```
per testare (senza coperture del codice).
```
sudo truffle run coverage --file="./test/shopcontract.js" --solcoverjs ./.solcover.js
```
per testare (con coperture del codice).


Attualmente deployato all'address [0xEdDF0fad7844aEa6546Bfb9E635da1481Ce20B1a](https://mumbai.polygonscan.com/address/0xEdDF0fad7844aEa6546Bfb9E635da1481Ce20B1a).
