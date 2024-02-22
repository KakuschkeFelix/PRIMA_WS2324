# PRIMA WiSe 23/24

- Titel: FurtwangenDrift
- Autor: Felix Kakuschke
- Jahr: Wintersemester 23/24
- Curriculum und Semester: Medieninformatik (MIB) 7
- Kurs: PRIMA
- Dozent: Prof. Jirka Dell´Oro-Friedl
- Link zur Anwendung: https://kakuschkefelix.github.io/PRIMA_WS2324/
- Link zum Source Code
  - Client: https://github.com/KakuschkeFelix/PRIMA_WS2324/tree/main/Script/Source
  - Server: https://github.com/KakuschkeFelix/PRIMA_WS2324/tree/main/Server
- Link zum Design Dokument: https://github.com/KakuschkeFelix/PRIMA_WS2324/blob/main/FurtwangenDrift.pdf

# Anleitung
## Benutzung
1. Das Spiel kann mit W/A/S/D oder den Pfeiltasten gespielt werden.
2. Zu Beginn muss eine Websocket Adresse eingegeben werden, welche zum Server zeigt (siehe Installation)
3. Nachdem beide Spieler eine Verbindung aufgebaut haben, kann das Spiel gespielt werden. Insgesamt müssen 3 Runden absolviert werden (konfigurierbar in external.json)

## Installation/Starten des Servers
1. Dieses Repository klonen
2. Die NPM Pakete installieren (`npm install`)
3. Den Server mit `npm run start:server` starten
   1. Optional kann ein Port angegeben werden mittels `npm run start:server -- --port xxxx`
4. Der Server gibt die Portnummer aus, die Verbindung erfolgt über `ws://<adresse>:<port>` z.B. `ws://localhost:4000`
5. **WICHTIG**: Der Client muss in der Lage sein, den Server zu erreichen, d.h. entsprechende Firewall Regeln müssen eingerichtet sein.

# Bewertungskriterien
(übernommen von https://github.com/JirkaDellOro/Prima/tree/master, am 21.02.2024)
| Erfüllt | Nr | Kriterium           | Erklärung                                                                                                                                     |
|---|---:|---------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| ✅ |  1 | Units and Positions | Das Start/Ziel Tile befindet sich bei (0,0). Ein Tile ist 3 x 3 Units, ein Auto ist 0.5 x 0.5 Units. Das erlaubt Proportionalität zwischen Auto und Track während genug Autos Platz haben. Es gibt keine Vertikalität auf der Rennstrecke, d.h. die Y-Koordinate ist immer bei 0. Die Geschwindigkeit der Autos bemisst sich in Units/s.                                                                |
| ✅ |  2 | Hierarchy           | Der Graph ist unterteilt in mehrere Child Nodes. Der Track, d.h. Straße und Gras befinden sich innerhalb der Node "Track". Die Border befindet sich innerhalb der Node "Border". Die Autos befinden sich innerhalb der Node "Cars". Jedes Tile, die Borders und die Autos besitzen dabei jeweils noch eigene Komponenten, wodurch die Tiles und Borders positioniert werden können und die Autos bewegt und zur Kamera ausgerichtet werden können.                                                                              |
| ✅ |  3 | Editor              | Der visuelle Editor wurde genutzt, um die Texturen zu laden sowie das Start/Ziel Tile bei (0,0) zu positionieren. Da der restliche Track sowie die Autos dynamisch definiert und platziert werden, wurde dies nicht im Editor, sondern programmatisch getan.                                                                |
| ✅ |  4 | Scriptcomponents    | ScriptComponents wurden für das Checkpoint Handling der Autos genutzt, um ihre Position im Graphen zu überprüfen. Ich denke, das dies der bei der Abstraktion hilft, diese Aufgabe jedoch auch ohne ScriptComponents gelöst werden könnte.                                                            |
| ✅ |  5 | Extend              | An mehreren Stellen wurden die Basisklassen von Fudge genutzt. Die Autos selber nutzen die fudgeAid.NodeSprite Klasse, die Tiles sind eine Erweiterung der fudge.Node Klasse. Dies war besonders von Nutzen, da viele Methoden und Eigenschaften der Parent Klasse genutzt werden konnten, zum Beispiel bei der Positionierung der Tiles.                         |
| ✅ |  6 | Sound               | Innerhalb des Spiels gibt es Sounds beim absolvieren einer Runde sowie beim Abschluss des Rennens, abhängig davon, ob der Spieler gewonnen oder verloren hat. Da diese Sounds Nicht-Diegetisch (keine natürliche Quelle im Spiel) sind, kommen sie direkt vom Auto des Spielers und haben keine bestimmte Richtung.                                                 |
| ✅ |  7 | VUI                 | Das VUI besteht zum einen aus einer Zeitanzeige, welche die verstrichene Zeit im Rennen anzeigt und aus einem Rundenzähler, welcher anzeigt, wie viele Runden der Spieler absolviert hat und wie viele Runden das Rennen insgesamt hat. Beides ist am oberen Bildschirmrand zu finden, die Zeitanzeige links mittig und der Rundenzähler rechts mittig. Wenn ein Spieler das Rennen abgeschlossen hat, hört die Zeit auf, hochzuzählen und der Spieler bekommt über das VUI eine Einblendung, ob er gewonnen oder verloren hat.                                             |
| ✅ |  8 | Event-System        | Das Spiel nutzt an mehreren Stellen custom events. Zum einen wird, nachdem das Eingabefeld für die Serveradresse validiert und abgeschickt wurde, diese Adresse als custom event verschickt, um den Spieleclient zu verbinden. Zum Anderen wird, für den Fall, dass das Rennen beendet wurde, ein CustomEvent abgeschickt, welches einen Booleanwert enthält mit der Information, ob der Spieler gewonnen oder verloren hat. |
| ✅ |  9 | External Data       | Die Externe Config Datei (external.json) beinhaltet hierarchisch angeordnete Parameter. Diese sind maximale Rundenanzahl, Reibung auf Gras und Strecke, die Autoparameter für Geschwindigkeit, Beschleunigung und Rotation sowie den Faktor für die lineare Interpolation der Kamera.                               |
| ❌ |  A | Light               | -                                                                         |
| ❌ |  B | Physics             | -                                           |
| ✅ |  C | Net                 | Das Spiel beinhaltet die Funktionalität, mit der 2 Spieler gegeneinander antreten können. Dabei nutzt das Spiel die Funktionen aus FudgeNet für eine Websocketverbindung.                                                                                                   |
| ❌ |  D | State Machines      | -                                      |
| ✅ |  E | Animation           | Da die Autos nur zweidimensionale Sprites sind, allerdings einen 3D Effekt simulieren sollen, nutzt das Spiel die Nodesprites aus FudgeAid und deren Möglichkeiten zur Animation um clientseitig die Rotation des Autos zu simulieren.                                                   |
