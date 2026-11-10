#  VerbrauchsBlick

Eine mobile Web-App (MVP) zur schnellen Erfassung von Stromzählerständen und zur automatischen Berechnung der aktuellen Kostenbilanz im laufenden Abrechnungsperioden-Turnus.

 **Live-Demo (MVP):** [verbrauchsblick.vercel.app](https://verbrauchsblick.vercel.app)

---

##  Hauptfunktionen

- **Stromstatus & Kostenbilanz:** Automatische Gegenüberstellung von verbrauchtem Strom, bisher gezahlten Abschlägen und aktuellem Überschuss/Minus.
- **Zählerstand-Erfassung:** Einfache Eingabe und Speicherung des aktuellen Zählerstands in kWh.
- **Vertragskonfiguration:** Pflege von Grundpreis (€/Monat), Arbeitspreis (ct/kWh) und monatlichem Abschlag.
- **Turnusverwaltung:** Festlegen von Start-Zählerstand und Turnusbeginn für eine genaue Abrechnungsperiode.
- **Cross-Platform & Mobile First:** Optimierte Nutzung im mobilen Browser sowie native App-Integration via Capacitor.

---

##  Tech Stack

- **Frontend:** Vue 3 (Composition API) & TypeScript
- **UI Framework:** Ionic Framework
- **Cross-Platform:** Capacitor (Android Integration)
- **Build Tool:** Vite
- **Deployment:** Vercel

---

##  Lokale Entwicklung

```bash
# Repository klonen
git clone [https://github.com/Tobias-Kroll/VerbrauchsBlick.git](https://github.com/Tobias-Kroll/VerbrauchsBlick.git)

# Abhängigkeiten installieren
npm install

# Entwicklungs-Server starten
npm run dev
