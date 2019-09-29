# Vinstraffbot
Henter readme sine vinstraffer fra Google sheets og viser de i Slack.

## Hvordan fungerer det?
Dette er et Google App Script som knytter seg til regnearket som holder på alle vinstraffene våre. Dette skriptet kalles av en kommando i Slack, ved hjelp av Slack API-et.

## Hvordan kan jeg bidra?
Det er bare å laste ned koden og endre den. Merk at Google App Script egentlig er vanlig JavaScript, men støtter _**ikke**_ ES6+ syntaks. Når du er ferdig med endringene dine må du gå til regnarket, velge "Verktøy" og så "Skriptredigering". Der må du så lime inn koden og klikke "Distribuer som nettprogram" under "Publiser". Linken du så får bruker du til å oppdatere Slack-integrasjonen sin URL.
