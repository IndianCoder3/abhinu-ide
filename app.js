/* global monaco, emmetMonaco, require */

let editor;
let currentFile = "html";

/* ---------------- FILE CONTENT ---------------- */

const BLANK_PROJECT = {
  html: "",
  css: "",
  js: ""
};

const files = {
  html: "",
  css: "",
  js: ""
};

/* ---------------- FILE HANDLES ---------------- */

const fileHandles = { html: null, css: null, js: null };

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
        value: "",
        language: "html",
        theme: "vs-dark",
        automaticLayout: true,
        contextmenu: true,
        autoClosingBrackets: "always",
        autoClosingQuotes: "always",
        wordWrap: "on",
        minimap: { enabled: false }
      }
  );

  /* ---------------- EMMET ---------------- */

  monaco.languages.html.htmlDefaults.setOptions({
    autoClosingTags: true,
    autoCreateQuotes: true
  });

  emmetMonaco.emmetHTML(monaco);
  emmetMonaco.emmetCSS(monaco);

  const preview = document.getElementById("preview-frame");

  /* ---------------- PREVIEW ---------------- */

  function updatePreview() {
    preview.srcdoc = `
<!DOCTYPE html>
<html lang="en">
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

  document.getElementById("html-btn").onclick = () => switchFile("html", "html");
  document.getElementById("css-btn").onclick = () => switchFile("css", "css");
  document.getElementById("js-btn").onclick = () => switchFile("js", "javascript");

  /* ---------------- FILE SYSTEM ---------------- */

  async function saveFile() {
    let handle = fileHandles[currentFile];
    if (!handle) {
      handle = await window.showSaveFilePicker({
        suggestedName:
            currentFile === "html" ? "index.html" :
                currentFile === "css" ? "style.css" : "script.js"
      });
      fileHandles[currentFile] = handle;
    }
    const w = await handle.createWritable();
    await w.write(files[currentFile]);
    await w.close();
  }

  async function openFile() {
    try {
      const [handle] = await window.showOpenFilePicker();
      const file = await handle.getFile();
      const text = await file.text();

      if (file.name.endsWith(".html")) switchFile("html", "html");
      else if (file.name.endsWith(".css")) switchFile("css", "css");
      else if (file.name.endsWith(".js")) switchFile("js", "javascript");

      files[currentFile] = text;
      editor.setValue(text);
      fileHandles[currentFile] = handle;
      updatePreview();
    } catch {}
  }

  document.getElementById("save-btn").onclick = saveFile;
  document.getElementById("open-btn").onclick = openFile;

  /* ---------------- NEW PROJECT (BLANK) ---------------- */

  function newProject() {
    if (!confirm("Create a new blank project?")) return;

    files.html = "";
    files.css = "";
    files.js = "";

    fileHandles.html = null;
    fileHandles.css = null;
    fileHandles.js = null;

    currentFile = "html";
    editor.setValue("");
    monaco.editor.setModelLanguage(editor.getModel(), "html");

    updatePreview();
  }

  document.getElementById("new-btn").onclick = newProject;

  /* ---------------- CONTEXT MENU ---------------- */

  editor.addAction({
    id: "select-all",
    label: "Select All",
    run: () => {
      const m = editor.getModel();
      editor.setSelection(m.getFullModelRange());
    }
  });

  editor.addAction({
    id: "format",
    label: "Format Document",
    run: () => editor.getAction("editor.action.formatDocument")?.run()
  });

  /* ---------------- COMMAND PALETTE ---------------- */

  window.addEventListener("keydown", e => {
    if (e.ctrlKey && e.key === "s") { e.preventDefault(); saveFile(); }
    if (e.ctrlKey && e.key === "o") { e.preventDefault(); openFile(); }
    if (e.ctrlKey && e.key === "n") { e.preventDefault(); newProject(); }
  });

  console.log("AbhinuCode Core IDE — stable ✅");
});
