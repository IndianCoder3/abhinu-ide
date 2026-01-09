let editor;
let currentFile = "html";

/* ---------------- FILE CONTENT ---------------- */

const files = {
  html: `<!DOCTYPE html>
<html>
  <head>
    <title>Abhinu’s WebCode</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <h1>Hello User!</h1>
    <p>Edit HTML, CSS, and JS using the top buttons.</p>
    <script src="script.js"></script>
  </body>
</html>`,

  css: `body {
  background: black;
  color: gold;
  font-family: system-ui;
}`,

  js: `console.log("WebCode Core IDE ready 🚀");`
};

/* ---------------- FILE HANDLES ---------------- */

const fileHandles = {
  html: null,
  css: null,
  js: null
};

/* ---------------- MONACO ---------------- */

require.config({
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs"
  }
});

require(["vs/editor/editor.main"], () => {

  editor = monaco.editor.create(
    document.getElementById("editor-container"),
    {
      value: files.html,
      language: "html",
      theme: "vs-dark",
      automaticLayout: true
    }
  );

  // Emmet
  emmetMonaco.emmetHTML(monaco);
  emmetMonaco.emmetCSS(monaco);

  const preview = document.getElementById("preview-frame");

  /* ---------------- PREVIEW ---------------- */

  function updatePreview() {
    preview.srcdoc = `
<!DOCTYPE html>
<html>
  <head>
    <style>${files.css}</style>
  </head>
  <body>
    ${files.html}
    <script>${files.js}<\/script>
  </body>
</html>`;
  }

  updatePreview();

  editor.onDidChangeModelContent(() => {
    files[currentFile] = editor.getValue();
    updatePreview();
  });

  /* ---------------- FILE SWITCHING ---------------- */

  function switchFile(type, language) {
    files[currentFile] = editor.getValue();
    currentFile = type;

    editor.setValue(files[type]);
    monaco.editor.setModelLanguage(editor.getModel(), language);
  }

  document.getElementById("html-btn").onclick = () =>
    switchFile("html", "html");

  document.getElementById("css-btn").onclick = () =>
    switchFile("css", "css");

  document.getElementById("js-btn").onclick = () =>
    switchFile("js", "javascript");

  /* ---------------- FILE SYSTEM ---------------- */

  async function saveFile() {
    let handle = fileHandles[currentFile];

    if (!handle) {
      const names = {
        html: "index.html",
        css: "style.css",
        js: "script.js"
      };

      handle = await window.showSaveFilePicker({
        suggestedName: names[currentFile],
        types: [
          {
            description: "Web File",
            accept: {
              "text/plain": [
                currentFile === "html" ? ".html" :
                currentFile === "css" ? ".css" : ".js"
              ]
            }
          }
        ]
      });

      fileHandles[currentFile] = handle;
    }

    const writable = await handle.createWritable();
    await writable.write(files[currentFile]);
    await writable.close();
  }

  async function openFile() {
    try {
      const [handle] = await window.showOpenFilePicker();
      const file = await handle.getFile();
      const text = await file.text();

      if (file.name.endsWith(".html")) {
        currentFile = "html";
        fileHandles.html = handle;
        editor.setValue(text);
        monaco.editor.setModelLanguage(editor.getModel(), "html");
      } 
      else if (file.name.endsWith(".css")) {
        currentFile = "css";
        fileHandles.css = handle;
        editor.setValue(text);
        monaco.editor.setModelLanguage(editor.getModel(), "css");
      } 
      else if (file.name.endsWith(".js")) {
        currentFile = "js";
        fileHandles.js = handle;
        editor.setValue(text);
        monaco.editor.setModelLanguage(editor.getModel(), "javascript");
      }

      files[currentFile] = text;
      updatePreview();
    } catch {}
  }

  document.getElementById("save-btn").onclick = saveFile;
  document.getElementById("open-btn").onclick = openFile;

  /* ---------------- SHORTCUTS ---------------- */

  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "s") {
      e.preventDefault();
      saveFile();
    }
    if (e.ctrlKey && e.key === "o") {
      e.preventDefault();
      openFile();
    }
  });

  console.log("Abhinu’s WebCode Core IDE — stable & correct 🚀");
});
