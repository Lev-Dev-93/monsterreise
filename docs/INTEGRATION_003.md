# Entwicklungsauftrag 003 – Integrationsvertrag (vorläufig)

- `Game({canvas,controls,session?,ui?})` nutzt standardmäßig `WorldSession`, `session.world`, `session.spawn()`.
- `Game.interact()` verarbeitet `WorldSession.interact(player)`; `transition` aktualisiert Welt, Position und Kamera sofort.
- `Input.consumeInteract():boolean` liefert einmaliges Signal bei Enter, Leertaste oder Touch-Aktion. Halten wiederholt nicht.
- `UI.showDialog({npcId,speaker,lines})`, `UI.isDialogOpen()`, `UI.advanceDialog()` sind provisorisch; während Dialogen ist Bewegung gesperrt.
- `Renderer.render({world,player,camera})` unverändert; optional `world.tileAt(x,y)` für Terrainfarben und `world.npcs` für Platzhalter.
- Chat 05: Farben und NPC-Formen durch finale Darstellung ersetzen, keine Regeln im Renderer.
- Chat 06: Vorläufige Dialoganzeige durch Dialogmodul ersetzen; NPC-Texte sind nicht kanonisch.
- Chat 10: Safari auf Mac/iPhone, Pointer-Eingabe, Orientierung, GitHub Pages und Performance manuell prüfen.
- Nicht enthalten: Speichern, endgültige Karten/Grafiken, Story, Animationen, automatische Türöffnung.
