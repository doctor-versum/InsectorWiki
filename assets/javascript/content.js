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
            const filePath = 'pages/' + hash + '.md';
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
                })
                .catch(error => {
                    console.error('Fehler beim Laden der Markdown-Datei:', error);

                    // Lade die 404-Seite in den iFrame
                    contentContainer.style.display = 'none'; // Verstecke das Markdown-Inhaltsdiv
                    iframeContainer.style.display = 'block'; // Zeige den iFrame an
                    iframeContainer.innerHTML = '<iframe src="system/error404.html" frameborder="0" style="width: 100%; height: 100%; border-radius=8px;"></iframe>';
                });
        }
    }

    // Lade den Inhalt beim Start der Seite
    loadContent();

    // Lade den Inhalt auch, wenn sich der Hash ändert
    window.addEventListener('hashchange', loadContent);
});