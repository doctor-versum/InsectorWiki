// Liste der Unterordner und ihrer möglichen Ordnerstrukturen (Hardcode oder dynamisch über Server)
const folders = ['people', 'places', 'objects']; // Beispiel: Ordner, die du überprüfen möchtest

const overviewData = [
    { header: "Name", value: "test" },
    { header: "Alter", value: "16" },
    { header: "Rolle", value: "main character" }
];

window.addEventListener('load', function () {
    console.log('Marked:', marked);
    // Funktion zum Laden und Anzeigen des Inhalts
    function loadContent() {
        // Extrahiere den Hash aus der URL
        const hash = window.location.hash.substring(1).toLowerCase(); // Entfernt das '#' Symbol und konvertiert zu Kleinbuchstaben

        const contentContainer = document.querySelector('.content');
        const iframeContainer = document.querySelector('.iframe-container');

        if (!hash || hash === 'home') {
            // Kein Hash oder "home": Zeige die Startseite (home.html)
            contentContainer.style.display = 'none'; // Verstecke das Markdown-Inhaltsdiv
            iframeContainer.style.display = 'block'; // Zeige den iFrame an
            iframeContainer.innerHTML = '<iframe src="home.html" frameborder="0" style="width: 100%; height: 100%; border-radius=8px;"></iframe>';
        } else {
            // Ein Hash ist vorhanden: Lade die entsprechende Markdown-Datei
            iframeContainer.style.display = 'none'; // Verstecke den iFrame
            contentContainer.style.display = 'block'; // Zeige das Markdown-Inhaltsdiv an

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
                    processedContent = processMarkdown(markdownContent);
                    // Konvertiere den Markdown-Inhalt zu HTML
                    const htmlContent = marked.parse(processedContent);
                    contentContainer.innerHTML = htmlContent;
                    console.log('Markdown-Inhalt:', processedContent);
                    console.log('Header img:', img);
                    console.log('Header name:', name);
                    console.log('Header age:', age);
                    console.log('Header first episode:', firstEpisode);
                    console.log('Header trivia:', trivia);
                    populateOverview(overviewData);
                })
                .catch(error => {
                    console.error('Fehler beim Laden der Markdown-Datei:', error);
                    const alternativFound = findAndRedirectInvalidHash(hash);

                    if (alternativFound) {
                        return;
                    } else {
                        // Lade die 404-Seite in den iFrame
                        contentContainer.style.display = 'none'; // Verstecke das Markdown-Inhaltsdiv
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
  
      if (contentElement) {
        contentElement.innerHTML = multiplePagesTable; // Füge die Tabelle in das gefundenen div ein
      } else {
        console.log('Kein Content-Element gefunden.');
      }
  
      return true; // Alternative gefunden
    } else {
      // Falls keine Seite gefunden wurde, gib eine Fehlermeldung aus
      console.log(`Kein gültiger Hash gefunden für: ${hash}`);
      return false; // Keine Alternative gefunden
    }
  }

// Globale Variablen zum Speichern der extrahierten Werte
let img = '';
let name = '';
let age = '';
let firstEpisode = '';
let trivia = '';

// Funktion, die den Header extrahiert und die wichtigen Werte speichert
function processMarkdown(mdContent) {
  // Regulärer Ausdruck, um den "header"-Block zu extrahieren
  const headerRegex = /```header([\s\S]*?)```/;
  const headerMatch = mdContent.match(headerRegex);
  
  if (headerMatch) {
    const headerContent = headerMatch[1].trim();
    
    // Header in Key-Value-Paare aufteilen und speichern
    const headerData = parseHeader(headerContent);
    
    // Wichtige Werte extrahieren und in globalen Variablen speichern
    img = headerData['img'] || '';
    name = headerData['name'] || '';
    age = headerData['age'] || '';
    firstEpisode = headerData['first episode'] || '';
    trivia = headerData['trivia'] || '';
    overviewData = headerData
}

  // Entfernen des Headers aus dem Markdown-Content
  const contentWithoutHeader = mdContent.replace(headerRegex, '').trim();

  // Rückgabe des bereinigten Markdown-Contents
  return contentWithoutHeader;
}

// Funktion zum Parsen des Headers in Key-Value-Paare
function parseHeader(header) {
  const lines = header.split('\n');
  const data = {};
  lines.forEach(line => {
    const [key, value] = line.split(':');
    if (key && value) {
      data[key.trim()] = value.trim();
    }
  });
  return data;
}

// Funktion, um die Tabelle und das Bild dynamisch zu füllen
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
            const headerCell = document.createElement("th");
            headerCell.textContent = item.header;
            tableHeaders.appendChild(headerCell);

            const valueCell = document.createElement("td");
            valueCell.textContent = item.value;
            tableValues.appendChild(valueCell);
        }

        // Bild aktualisieren, falls vorhanden
        if (item.img) {
            imageElement.src = item.img;
        }
    });
}