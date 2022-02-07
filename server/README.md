# Configurazione
La configurazione è nel file: .env

Configurare con la login del proprio server MariaDB, le tabelle verranno create in automatico se non presenti all'avvio
Configurare SERVER_URL con un URL a tinyurl che punto al proprio IP locale che passa per sslip.io ad esempio "http://192.168.0.15.sslip.io:8080/"

# Installazione dipendenze
npm install

# Avvio
npm start

Un demone riavvia il server ogni volta che un file typescript viene modificato per facilitare lo sviluppo

# Test
npm test

Crea un report dei test, ancora pochi test dato che è un PoC e sarà modificato molto

# In caso di modifica contratto
Se il contratto viene modificato potrebbe diventare incosistente con DB SQL, eliminate tutte le tabelle e il server effettuerà un sync completo

# Selezione rete di test da Metamask
Andare su https://chainlist.org/ ricercare "mumbai" e cliccare "Connect Wallet" e "Add to Metamask" (in alto metamask dovrebbe mostrare questa rete, oppure selezionarla dalla lista)

# Aggiungere valuta al wallet (rete di test)
Andare su https://faucet.polygon.technology/ inserire il proprio wallet e cliccare "Submit"