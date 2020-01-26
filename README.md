# Vinstraffbot
Henter readme sine vinstraffer fra Google sheets og viser de i Slack.

## Hvordan fungerer det?
Dette er et Google App Script som knytter seg til regnearket som holder på alle vinstraffene våre. Dette skriptet kalles av en kommando i Slack, ved hjelp av Slack API-et.

## Hvordan kan jeg bidra?
For å oppdatere koden _må_ du ha full tilgang til vinstraffdokumentet, i kraft av å være medlem av readme-gruppen på Drive eller "eie" dokumentet, ellers får du ikke publisert endringene dine når du er ferdig.

Dersom dette er i orden, er det bare å laste ned koden og endre den. Merk at Google App Script egentlig er vanlig JavaScript, men støtter _**ikke**_ ES6+ syntaks. Når du er ferdig med endringene dine må du gå til regnarket, velge "Verktøy" og så "Skriptredigering". Der må du så lime inn koden, lagre og klikke "Distribuer som nettprogram" under "Publiser". Husk å velge ny produktversjon i vinduet som nå kommer opp! Klikk så publiser. 

Kopier linken du får opp, og oppdater appkonfigurasjonen til [Slack-appen](https://api.slack.com/apps/ANGC7KUFL/general?). For å få tilgang her, må du legges til som en collaborator. Send en e-post til [andreas.h.haaversen@gmail.com](andreas.h.haaversen@gmail.com), så legger jeg deg til.

Vel framme i konfigurasjonsvinduet, må du velge "Slash commands" i sidemenyen, klikke på "Edit"-ikonet ved siden av appnanvet og lime inn URL-en du kopierte i feltet "Request URL". Klikk så save, og du er i mål!
