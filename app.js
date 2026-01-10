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
      value: files.html,
      language: "html",
      theme: "vs-dark",
      automaticLayout: true,
      contextmenu: true,

      autoClosingBrackets: "always",
      autoClosingQuotes: "always",
      autoClosingDelete: "always",
      autoSurround: "languageDefined",
      formatOnType: true,

      wordWrap: "on",
      minimap: { enabled: false }
    }
  );

  /* ---------------- HTML + EMMET ---------------- */

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

  /* ---------------- NEW PROJECT ---------------- */

  function newProject() {
    if (!confirm("Create a new project? Unsaved changes will be lost.")) return;

    files.html = "";
    files.css = "";
    files.js = "";

    fileHandles.html = null;
    fileHandles.css = null;
    fileHandles.js = null;

    switchFile("html", "html");
    updatePreview();
  }

  document.getElementById("new-btn").onclick = newProject;

  /* ---------------- CONTEXT MENU ACTIONS ---------------- */

  editor.addAction({
    id: "select-all",
    label: "Select All",
    contextMenuGroupId: "navigation",
    run: () => {
      const model = editor.getModel();
      editor.setSelection(model.getFullModelRange());
    }
  });

  editor.addAction({
    id: "format-doc",
    label: "Format Document",
    contextMenuGroupId: "navigation",
    run: () =>
      editor.getAction("editor.action.formatDocument")?.run()
  });

  /* ---------------- COMMAND PALETTE ---------------- */

  const palette = document.createElement("div");
  palette.style.cssText = `
    position: fixed;
    top: 20%;
    left: 50%;
    transform: translateX(-50%);
    width: 90%;
    max-width: 420px;
    background: #1e1e1e;
    border: 1px solid #444;
    border-radius: 8px;
    display: none;
    z-index: 9999;
  `;

  palette.innerHTML = `
    <input style="
      width: 100%;
      padding: 10px;
      background: #111;
      color: white;
      border: none;
      outline: none;
    " placeholder="Type a command..." />
    <ul style="list-style:none;margin:0;padding:0"></ul>
  `;

  document.body.appendChild(palette);

  const input = palette.querySelector("input");
  const list = palette.querySelector("ul");

  const commands = [
    ["New Project", newProject],
    ["Open File", openFile],
    ["Save File", saveFile],
    ["Select All", () => {
      const m = editor.getModel();
      editor.setSelection(m.getFullModelRange());
    }],
    ["Format Document", () =>
      editor.getAction("editor.action.formatDocument")?.run()
    ]
  ];

  function openPalette() {
    palette.style.display = "block";
    input.value = "";
    input.focus();
    render(commands);
  }

  function closePalette() {
    palette.style.display = "none";
  }

  function render(cmds) {
    list.innerHTML = "";
    cmds.forEach(([name, fn]) => {
      const li = document.createElement("li");
      li.textContent = name;
      li.style.cssText =
        "padding:8px 10px;cursor:pointer;color:white";
      li.onclick = () => { closePalette(); fn(); };
      list.appendChild(li);
    });
  }

  input.oninput = () => {
    const q = input.value.toLowerCase();
    render(commands.filter(c => c[0].toLowerCase().includes(q)));
  };

  /* ---------------- SHORTCUTS ---------------- */

  window.addEventListener("keydown", e => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "p") {
      e.preventDefault();
      openPalette();
    }
    if (e.key === "Escape") closePalette();
    if (e.ctrlKey && e.key === "s") { e.preventDefault(); saveFile(); }
    if (e.ctrlKey && e.key === "o") { e.preventDefault(); openFile(); }
    if (e.ctrlKey && e.key === "n") { e.preventDefault(); newProject(); }
  });

  console.log("Abhinu’s WebCode Core IDE — fixed & stable ✅");
});
