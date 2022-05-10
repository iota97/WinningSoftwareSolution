# Requisiti
npm

MariaDB

# Configurazione
La configurazione è nel file: `.env`, crearlo se non esiste

Configurare la login del proprio server SQL MariaDB

#### Testing
Installare dipendenze con:

`npm install`

Installare globalmente il tool localtunnel con:

`npm install -g localtunnel`

Prima di avviare il server, configurare con SERVER_URL il link ritornato eseguendo:

`lt --port 8080`

#### Deploy
Configurare SEVER_URL con l'URL del proprio server (deve essere in HTTPS)

#### Esempio di configurazione
```
PORT=8080
DB_HOST="localhost"
DB_USER="username"
DB_PWD="password"
DB_NAME="OnlineStore"
API_KEY=5c29520422f9528344aa64a1
SERVER_URL="yummy-squids-jam-93-70-101-17.loca.lt"
```

# Creare le tabelle del database
Collegarsi a MariaDB con:

`sudo mysql -u root -p`

Eseguire le seguenti query:

```
USE OnlineStoreTest;
DROP TABLE PaymentEntries;
DROP TABLE SettledPayments;
DROP TABLE LastBlockSynced;
CREATE TABLE PaymentEntries (id bigint, ecommerce varchar(255) not null, price bigint not null, primary key(id));
CREATE TABLE SettledPayments (id bigint, item_id bigint not null, buyer varchar(255) not null, status int not null, created bigint not null, confirmed bigint, primary key(id));
CREATE TABLE LastBlockSynced (id int(1), value bigint not null, primary key(id));
INSERT INTO LastBlockSynced (id, value) VALUES (0, 0);
USE OnlineStore;
DROP TABLE PaymentEntries;
DROP TABLE SettledPayments;
DROP TABLE LastBlockSynced;
CREATE TABLE PaymentEntries (id bigint, ecommerce varchar(255) not null, price bigint not null, primary key(id));
CREATE TABLE SettledPayments (id bigint, item_id bigint not null, buyer varchar(255) not null, status int not null, created bigint not null, confirmed bigint, primary key(id));
CREATE TABLE LastBlockSynced (id int(1), value bigint not null, primary key(id));
INSERT INTO LastBlockSynced (id, value) VALUES (0, 0);
```

# Installazione dipendenze
`npm install`

# Avvio
`npm start`

Un demone riavvia il server ogni volta che un file typescript viene modificato per facilitare lo sviluppo

# Test server
`npm test`

# Test WebApp
Per eseguire i test sulla Web App si è scelto di utilizzare JSCover in modalità proxy.

In altre parole, i file js dell'applicazione passeranno attraverso un server proxy che li trasformerà e terrà traccia della loro copertura.

Per eseguire i test sarà necessario:
1. [avviare il server della Web App](##avvio-del-server-shopchain);
2. [avviare il server di JSCover](##avvio-del-server-proxy);
3. [configurare il proxy](##configurazione-del-proxy);
4. [eseguire e salvare i test](##esecuzione-dei-test).


## Avvio del server ShopChain
Il server ShopChain va avviato regolarmente con il comando `npm start`.

## Avvio del server proxy
Per avviare il server proxy eseguire il seguente comando:

`java -jar JSCover-all.jar -ws --proxy --port=3128 --report-dir=jscoverage --local-storage`

È possibile cambiare porta nel caso la `3128` sia già occupata.

## Configurazione del proxy
Il server da raggiungere è un server locale ma spesso le impostazioni del browser o del sistema operativo impediscono l'uso del proxy quando ci si collega a `localhost` o a `127.0.0.1`.

Per questo motivo è necessario aggiungere un nuovo host chiamato `localhost-proxy` alla lista degli host noti (`/etc/hosts` nei sistemi Unix) e impostare come proxy `localhost-proxy:3128`.

## Esecuzione dei test
Per eseguire i test sarà necessario connettersi a [`http://localhost-proxy:8080`](http://localhost-proxy:8080).

### Salvataggio dei dati
JSCover terrà traccia di ogni linea di codice eseguita e salverà i dati nel localStorage di HTML5.

Per salvare i dati nella cartella `jscoverage` sarà necessario:
1. caricare la pagina [`http://localhost-proxy:8080/jscoverage.html`](http://localhost-proxy:8080/jscoverage.html);
2. aprire la tab "Store";
3. cliccare su "Store Report".

### Cancellazione dei dati
I dati dei test sono cumulativi, pertanto quando bisogna effettuare i test da zero è necessario cancellare i dati salvati.

Per cancellare i dati è necessario caricare la pagina [`http://localhost-proxy:8080/jscoverage-clear-local-storage.html`](http://localhost-proxy:8080/jscoverage-clear-local-storage.html).

### Vedere i report
Per visualizzare il report è sufficiente:
1. caricare la pagina [`http://localhost-proxy:8080/jscoverage.html`](http://localhost-proxy:8080/jscoverage.html);
2. aprire la tab "Summary".

# Altro
### Selezione rete di test da Metamask
Andare su https://chainlist.org/ ricercare "mumbai" e cliccare "Connect Wallet" e "Add to Metamask" (in alto metamask dovrebbe mostrare questa rete, oppure selezionarla dalla lista)

### Aggiungere valuta al wallet (rete di test)
Andare su https://faucet.polygon.technology/ inserire il proprio wallet e cliccare "Submit"
Andare su https://faucets.chain.link/mumbai per i Chain Link

### Collegare il chain link al contratto per il timer
Registrarsi su https://keepers.chain.link/new

### In caso di modifica contratto
Se il contratto viene modificato potrebbe diventare inconsistente con DB SQL, eliminate il contenuto delle tabelle e il server effettuerà un sync completo
