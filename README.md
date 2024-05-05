# Studioprojekt Ablauf App

Diese App dient der Koordination des Ablaufs des Studioprojekts der ME21b.

## Benutzung

### Datenquelle

Der Ablaufplan wird automatisch von SharePoint heruntergeladen, wenn die entsprechende Excel Datei bearbeitet wird.

Wichtig sind die Spalten `Länge`, `Kürzel` und `Kapitel`.

Die Synchronisation der Dateien dauert ca. 2 Minuten. Danach sollte die Webseite auf allen Geräten neu geladen werden, damit diese die neuesten Daten haben.

### Synchronisation mehrerer Geräte

Um mehrere Geräte miteinander zu synchronisieren, müssen diese im gleichen Netzwerk sein. Dies kann z. B. durch einen Windows Hotspot realisiert werden, zu dem sich alle beteiligten Geräte verbinden.

Dann muss auf einem Hauptgerät der `Connect Here` Knopf gedrückt werden, und dann entweder der QR-Code gescannt, oder die ID auf den anderen Geräten mithilfe des `Connect` Knopfes eingegeben werden.

Sobald ein Gerät sich verbindet, wird eine Benachrichtigung auf beiden Geräten angezeigt.

Sobald ein Gerät die Verbindung verliert, wird das ebenfalls angezeigt.

Die Verbindung ist relativ instabil wenn sie falsch benutzt wird. Hier ein paar Tipps, um die App stabiler laufen zu lassen:

- Einen Chromium-basierten Browser oder Safari nutzen. Firefox hat oft Probleme mit der Verbindung und sollte nicht verwendet werden.
- Geräte daran hindern, in den Standby Modus zu gehen. Die App versucht von sich aus, das zu verhindern, das Gerät kann diese Anfrage aber ablehnen, falls z. B. die Akkuladung zu gering ist.
- Der Bildschirm sollte dauerhaft eingeschaltet, und die App immer im Vordergrund sein.

Sollte ein Client-Gerät die Verbindung verlieren, sollte sich das mit einem einfachen Neuladen beheben lassen.

Wenn das Hauptgerät die Verbindung verliert, oder die Seite neugeladen wird, müssen alle anderen Geräte erneut synchronisiert werden.

Nur das Hauptgerät kann die Zeit manipulieren, alle anderen Geräte können nur "zuschauen"

### App-Funktionen

Sobald die Webseite geöffnet wird, geht der Counter automatisch los. Mit den Knöpfen unter dem Counter kann man die Zeit vor- und zurückspulen, pausieren und zurücksetzen.

Auf die Karten unter dem Counter und auf die Elemente der Tabellen kann man klicken, um zum jeweiligen Zeitstempel zu springen.

Wenn der Timer länger als die angepeilte Zeit läuft, wird der Text rot.

#### Live Mode

Wenn der "Live Mode" Toggle aktiv ist, kann die Zeit nicht mehr pausiert werden. Sobald der Toggle aktiviert wird, setzt sich der Counter zurück und pausiert automatisch. Mit dem Klick auf den `Start` Knopf startet der Counter.

Anpassungen an der Zeit ändern nun nicht mehr direkt den Counter, sondern zeigen die Differenz zwischen der tatsächlichen und der geplanten Zeit an.

Man kann zu einem bestimmten Zeitstempel springen, bevor man den Timer startet. Dadurch kann man z. B. bestimmte Abschnitte der Sendung einzeln durchspielen und timen.

Eine negative rote Zahl bedeutet, dass man langsamer als geplant ist. Eine grüne positive Zahl bedeutet, dass man schneller als geplant ist.

## Für andere Projekte verwenden

Da die App ihre Daten von einer Excel Tabelle zieht, ist sie ziemlich flexibel und kann auch für Andere Projekte eingesetzt werden.

Jedoch sollte man trotzdem ein bisschen von Programmierung verstehen, wenn man die App für andere Projekte verwenden will.

Die URL für SharePoint muss in `.github/workflows/getSchedule.yml` angepasst werden. Die Datei sollte idealerweise `Sendeablauf.xlsx` heißen, andernfalls muss das ebenfalls angepasst werden.

Die Zugangsdaten für Sharepoint werden in den GitHub Repository Secrets gespeichert, unter den Namen `SHAREPOINT_USN` (Benutzername) und `SHAREPOINT_PWD` (Passwort).

Die `.xlsx` Datei auf Sharepoint muss die Spalten `Länge`, `Kürzel` und `Kapitel` enthalten.

Die Zeitstempel der Abschnitte werden basierend auf der `Länge` berechnet. Jede Zeile sollte dementsprechend eine Länge haben, es dürfen keine mehrzeiligen Zellen genutzt werden.

Die erwartete Länge der Sendung kann in `src/variables/time.ts` geändert werden und ist in Sekunden angegeben.

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```
