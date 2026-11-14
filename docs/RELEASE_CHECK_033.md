# Monsterreise 033 – GitHub-Pages-Paketprüfung

- Grundlage: vollständiger Kandidat 032, keine Änderung an Spielquellen, Speicherformat oder Regeln.
- Veröffentlichungsstruktur: `index.html`, `styles.css`, `src/` unmittelbar im ZIP-Stamm; ES-Module werden relativ zu `src/main.js` geladen.
- Alle lokalen statischen Importpfade wurden gegen die enthaltenen Dateien geprüft; externe Ressourcen und absolute lokale Dateipfade sind nicht erforderlich.
- GitHub Pages: relative Pfade ohne führenden Slash sind für einen Repository-Unterpfad `/monsterreise/` geeignet. Repository-/Pages-Einstellungen und HTTPS-Erreichbarkeit können erst nach Bereitstellung überprüft werden.
- Automatisierte Regression: `npm test`, 220/220 bestanden; vollständiges Protokoll `docs/TESTRESULT_033.txt` im Entwicklungs-ZIP.
- Keine Browser-/Mac-Abnahme durch diesen Paketcheck. Keine Veröffentlichung durchgeführt.
- Testspielstand-Erzeugung im JavaScript enthalten; keine echten gespeicherten Nutzerdaten in der ZIP. Lokaler Browser-Speicher wird nicht automatisch migriert.
- Achtung: `index.html` zeigt weiterhin „Integrationstest v0.3“, `package.json` weiterhin 0.3.1; historische Metadaten sind **keine** Produktfreigabe. Die ZIP-Dateien sind als v0.4-Testpakete bezeichnet.
