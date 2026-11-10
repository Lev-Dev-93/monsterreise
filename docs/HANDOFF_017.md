# Übergabe Chat 00 – Auftrag 017
Status: Integrationskandidat erstellt; 107/107 Node-Tests erfolgreich. Kein Desktop-/iPhone-Praxistest durchgeführt.
Neue Dateien: `src/battle/TrainerBattle.js`, `tests/trainer-017.test.js`, `docs/INTEGRATION_017.md`, `docs/HANDOFF_017.md`, `docs/TESTRESULT_017.txt`.
Geänderte Dateien: `src/world/maps/startVillage.js`, `src/ui/BattleView.js`, `src/main.js`, `index.html`.
Schnittstellen: `trainerWorldEvent`, `firstBattleReady`, `createTrainerTestBattle`, `chooseOpponentMove`, `BattleView.openTrainerBattle`, `onOpenChange`.
Integration: Der vorläufige Trainer startet den bestehenden Kampf nach Dialogabschluss. Gegner handelt automatisch; Rückkehr an gleiche Weltposition nach Ergebnis; andere Menüs und Bewegung während Kampf gesperrt. Manuelle Testtaste als Fallback bis zur Praxisfreigabe.
Offen: Desktop-/iPhone-Praxistests, spätere reguläre Attackenlisten, Team-KP/AP-Persistenz, Gegner ohne AP, vollständige Trainer-KI, endgültiger NPC und Belohnungen.
