# Galactic Dex - Malmö 2 Gruppen

Galactic Dex är en Web App som hämtar data från SWAPI och låter användaren bläddra bland karaktärer, planeter, rymdskepp och filmer, läsa detaljvyer, spara favoriter och använda appen med visst offline-stöd.

## Funktioner

* Visa featured-innehåll från flera Star Wars-kategorier
* Global sökning
* Filtrering av innehåll
* Detaljvyer för objekt
* Favoriter sparade i `localStorage`
* Offline-banner vid tappad nätverksanslutning
* PWA-stöd via service worker i produktionsläge
* Responsiv layout för mobil och desktop
* Automatiska tester för funktionalitet och tillgänglighet

## Kom igång

Installera beroenden:

```bash
npm install
```

Starta utvecklingsmiljön:

```bash
npm run dev
```

Kör tester:

```bash
npm test
```

## Automatiska tester

Projektet innehåller automatiska tester för både funktionalitet och tillgänglighet.

### Testområden

Vi har skrivit tester för bland annat:

* tillgänglighet med `axe-core`
* favorithantering
* offline-banner
* navigation/data-struktur
* detaljvy
* testmiljö med `jsdom` och `localStorage`

### Tillgänglighetstester med axe

Vi använde `axe-core` för att kontrollera tillgängligheten på:

* huvudsidan
* detaljvyn
* favoritsidan

Målet var att undvika allvarliga tillgänglighetsfel och att uppnå en hög nivå i Lighthouse/Accessibility.

### Vad vi hittade och vad vi fixade

Under arbetet med tillgänglighet hittade vi flera förbättringsområden i gränssnittet. Det handlade främst om att vissa interaktiva element behövde tydligare information för hjälpmedel som skärmläsare.

Det vi åtgärdade var bland annat:

* lade till `aria-label` på favoritknappar som tidigare bara visade symboler
* förbättrade navigationen med `aria-expanded` och `aria-controls` för mobilmenyn
* lade till `aria-pressed` på theme toggle/dark mode-knappen
* säkerställde att offline-bannern använder `role="alert"`
* såg över semantisk struktur i huvudsektioner och detaljvy
* kontrollerade att bilder har meningsfull `alt`-text
* använde labels och hjälpinformation för sökfält där det behövdes

Efter dessa ändringar kunde vi köra våra accessibility-tester utan kritiska eller allvarliga fel i de vyer vi testade.

## Offline-stöd

Appen använder service worker i produktionsläge för att ge stöd för cachade resurser och ett enklare offline-läge. När användaren tappar nätverksanslutning visas en offline-banner som informerar om att viss data kanske inte är uppdaterad.

### Kända begränsningar

* Offline-läget fungerar bäst för innehåll som redan har laddats tidigare
* Ny data från API:t kan inte hämtas utan nätverk
* Funktionaliteten är därför delvis offline-stöd, inte fullständig offline-funktionalitet

## Projektstruktur

Exempel på centrala delar i projektet:

* `main.js` – appens huvudflöde
* `featured.js` – rendering av featured och sökresultat
* `fetchData.js` – central datahämtning
* `card.js` – gemensam kortkomponent
* `detail.js` – detaljvy
* `favorites.js` / `favStore.js` – favorithantering
* `offlineBanner.js` – hantering av online/offline-status

## Reflektion kring tester

Testerna infördes främst under den senare delen av projektet men blev ett viktigt stöd i samband med refaktorering, pull requests och slutlig kvalitetssäkring. De hjälpte oss att upptäcka regressionsfel, säkerställa grundläggande funktionalitet och kontrollera att våra förbättringar för tillgänglighet faktiskt gav önskat resultat.

## Författare - Malmö Grupp 2
Jonathan Isaksson, Konstantinos Nascos, Jonatan Emil Dahl, Markus Nikolic, Rasha Knifdi, Felix Lidén



