
(() => {
  "use strict";
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const state = { node:null, parent:null, next:null, focus:false };

  function toast(msg){
    const old = $(".qx-modal-toast"); if(old) old.remove();
    const el = document.createElement("div"); el.className = "qx-modal-toast"; el.textContent = msg; document.body.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }
  function lockBody(){ document.body.classList.add("qx-modal-open"); }
  function unlockBody(){ if($("#qx-modal-root")?.hidden !== false && $("#qx-focus-root")?.hidden !== false) document.body.classList.remove("qx-modal-open"); }

  function openModalWithNode(node){
    const root=$("#qx-modal-root"), content=$("#qx-modal-content");
    if(!root || !content || !node) return;
    closeModal();
    state.node=node; state.parent=node.parentNode; state.next=node.nextSibling;
    content.appendChild(node); node.hidden=false; root.hidden=false; lockBody();
    const first = node.querySelector("input,select,textarea,button"); if(first) setTimeout(() => first.focus(), 80);
  }
  function closeModal(){
    const root=$("#qx-modal-root"), content=$("#qx-modal-content");
    if(!root || !content) return;
    if(state.node && state.parent){
      if(state.next && state.next.parentNode === state.parent) state.parent.insertBefore(state.node,state.next);
      else state.parent.appendChild(state.node);
      if(state.node.id === "question-form") state.node.hidden = true;
    }
    state.node=null; state.parent=null; state.next=null;
    content.innerHTML=""; root.hidden=true; unlockBody();
  }
  function openModalHTML(html){
    const root=$("#qx-modal-root"), content=$("#qx-modal-content");
    if(!root || !content) return;
    closeModal(); content.innerHTML=html; root.hidden=false; lockBody();
  }
  function answerKeyHTML(){
    const cards = $$("#qx-answerkey-panel .breakdown-card");
    const inner = cards.length ? cards.map(c => c.outerHTML).join("") : `<div class="breakdown-card"><strong>Gabarito bloqueado</strong><span>Resolva questões para liberar o histórico de gabaritos respondidos.</span></div>`;
    return `<div class="qx-answerkey-modal"><div class="section-head compact-head"><div><p class="eyebrow"><i class="fa-solid fa-key"></i> Gabarito</p><h3>Gabaritos liberados após resposta</h3></div></div><div class="qx-answerkey-modal-grid">${inner}</div></div>`;
  }
  function openFocus(){
    if(state.focus || $("#qx-focus-root")?.hidden === false) return closeFocus();
    const card=$("#practice-card"), panel=$(".qx-practice-panel"), root=$("#qx-focus-root"), content=$("#qx-focus-content");
    if(!card || !panel || !root || !content || card.hidden) return toast("Selecione uma questão antes de entrar no modo foco.");
    state.focusParent = card.parentNode;
    state.focusNext = card.nextSibling;
    content.appendChild(card);
    card.hidden=false;
    root.hidden=false;
    state.focus=true;
    const btn=$("#open-focus-mode");
    if(btn) btn.innerHTML = '<i class="fa-solid fa-compress"></i> Sair do modo foco';
    lockBody();
  }
  function closeFocus(){
    const card=$("#practice-card"), root=$("#qx-focus-root");
    const parent = state.focusParent || $(".qx-practice-panel");
    const next = state.focusNext;
    if(card && parent){
      if(next && next.parentNode === parent) parent.insertBefore(card,next);
      else parent.appendChild(card);
    }
    if(root) root.hidden=true;
    state.focus=false;
    state.focusParent=null;
    state.focusNext=null;
    const btn=$("#open-focus-mode");
    if(btn) btn.innerHTML = '<i class="fa-solid fa-expand"></i> Modo foco';
    unlockBody();
  }

  function wire(){
    const openBtn=$("#open-fast-question");
    if(openBtn){
      const oldOpen = openBtn.onclick;
      openBtn.onclick = (e) => {
        if(typeof oldOpen === "function") oldOpen.call(openBtn,e);
        const form=$("#question-form");
        if(form){ openModalWithNode(form); setTimeout(() => syncRichEditorsFromSource(form), 0); }
      };
    }
    const closeForm=$("#close-question-form");
    if(closeForm) closeForm.onclick = (e) => { e.preventDefault(); closeModal(); };
    const form=$("#question-form");
    if(form){
      form.hidden = true;
      form.classList.add("qx-form-modal-only");
      form.addEventListener("submit", () => setTimeout(closeModal, 120), true);
    }
    const editBtn=$("#edit-active-question");
    if(editBtn){
      const oldEdit = editBtn.onclick;
      editBtn.onclick = (e) => {
        e.preventDefault();
        if(typeof oldEdit === "function") oldEdit.call(editBtn,e);
        setTimeout(() => {
          const form=$("#question-form");
          if(form){ openModalWithNode(form); setTimeout(() => syncRichEditorsFromSource(form), 0); }
        }, 0);
      };
    }
    $$(".qx-menu-btn[data-qx-view='answerkey']").forEach(btn => {
      btn.onclick = (e) => { e.preventDefault(); openModalHTML(answerKeyHTML()); };
    });
    const focusBtn=$("#open-focus-mode");
    if(focusBtn) focusBtn.onclick = (e) => { e.preventDefault(); openFocus(); };
    const modalClose=$("#qx-modal-close"); if(modalClose) modalClose.onclick = closeModal;
    const focusClose=$("#qx-focus-close"); if(focusClose) focusClose.onclick = closeFocus;
    const modalRoot=$("#qx-modal-root"); if(modalRoot) modalRoot.addEventListener("click", e => { if(e.target.matches("[data-qx-modal-close]")) closeModal(); });
    const focusRoot=$("#qx-focus-root"); if(focusRoot) focusRoot.addEventListener("click", e => { if(e.target.matches("[data-qx-focus-close]")) closeFocus(); });
    document.addEventListener("keydown", e => { if(e.key === "Escape"){ if($("#qx-focus-root")?.hidden === false) closeFocus(); else if($("#qx-modal-root")?.hidden === false) closeModal(); }});
  }



  function createToolbar(){
    const bar=document.createElement("div");
    bar.className="qx-rich-toolbar";
    const buttons=[
      ["bold","<b>B</b>","Negrito"],
      ["italic","<i>I</i>","Itálico"],
      ["underline","<u>U</u>","Sublinhado"]
    ];
    buttons.forEach(([cmd,label,title])=>{ const b=document.createElement("button"); b.type="button"; b.className="ghost-btn tiny qx-rich-btn"; b.innerHTML=label; b.title=title; b.dataset.cmd=cmd; bar.appendChild(b); });
    ["#f8fafc","#ffcf66","#7dd3fc","#86efac","#fca5a5","#c4b5fd"].forEach(color=>{ const b=document.createElement("button"); b.type="button"; b.className="qx-color-dot"; b.title=`Cor ${color}`; b.dataset.color=color; b.style.setProperty("--dot",color); bar.appendChild(b); });
    const clear=document.createElement("button"); clear.type="button"; clear.className="ghost-btn tiny qx-rich-btn"; clear.textContent="Limpar"; clear.dataset.cmd="removeFormat"; bar.appendChild(clear);
    return bar;
  }
  function syncEditor(textarea, editor){ textarea.value = editor.innerHTML.trim(); }
  function enhanceRichTextarea(textarea){
    if(!textarea || textarea.dataset.richReady==="1") return;
    textarea.dataset.richReady="1";
    const wrap=document.createElement("div"); wrap.className="qx-rich-wrap";
    const toolbar=createToolbar();
    const editor=document.createElement("div"); editor.className="qx-rich-editor"; editor.contentEditable="true"; editor.innerHTML=textarea.value || "";
    textarea.style.display="none";
    textarea.after(wrap); wrap.append(toolbar, editor);
    toolbar.addEventListener("click", e=>{
      const btn=e.target.closest("button"); if(!btn) return;
      e.preventDefault(); editor.focus();
      if(btn.dataset.color) document.execCommand("foreColor", false, btn.dataset.color);
      else if(btn.dataset.cmd==="removeFormat") { document.execCommand("removeFormat", false); document.execCommand("unlink", false); }
      else document.execCommand(btn.dataset.cmd, false);
      syncEditor(textarea, editor);
    });
    editor.addEventListener("input", ()=>syncEditor(textarea, editor));
    textarea._richEditor=editor;
  }
  function refreshRichEditors(scope=document){
    ["#question-comment", "#question-personal-comment", "#personal-comment-edit"].forEach(sel => {
      const el=scope.querySelector(sel); if(el) enhanceRichTextarea(el);
    });
  }
  function syncRichEditorsFromSource(scope=document){
    ["#question-comment", "#question-personal-comment", "#personal-comment-edit"].forEach(sel => {
      const el=scope.querySelector(sel); if(el && el._richEditor) el._richEditor.innerHTML = el.value || "";
    });
  }
  function watchRichTargets(){
    const observer = new MutationObserver(() => refreshRichEditors(document));
    observer.observe(document.body, { childList:true, subtree:true });
    refreshRichEditors(document);
  }

  window.addEventListener("DOMContentLoaded", () => { setTimeout(wire, 50); setTimeout(watchRichTargets, 120); setTimeout(() => syncRichEditorsFromSource(document), 180); });
})();
