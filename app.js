let editor;
let fileHandle = null;

require.config({
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs"
  }
});

require(["vs/editor/editor.main"], () => {

  editor = monaco.editor.create(
    document.getElementById("editor-container"),
    {
      value: `<!DOCTYPE html>
<html>
  <body style="background:black">
    <h1 style="color:gold">Abhinu’s WebCode Core IDE</h1>
    <p style="color:white">Live preview is enabled.</p>
  </body>
</html>`,
      language: "html",
      theme: "vs-dark",
      automaticLayout: true
    }
  );

  emmetMonaco.emmetHTML(monaco);
  emmetMonaco.emmetCSS(monaco);

  const preview = document.getElementById("preview-frame");
  const splitter = document.getElementById("splitter");
  const ide = document.getElementById("ide");

  /* ---------- PREVIEW ---------- */

  const updatePreview = () => {
    preview.srcdoc = editor.getValue();
  };

  updatePreview();
  editor.onDidChangeModelContent(updatePreview);

  /* ---------- RESIZE ---------- */

  let dragging = false;

  splitter.addEventListener("mousedown", () => {
    dragging = true;
    document.body.style.cursor = "col-resize";
  });

  window.addEventListener("mouseup", () => {
    dragging = false;
    document.body.style.cursor = "default";
  });

  window.addEventListener("mousemove", (e) => {
    if (!dragging) return;

    const rect = ide.getBoundingClientRect();
    const x = e.clientX - rect.left;

    const min = rect.width * 0.25;
    const max = rect.width * 0.75;

    if (x < min || x > max) return;

    ide.style.gridTemplateColumns = `${x}px 6px 1fr`;
  });

  /* ---------- FILE SYSTEM ---------- */

  async function openFile() {
    try {
      [fileHandle] = await window.showOpenFilePicker({
        types: [{
          description: "HTML Files",
          accept: { "text/html": [".html"] }
        }]
      });

      const file = await fileHandle.getFile();
      editor.setValue(await file.text());
      updatePreview();
    } catch {}
  }

  async function saveFile() {
    if (!fileHandle) {
      fileHandle = await window.showSaveFilePicker({
        suggestedName: "index.html",
        types: [{
          description: "HTML Files",
          accept: { "text/html": [".html"] }
        }]
      });
    }

    const writable = await fileHandle.createWritable();
    await writable.write(editor.getValue());
    await writable.close();
  }

  /* ---------- BUTTONS ---------- */

  document.getElementById("open-btn").onclick = openFile;
  document.getElementById("save-btn").onclick = saveFile;

  /* ---------- SHORTCUTS ---------- */

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

  console.log("Abhinu’s WebCode Core IDE ready 🚀");
});
