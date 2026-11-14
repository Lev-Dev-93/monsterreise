# Monsterreise 034 – G7b: GitHub-Pages-Testbereitstellung

**Status:** statisch vorbereitet und automatisiert geprüft; **nicht hochgeladen**, **keine Browser-Abnahme**. Isolierter G5/G6-Entwicklungsstand. Kein produktiver Storymodus.

## Sicherheitskonzept

Ein **neues, separates öffentliches Repository** (Beispielname `monsterreise-034-kartentest`) verwenden. **Nicht** im bestehenden 033-Repository hochladen, keine vorhandene GitHub-Pages-Quelle umstellen, keine bestehende `index.html` ersetzen. Die 033-Adresse bleibt dadurch unverändert. Das ZIP enthält die komplette bisherige 034-Entwicklungsstruktur, einschließlich unveränderter DEV-`index.html` und `src/main.js`.

## Upload und Pages aktivieren (GitHub-Weboberfläche)

1. ZIP lokal entpacken. Den **Inhalt des Ordners `Monsterreise_034`** hochladen, nicht den Ordner selbst als Unterordner. In der Repository-Wurzel müssen `index.html`, `story-test.html`, `styles.css`, `src/`, `docs/`, `.nojekyll` liegen.
2. Auf github.com **New repository** wählen; beispielsweise `monsterreise-034-kartentest`, Sichtbarkeit **Public**, Repository erstellen. Das bestehende 033-Repository **nicht** auswählen. Keine sensiblen Daten hochladen; das Repository ist öffentlich.
3. Im neuen Repository **Add file → Upload files** und die entpackten Projektdateien samt Unterordnern hochladen, Commit bestätigen. Falls der Browser beim Ordnerupload versteckte Dateien auslässt: `.nojekyll` separat über **Add file → Create new file** anlegen (leer).
4. **Settings → Pages → Build and deployment → Source: Deploy from a branch**; Branch `main`, Ordner `/(root)` wählen und **Save**.
5. Auf die von GitHub angezeigte Pages-URL warten. Erwartete URL bei einem Projekt-Repository: `https://BENUTZERNAME.github.io/monsterreise-034-kartentest/story-test.html` (Benutzername und Repositoryname ersetzen; maßgeblich ist die URL in Settings → Pages). **Nicht** nur die Repo-Adresse `github.com/...` öffnen.
6. Desktop-Browser: `story-test.html` öffnen; für die erhaltene DEV-Fassung im **neuen Testrepository** optional `.../index.html` öffnen. Die ursprüngliche 033-Live-Adresse bleibt davon unabhängig.
7. G7-Browsercheck protokollieren: Start im Züchterhaus; Bewegung/Kollision; alle fünf Karten; acht Übergänge und Rückwege (Route-1-Eintritt bleibt absichtlich gesperrt, daher sind nicht alle acht im Testmodus durchspielbar); Kamera nach Kartenwechseln; Route-1-Sperre; DEV-`index.html`. Browserkonsole auf Fehler prüfen. Beobachtungen und Screenshot/Fehlertext an Chat 10 melden.

**Hinweis zu den acht Übergängen:** Weil `tr-village-route1` im Testmodus gesperrt ist, kann der Weg `tr-route1-village` nicht über den normalen Spielpfad erreicht werden. Beide müssen für die spätere vollständige Abnahme separat mit einer freigegebenen Teststrategie geprüft werden. Nicht als bestanden melden.

## Technische Grenzen

- Reine statische HTML/CSS/ES-Module, kein Node-Build und keine Server-API erforderlich. Die Pfade in `index.html` und `story-test.html` sind relativ; der Browser löst `./src/...` unter dem GitHub-Pages-Unterpfad auf.
- `story-test.html` importiert keinen produktiven StoryRuntime-Start; kein Story-Speichern, keine Startervergabe, keine Legacy-Migration.
- Die DEV-`index.html` bleibt im **separaten** Repository vorhanden; die 033-Live-Version wird nicht geändert.
- `.nojekyll` verhindert Jekyll-Verarbeitung. GitHub-Pages-Repository muss öffentlich sein, sofern der GitHub-Plan private Pages nicht erlaubt.
- Der Karten-Test ist ein **Entwicklungswerkzeug**, kein vollständig spielbarer Storymodus. Die Route-1-Sperre ist absichtlich.
- Erfolgreicher Upload und HTTP-200 sind **keine** bestandene Browser-Abnahme. GitHub-Veröffentlichung wurde nicht durchgeführt.

## Automatische Prüfung G7b

`node --test tests/*.test.js`: **311/311 bestanden**, 0 fehlgeschlagen. Statische Prüfung der lokalen relativen `src`-/`href`-Pfade und JavaScript-Imports: siehe `docs/G7B_STATIC_AUDIT.txt`. Diese Prüfungen ersetzen keine Browserausführung.
