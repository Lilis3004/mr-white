*{
  box-sizing:border-box;
  margin:0;
  padding:0;
  transition:background-color .25s,color .25s,border-color .25s;
}

:root[data-theme="dark"]{
  --bg:#0c0f14;
  --card:#141920;
  --border:#1e2530;
  --muted:#5a6a7a;
  --text:#eef2f7;
  --subtext:#8899aa;
}

:root[data-theme="light"]{
  --bg:#f0f4fa;
  --card:#ffffff;
  --border:#d0daea;
  --muted:#7a8fa8;
  --text:#1a2535;
  --subtext:#4a6080;
}

:root{
  --blue:#1a5fcc;
  --blue-light:#3a80f0;
  --red:#d63040;
}

body{
  font-family:'Cairo',sans-serif;
  background:var(--bg);
  color:var(--text);
  min-height:100vh;
  direction:rtl;
}

.page{
  display:none;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  min-height:100vh;
  padding:2rem 1.2rem;
  gap:1rem;
}

.page.on{
  display:flex;
}

.title-wrap{
  text-align:center;
  line-height:1.1;
}

.title-sayyid{
  font-size:2.8rem;
  font-weight:900;
  color:#1a5fcc;
}

.title-abyad{
  font-size:2.8rem;
  font-weight:900;
  color:#ffffff;
}

[data-theme="light"] .title-abyad{
  color:#e8eef7;
}

.sub{
  font-size:11px;
  color:var(--muted);
  text-align:center;
  letter-spacing:2px;
}

.theme-btn{
  position:fixed;
  top:14px;
  left:14px;
  background:var(--card);
  border:1px solid var(--border);
  border-radius:20px;
  padding:6px 14px;
  cursor:pointer;
  font-size:13px;
  color:var(--subtext);
}

.box{
  background:var(--card);
  border:1px solid var(--border);
  border-radius:14px;
  padding:1.4rem;
  width:100%;
  max-width:460px;
}

.lbl{
  font-size:11px;
  color:var(--muted);
  display:block;
  margin-bottom:6px;
  margin-top:14px;
}

input[type=text]{
  width:100%;
  background:var(--bg);
  border:1px solid var(--border);
  color:var(--text);
  border-radius:8px;
  padding:11px 14px;
  font-size:14px;
  outline:none;
}

.row{
  display:flex;
  gap:8px;
  flex-direction:row-reverse;
}

.row input{
  flex:1;
}

.addbtn{
  background:#222;
  border:1px solid var(--border);
  color:var(--text);
  border-radius:8px;
  padding:0 14px;
  cursor:pointer;
  font-size:18px;
}

.btn{
  display:block;
  width:100%;
  max-width:460px;
  padding:13px;
  border-radius:10px;
  font-size:14px;
  font-weight:700;
  cursor:pointer;
  border:none;
}

.bp{
  background:var(--blue);
  color:#fff;
}

.bd{
  background:#1c1c1c;
  color:#888;
  border:1px solid var(--border);
}

.chips{
  display:flex;
  flex-wrap:wrap;
  gap:6px;
  margin-bottom:10px;
}

.chip{
  background:#1e1e1e;
  border:1px solid var(--border);
  border-radius:20px;
  padding:5px 12px;
  font-size:13px;
  display:flex;
  align-items:center;
  gap:6px;
}

.ai-chip{
  background:#12213f;
  border:1px solid var(--blue);
  border-radius:20px;
  padding:5px 12px;
  font-size:12px;
  color:#7cb2ff;
}

.divider{
  height:1px;
  background:var(--border);
  margin:1rem 0;
}

.err{
  color:var(--red);
  font-size:12px;
}

#overlay{
  position:fixed;
  inset:0;
  background:var(--bg);
  z-index:200;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:1rem;
}

#overlay.hide{
  display:none;
}