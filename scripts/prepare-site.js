import { readFile, mkdir, writeFile, copyFile } from 'node:fs/promises'

const source = await readFile('website.txt', 'utf8')
const navQuote = '<li><a href="#contact" class="nav-cta">Get a Quote</a></li>'
if (!source.includes(navQuote)) throw new Error('Could not find the original Get a Quote navigation item in website.txt')

const editorCss = `
  /* Browser-only demo editor; the hidden attribute must win over the backdrop display rule. */
  .editor-dialog-backdrop[hidden] { display: none !important; }
  .editor-nav-item { list-style: none; flex: 0 0 auto; }
  .editor-nav-button {
    display: block; border: 1px solid rgba(59,130,246,.35); border-radius: 10px;
    padding: 10px 14px; background: #eff6ff; color: #1d4ed8; cursor: pointer;
    font: inherit; font-size: .86rem; font-weight: 700; white-space: nowrap;
    transition: transform .25s, box-shadow .25s, background .25s;
  }
  .editor-nav-button:hover { transform: translateY(-2px); background: #dbeafe; box-shadow: 0 8px 20px rgba(59,130,246,.18); }
  .editor-dialog-backdrop { position: fixed; inset: 0; z-index: 10000; display: grid; place-items: center; padding: 20px; background: rgba(10,15,30,.72); backdrop-filter: blur(6px); }
  .editor-dialog { width: min(100%, 430px); border: 1px solid #e2e8f0; border-radius: 20px; padding: 28px; background: #fff; color: #0a0f1e; box-shadow: 0 25px 80px rgba(0,0,0,.3); font-family: inherit; }
  .editor-dialog h2 { margin: 0 0 8px; color: #0a0f1e; font-size: 1.4rem; }
  .editor-dialog p { margin: 0 0 16px; color: #64748b; font-size: .9rem; line-height: 1.55; }
  .editor-dialog label { display: grid; gap: 6px; margin: 12px 0; color: #334155; font-size: .85rem; font-weight: 650; }
  .editor-dialog input { width: 100%; box-sizing: border-box; border: 1px solid #cbd5e1; border-radius: 9px; padding: 11px 12px; font: inherit; }
  .editor-dialog-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
  .editor-dialog-actions button, .editor-toolbar button { border: 0; border-radius: 9px; padding: 10px 14px; cursor: pointer; font: inherit; font-weight: 700; }
  .editor-dialog .editor-submit, .editor-toolbar .editor-save { background: linear-gradient(135deg,#3b82f6,#8b5cf6); color: #fff; }
  .editor-dialog .editor-cancel, .editor-toolbar button { background: #e2e8f0; color: #1e293b; }
  .editor-demo-warning { color: #92400e !important; background: #fffbeb; border-radius: 9px; padding: 10px; font-size: .78rem !important; }
  .editor-toolbar { position: fixed; z-index: 9998; left: 18px; bottom: 18px; display: none; flex-wrap: wrap; align-items: center; gap: 8px; max-width: calc(100vw - 36px); border: 1px solid rgba(255,255,255,.15); border-radius: 14px; padding: 12px; color: #fff; background: rgba(10,15,30,.95); box-shadow: 0 12px 35px rgba(0,0,0,.3); font: 13px/1.4 system-ui,sans-serif; }
  .editor-toolbar.is-visible { display: flex; }
  .editor-toolbar strong { margin-right: 5px; }
  body.editor-mode [data-local-editable="true"] { outline: 1px dashed rgba(59,130,246,.65); outline-offset: 3px; cursor: text; }
  body.editor-mode [data-local-editable="true"]:focus { outline: 2px solid #3b82f6; background-color: rgba(219,234,254,.22); }
  @media (max-width: 720px) {
    .editor-nav-item { width: 100%; padding: 14px 0; border-bottom: 0 !important; }
    .editor-nav-button { width: 100%; }
    .editor-toolbar { right: 12px; left: 12px; bottom: 12px; }
  }
`

