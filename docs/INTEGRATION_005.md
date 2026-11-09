# Entwicklungsauftrag 005 – v0.2.2

## Änderungen
- `styles.css`: `-webkit-user-select: none`, `user-select: none`, `-webkit-touch-callout: none`, `-webkit-user-drag: none`, `touch-action: none` gezielt auf `#controls` und dessen Schaltflächen begrenzt. Safari-Tap-Highlight deaktiviert.
- `src/core/Input.js`: Pointer-ID wird dem ursprünglich gedrückten Button zugeordnet. `pointerup`, `pointercancel` und `lostpointercapture` geben diesen Kontakt frei, auch wenn das Ereignis ein anderes Ziel hat. Mehrfingerbedienung bleibt möglich. `blur` und verstecktes Dokument räumen den Zustand auf. `contextmenu`, `selectstart`, `dragstart` werden innerhalb der Steuerung verhindert. Ein Aktionsdruck wird nur einmal je gedrücktem Kontakt ausgelöst.
- `index.html`: Versionsbezeichnung angepasst.
- `package.json`: Versionsnummer 0.2.2.
- `tests/touch-safari-v022.test.js`: zusätzliche automatisierte Tests.

## Schnittstellen
Öffentliche API von `Input` unverändert: `getVector()`, `consumeInteract()`, `clear()`, `destroy()`. Interne Pointer-Verwaltung um `pointerButtons: Map<pointerId, HTMLElement>` ergänzt. `WorldSession`, `Game`, `Renderer`, `UI` unverändert.

## Tests
`npm test` bzw. `node --test tests/*.test.js` im Projektordner. Die neuen Tests simulieren Pointer-Events in Node.js und prüfen Halten, Loslassen, Abbruch, Capture-Verlust, Multitouch, Aktion und Event-Unterdrückung. CSS wird statisch überprüft.

**Manuell ausstehend:** iPhone Safari (langes Drücken 5–10 Sekunden, wiederholtes Loslassen, Finger außerhalb des Buttons, mehrere Finger, Bildschirmrotation, NPC-Aktion und Hausübergänge); Mac/Desktop-Tastatur und GitHub Pages Deployment. Node-Tests können das tatsächliche Safari-Kontextmenü nicht reproduzieren.

## Unverändert
Karten, NPC-Daten, Gebäudeportale, Spielregeln, Player und Kamera.
