// Liste der Unterordner und ihrer möglichen Ordnerstrukturen (Hardcode oder dynamisch über Server)
const folders = ['people', 'places', 'objects']; // Beispiel: Ordner, die du überprüfen möchtest

window.addEventListener('load', function () {
    console.log('Marked:', marked);
    // Funktion zum Laden und Anzeigen des Inhalts
    function loadContent() {
        // Extrahiere den Hash aus der URL
        const hash = window.location.hash.substring(1).toLowerCase(); // Entfernt das '#' Symbol und konvertiert zu Kleinbuchstaben

        const contentContainer = document.querySelector('.content');
        const iframeContainer = document.querySelector('.iframe-container');
        const img = document.querySelector('.overview-image');
        const tableHeaders = document.getElementById("table-headers");
        const tableValues = document.getElementById("table-values");
        const imageElement = document.getElementById("character-image");

        if (!hash || hash === 'home') {
            // Kein Hash oder "home": Zeige die Startseite (home.html)
            contentContainer.style.display = 'none'; // Verstecke das Markdown-Inhaltsdiv
            img.style.display = 'none';
            iframeContainer.style.display = 'block'; // Zeige den iFrame an
            iframeContainer.innerHTML = '<iframe src="system/home.html" frameborder="0" style="width: 100%; height: 100%; border-radius=8px;"></iframe>';

            // Leere die Tabelle und das Bild
            tableHeaders.innerHTML = "";
            tableValues.innerHTML = "";
            imageElement.src = ""; // Setze das Bild auf leer
        } else {
            // Ein Hash ist vorhanden: Lade die entsprechende Markdown-Datei
            iframeContainer.style.display = 'none'; // Verstecke den iFrame
            contentContainer.style.display = 'block'; // Zeige das Markdown-Inhaltsdiv an
            img.style.display = 'block';

            // Erstelle die URL zur Markdown-Datei
            const filePath = 'pages/' + hash + '/content.md';
            console.log('Lade Datei:', filePath);
            console.log('hash:', hash);

            // Lade die Datei mit fetch
            fetch(filePath)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Datei nicht gefunden');
                    }
                    return response.text();
                })
                .then(markdownContent => {
                    // Konvertiere den Markdown-Inhalt zu HTML
                    const htmlContent = marked.parse(markdownContent);
                    contentContainer.innerHTML = htmlContent;
                
                    // Lade die Konfigurationsdaten und aktualisiere die Übersicht
                    loadConfigData(hash).then(overviewData => {
                        populateOverview(overviewData); // Nachdem die Daten geladen sind, wird populateOverview aufgerufen
                    });
                })
                .catch(error => {
                    console.error('Fehler beim Laden der Markdown-Datei:', error);
                    const alternativFound = findAndRedirectInvalidHash(hash);

                    if (alternativFound) {
                        return;
                    } else {
                        // Lade die 404-Seite in den iFrame
                        contentContainer.style.display = 'none'; // Verstecke das Markdown-Inhaltsdiv
                        img.style.display = 'none';
                        iframeContainer.style.display = 'block'; // Zeige den iFrame an
                        iframeContainer.innerHTML = '<iframe src="system/error404.html" frameborder="0" style="width: 100%; height: 100%; border-radius=8px;"></iframe>';
                    }
                });
        }
    }

    // Lade den Inhalt beim Start der Seite
    loadContent();

    // Lade den Inhalt auch, wenn sich der Hash ändert
    window.addEventListener('hashchange', loadContent);
});

