# Configurazione
La configurazione è nel file: .env

Configurare con la login del proprio server MariaDB, le tabelle verranno create in automatico se non presenti all'avvio
Configurare QR_URL con un URL a tinyurl che punto al proprio IP locale che passa per sslip.io ad esempio "http://192.168.0.15.sslip.io:8080/transazione"

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