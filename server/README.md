# Configurazione
La configurazione è nel file: .env

Configurare con la login del proprio server MariaDB

Configurare SERVER_URL con un URL a tinyurl che punto al proprio IP locale che passa per sslip.io ad esempio "http://192.168.0.15.sslip.io:8080/"

Esempio:

PORT=8080
DB_HOST="localhost"
DB_USER="username"
DB_PWD="password"
DB_NAME="OnlineStore"
API_KEY=5c29520422f9528344aa64a1
SERVER_URL="tinyurl.com/2p8vu62x"

# Contratto
ABI e indirizzo del contratto sono in "public/contract/contract.json"

# Database
Collegarsi a MariaDB con:

sudo mysql -u root -p

Eseguire le seguenti query:

USE OnlineStoreTest;
DROP TABLE PaymentEntries;
DROP TABLE SettledPayments;
DROP TABLE LastBlockSynced;
CREATE TABLE PaymentEntries (id bigint, ecommerce varchar(255), price bigint, primary key(id));
CREATE TABLE SettledPayments (id bigint, item_id bigint, buyer varchar(255), status int, created varchar(32), confirmed varchar(32), primary key(id));
CREATE TABLE LastBlockSynced (id int(1), value bigint, primary key(id));
INSERT INTO LastBlockSynced (id, value) VALUES (0, 0);
USE OnlineStore;
DROP TABLE PaymentEntries;
DROP TABLE SettledPayments;
DROP TABLE LastBlockSynced;
CREATE TABLE PaymentEntries (id bigint, ecommerce varchar(255), price bigint, primary key(id));
CREATE TABLE SettledPayments (id bigint, item_id bigint, buyer varchar(255), status int, created varchar(32), confirmed varchar(32), primary key(id));
CREATE TABLE LastBlockSynced (id int(1), value bigint, primary key(id));
INSERT INTO LastBlockSynced (id, value) VALUES (0, 0);

# Installazione dipendenze
npm install

# Avvio
npm start

Un demone riavvia il server ogni volta che un file typescript viene modificato per facilitare lo sviluppo

# Test
Eseguire npm test

# In caso di modifica contratto
Se il contratto viene modificato potrebbe diventare inconsistente con DB SQL, eliminate tutte le tabelle e il server effettuerà un sync completo

# Selezione rete di test da Metamask
Andare su https://chainlist.org/ ricercare "mumbai" e cliccare "Connect Wallet" e "Add to Metamask" (in alto metamask dovrebbe mostrare questa rete, oppure selezionarla dalla lista)

# Aggiungere valuta al wallet (rete di test)
Andare su https://faucet.polygon.technology/ inserire il proprio wallet e cliccare "Submit"
Andare su https://faucets.chain.link/mumbai per i Chain Link

# Collegare il chain link al contratto per il timer
Registrarsi su https://keepers.chain.link/new