const navEditor = '<li class="editor-nav-item"><button class="editor-nav-button" id="openSiteEditor" type="button">Login to Edit Website</button></li>'
const modalAndToolbar = `
<div class="editor-dialog-backdrop" id="siteEditorDialog" hidden>
  <form class="editor-dialog" id="siteEditorLogin">
    <h2>Login to Edit Website</h2>
    <p>Enter any non-empty username and password to open the browser-based demo editor.</p>
    <label>Username<input name="username" autocomplete="username" required></label>
    <label>Password<input name="password" type="password" autocomplete="current-password" required></label>
    <p class="editor-demo-warning">Demo-only browser editor: changes are saved in this browser only. This is not secure authentication and does not publish edits for other visitors.</p>
    <div class="editor-dialog-actions"><button class="editor-cancel" id="cancelSiteEditor" type="button">Cancel</button><button class="editor-submit" type="submit">Open Editor</button></div>
  </form>
</div>
<div class="editor-toolbar" id="siteEditorToolbar" role="toolbar" aria-label="Website editing tools">
  <strong>Browser editor — local changes only</strong>
  <button class="editor-save" id="saveSiteEdits" type="button">Save</button>
  <button id="exportSiteEdits" type="button">Export</button>
  <button id="exitSiteEditor" type="button">Done</button>
  <button id="resetSiteEdits" type="button">Reset</button>
</div>
<script>
(() => {
  const storageKey = 'mfd-original-site-edit-v1';
  const dialog = document.getElementById('siteEditorDialog');
  const form = document.getElementById('siteEditorLogin');
  const toolbar = document.getElementById('siteEditorToolbar');
  const editorButton = document.getElementById('openSiteEditor');
  const navLinks = document.getElementById('navLinks');
  const menuToggle = document.getElementById('menuToggle');
  const selector = 'section h1, section h2, section h3, section h4, section p, section li, section blockquote, section figcaption, section .slide-badge, section .slide-stat .lbl, section .slide-stat .val, section .service-icon, section .tech-icon, section .skill-tag, section .stat-num, section .stat-label, section .about-image-badge, section .about-image-overlay';
  const getEditable = () => [...document.querySelectorAll(selector)].filter((el) => !el.closest('a,button,input,textarea,select,script,style'));

  function closeMobileMenu() {
    navLinks?.classList.remove('open');
    if (menuToggle) menuToggle.textContent = '☰';
  }
  function setEditorMode(enabled) {
    document.body.classList.toggle('editor-mode', enabled);
    getEditable().forEach((el) => {
      el.dataset.localEditable = enabled ? 'true' : 'false';
      el.contentEditable = enabled ? 'true' : 'false';
      el.spellcheck = enabled;
    });
    toolbar.classList.toggle('is-visible', enabled);
  }
  function restoreSavedContent() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (Array.isArray(saved)) getEditable().forEach((el, index) => {
        if (typeof saved[index] === 'string') el.innerHTML = saved[index];
      });
    } catch (error) { console.warn('Could not restore local website edits.', error); }
  }

  restoreSavedContent();
  editorButton?.addEventListener('click', () => {
    closeMobileMenu();
    dialog.hidden = false;
    form.elements.username.focus();
  });
  document.getElementById('cancelSiteEditor').addEventListener('click', () => { dialog.hidden = true; });
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.hidden = true; });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.elements.username.value.trim() || !form.elements.password.value) return;
    dialog.hidden = true;
    setEditorMode(true);
  });
  document.getElementById('saveSiteEdits').addEventListener('click', () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(getEditable().map((el) => el.innerHTML)));
      alert('Changes saved in this browser only; they are not published for other visitors.');
    } catch { alert('Could not save edits in this browser. Please export a backup.'); }
  });
  document.getElementById('exportSiteEdits').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(getEditable().map((el) => el.innerHTML), null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'mfd-site-edits.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 0);
  });
  document.getElementById('exitSiteEditor').addEventListener('click', () => setEditorMode(false));
  document.getElementById('resetSiteEdits').addEventListener('click', () => {
    if (confirm('Clear this browser’s saved edits and reload the original website?')) {
      localStorage.removeItem(storageKey);
      location.reload();
    }
  });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') dialog.hidden = true; });
})();
</script>
`

let output = source.replace('</style>', `${editorCss}\n</style>`)
output = output.replace(navQuote, `${navQuote}\n      ${navEditor}`)
output = output.replace('</body>', `${modalAndToolbar}\n</body>`)
await mkdir('dist/images', { recursive: true })
await writeFile('dist/index.html', output)
await copyFile('src/assets/images/MF.jpg', 'dist/images/MF.jpg')
await copyFile('src/assets/images/MF.jpg', 'dist/MF.jpg')