// Funktion, die bei einem ungültigen Hash die Datei im richtigen Ordner sucht
function findAndRedirectInvalidHash(hash) {
    return new Promise(resolve => {
      let foundPages = [];  // Hier speichern wir alle gefundenen Seiten
      let searchedFolders = 0; // Zählt, wie viele Ordner durchsucht wurden
  
      // Überprüfe jeden Unterordner
      for (let folder of folders) {
        const filePath = `pages/${folder}/${hash}/content.md`;  // Versuche, die Datei im neuen Ordner zu finden
  
        fetch(filePath)
          .then(response => {
            if (response.ok) {
              // Wenn die Datei gefunden wurde, speichere sie in der Liste
              foundPages.push({ folder: folder, hash: hash });
              console.log(`Datei gefunden: ${filePath}`);
            }
            
            // Erhöhe den Zähler und prüfe, ob alle Ordner durchsucht wurden
            searchedFolders++;
  
            if (searchedFolders === folders.length) {
                console.log(`Dateien gefunden: ${filePath}`);
              resolve(handleFoundPages(foundPages, hash)); // Rückgabe basierend auf den gefundenen Seiten
            }
          })
          .catch(error => {
            console.log(`Fehler beim Abrufen der Datei: ${filePath}`, error);
            
            // Erhöhe den Zähler und prüfe, ob alle Ordner durchsucht wurden
            searchedFolders++;
  
            if (searchedFolders === folders.length) {
              resolve(handleFoundPages(foundPages, hash)); // Rückgabe basierend auf den gefundenen Seiten
            }
          });
      }
    });
  }
  
  // Funktion zur Verarbeitung der gefundenen Seiten
  function handleFoundPages(foundPages, hash) {
    if (foundPages.length > 0) {
      // Wenn mehrere Seiten gefunden wurden, zeige die Alternativen an
      let pageLinks = '';
      foundPages.forEach(page => {
        pageLinks += `
            <tr>
                <td>Did you mean <strong class="highlight-text">${page.hash}</strong> in <strong class="highlight-text">${page.folder}</strong>?</td>
                <td><a href="#${page.folder}/${page.hash}" class="custom-link">go there</a></td>
            </tr>
        `;
      });
  
      // Erstelle das HTML für die Tabelle ohne Rahmen
      const multiplePagesTable = `
        <h2>Multiple pages for this specification found:</h2>
        <table style="border-collapse: collapse; width: 100%; table-layout: fixed;">
          ${pageLinks}
        </table>
      `;
  
      // Suche das div-Element mit der Klasse 'content' (oder falls der Name anders ist, passe ihn an)
      const contentElement = document.querySelector('.content');  // Hier wird das Element mit der Klasse 'content' gesucht
      
      const tableHeaders = document.getElementById("table-headers");
      const tableValues = document.getElementById("table-values");
      const imageElement = document.getElementById("character-image");

      // Leere die Tabelle und das Bild
      tableHeaders.innerHTML = "";
      tableValues.innerHTML = "";
      imageElement.src = ""; // Setze das Bild auf leer
  
      if (contentElement) {
        contentElement.innerHTML = multiplePagesTable; // Füge die Tabelle in das gefundenen div ein
      } else {
        console.log('Kein Content-Element gefunden.');
      }
  
      return true; // Alternative gefunden
    } else {
        // Falls keine Seite gefunden wurde, gib eine Fehlermeldung aus
        console.log(`Kein gültiger Hash gefunden für: ${hash}`);
        const contentContainer = document.querySelector('.content');
        const iframeContainer = document.querySelector('.iframe-container');
        const img = document.querySelector('.overview-image')
        contentContainer.style.display = 'none'; // Verstecke das Markdown-Inhaltsdiv
        img.style.display = 'none';
        iframeContainer.style.display = 'block'; // Zeige den iFrame an
        iframeContainer.innerHTML = '<iframe src="system/error404.html" frameborder="0" style="width: 100%; height: 100%; border-radius=8px;"></iframe>';
        return false; // Keine Alternative gefunden
    }
  }

// Funktion, die die config.json lädt und alle Werte als Array zurückgibt
function loadConfigData(hash) {
    // Pfad zur config.json-Datei unter Verwendung des Hashes
    const configPath = `pages/${hash}/config.json`;
  
    return fetch(configPath)
      .then(response => response.json()) // JSON-Daten parsen
      .then(data => {
        // Falls data kein Array ist, mit Object.entries() sicherstellen, dass wir ein Array zurückgeben
        return Array.isArray(data) ? data : Object.entries(data).map(([key, value]) => ({
          header: key.charAt(0).toUpperCase() + key.slice(1), // Erstes Zeichen großschreiben für bessere Lesbarkeit
          value: value
        }));
      })
      .catch(error => console.error('Fehler beim Laden der config.json:', error));
  }
  
  function populateOverview(data) {
    const tableHeaders = document.getElementById("table-headers");
    const tableValues = document.getElementById("table-values");
    const imageElement = document.getElementById("character-image");

    // Alte Inhalte entfernen
    tableHeaders.innerHTML = "";
    tableValues.innerHTML = "";

    // Iteriere über die Daten und füge sie zur Tabelle hinzu
    data.forEach(item => {
        if (item.header && item.value) {
            // Wenn der Header "img" ist, überspringen wir ihn
            if (item.header.toLowerCase() === 'img') {
                // Bild wird direkt hier gesetzt, ohne den "img"-Wert in die Tabelle aufzunehmen
                imageElement.src = item.value; // Bild-URL setzen
                return; // Überspringe diesen Eintrag in der Tabelle
            }

            // Füge die anderen Header-Werte zur Tabelle hinzu
            const headerCell = document.createElement("th");
            headerCell.textContent = item.header;
            tableHeaders.appendChild(headerCell);

            const valueCell = document.createElement("td");
            valueCell.textContent = item.value;
            tableValues.appendChild(valueCell);
        }
    });
}