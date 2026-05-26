// ── THEME ──────────────────────────────────────────────────────────────
let theme = localStorage.getItem('sayyid-theme') || 'dark';

function applyTheme() {
  document.documentElement.setAttribute('data-theme', theme);
  document.getElementById('theme-icon').textContent = theme === 'dark' ? '☀️' : '🌙';
  document.getElementById('theme-txt').textContent = theme === 'dark' ? 'وضع النهار' : 'وضع الليل';
}
applyTheme();

window.toggleTheme = () => {
  theme = theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('sayyid-theme', theme);
  applyTheme();
};

// ── KEYWORD PAIRS (familiar to MA/SMA level Arabic students) ──────────
const KW_PAIRS = [
  ['مسجد','كنيسة'],['مدرسة','جامعة'],['مكتبة','مقهى'],
  ['مطبخ','مطعم'],['مستشفى','عيادة'],['سوق','مول'],
  ['بيت','شقة'],['فندق','استراحة'],['ملعب','صالة رياضية'],
  ['حديقة','غابة'],['شاطئ','بحيرة'],['مطار','محطة قطار'],
  ['قلم','مسطرة'],['كتاب','مجلة'],['هاتف','حاسوب'],
  ['سيارة','دراجة نارية'],['دراجة','سكوتر'],['حقيبة','محفظة'],
  ['ساعة','تقويم'],['مرآة','نافذة'],
  ['قهوة','شاي'],['رز','معكرونة'],['خبز','كعك'],
  ['تفاحة','برتقالة'],['شوكولاتة','حلوى'],
  ['جبل','تل'],['نهر','بحر'],['شجرة','نخلة'],
  ['قمر','شمس'],['مطر','ثلج'],
  ['معلم','أستاذ'],['طبيب','ممرض'],['شرطي','حارس'],
  ['طاهٍ','نادل'],['لاعب','مدرب']
];

const WORDS = [
  'باب','نافذة','كرسي','طاولة','أرضية','جدار','سقف','ممر','سلّم','غرفة',
  'ضوء','صوت','رائحة','حرارة','برودة','ضجيج','هدوء','ازدحام','فراغ','ظلام',
  'موظف','زائر','طالب','مريض','عامل','حارس','زبون','ضيف','مدير','أمين',
  'كتاب','ورقة','شاشة','آلة','أداة','دواء','طعام','مشروب','ملابس','حقيبة',
  'طابور','سعر','موعد','تذكرة','قائمة','لافتة','مدخل','مخرج','مصعد','ردهة',
  'سجادة','ستارة','مرآة','ساعة','رف','خزانة','مكتب','تلفاز','مفتاح','قفل',
  'سياج','حديقة','موقف','إضاءة','تكييف','بوابة','حاجز','سلة','علبة','كيس',
  'زي','قبّعة','حذاء','نظارة','قفاز','معطف','شارة','بطاقة','خاتم','قلادة',
  'لون','شكل','حجم','وزن','طول','عرض','عمق','مسافة','سرعة','اتجاه'
];

// ── STATE ─────────────────────────────────────────────────────────────
let players = [], aiPlayers = [], roles = [], allPlayers = [];
let whiteIdx = -1, kwC = '', kwW = '', usedPairs = [];
let revIdx = 0, roundN = 1, roundPlayerIdx = 0;
let allRounds = [], curChosen = {}, takenWords = new Set();
let selVote = -1, pendingVerdictIdx = -1, aiCount = 0;
let humanVoters = [], currentVoterIdx = 0, collectedVotes = {};

// ── HELPERS ───────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const show = id => {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('on'));
  $(id).classList.add('on');
};
const toAr = n => n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);

// ── HOME ──────────────────────────────────────────────────────────────
function renderChips() {
  $('chips').innerHTML = players.map((p, i) =>
    `<div class="chip">${p}<span class="x" onclick="removeP(${i})">×</span></div>`
  ).join('');
}

window.addP = () => {
  const v = $('pinput').value.trim();
  if (v && !players.includes(v) && (players.length + aiPlayers.length) < 8) {
    players.push(v);
    $('pinput').value = '';
    renderChips();
  }
};

window.removeP = i => { players.splice(i, 1); renderChips(); };

document.addEventListener('DOMContentLoaded', () => {
  $('pinput').onkeydown = e => { if (e.key === 'Enter') addP(); };
});

function renderAIChips() {
  $('ai-chips').innerHTML = aiPlayers.map(a =>
    `<div class="ai-chip">🤖 ${a}</div>`
  ).join('');
}

window.addAI = () => {
  if (players.length + aiPlayers.length >= 8) return;
  aiCount++;
  aiPlayers.push('AI-' + aiCount);
  renderAIChips();
};

window.removeLastAI = () => {
  if (!aiPlayers.length) return;
  aiPlayers.pop();
  renderAIChips();
};

function pickPair() {
  let avail = KW_PAIRS.map((_, i) => i).filter(i => !usedPairs.includes(i));
  if (!avail.length) { usedPairs = []; avail = KW_PAIRS.map((_, i) => i); }
  const idx = avail[Math.floor(Math.random() * avail.length)];
  usedPairs.push(idx);
  const p = KW_PAIRS[idx], sw = Math.random() < .5;
  kwC = sw ? p[1] : p[0];
  kwW = sw ? p[0] : p[1];
}

window.startGame = () => {
  const total = players.length + aiPlayers.length;
  if (total < 3) { $('err-home').textContent = 'الحد الأدنى ٣ لاعبين!'; return; }
  $('err-home').textContent = '';
  usedPairs = []; pickPair();
  allPlayers = [
    ...players.map(n => ({ name: n, isAI: false })),
    ...aiPlayers.map(n => ({ name: n, isAI: true }))
  ];
  whiteIdx = Math.floor(Math.random() * allPlayers.length);
  roles = allPlayers.map((_, i) => i === whiteIdx ? 'white' : 'citizen');
  roundN = 1; revIdx = 0; roundPlayerIdx = 0;
  curChosen = {}; allRounds = []; takenWords = new Set();
  openOverlay();
};

// ── OVERLAY ────────────────────────────────────────────────────────────
function openOverlay() {
  while (revIdx < allPlayers.length && allPlayers[revIdx].isAI) revIdx++;
  if (revIdx >= allPlayers.length) {
    $('overlay').classList.add('hide');
    startRound();
    return;
  }
  const p = allPlayers[revIdx], isW = roles[revIdx] === 'white';
  $('ov-who').textContent = p.name;
  $('ov-rn').textContent = isW ? 'السيد الأبيض' : 'مواطن';
  $('ov-rn').className = 'rn' + (isW ? ' red' : '');
  $('ov-kv').textContent = isW ? kwW : kwC;
  $('ov-front').className = 'ff fr' + (isW ? ' wh' : '');
  $('ov-inner').classList.remove('flipped');
  $('ov-next').style.display = 'none';
  $('overlay').classList.remove('hide');
}

window.flipCard = () => {
  $('ov-inner').classList.add('flipped');
  setTimeout(() => $('ov-next').style.display = 'block', 400);
};

window.nextOverlay = () => { revIdx++; openOverlay(); };

// ── WORD PHASE ─────────────────────────────────────────────────────────
function startRound() { roundPlayerIdx = 0; takenWords = new Set(); curChosen = {}; processNext(); }

async function processNext() {
  if (roundPlayerIdx >= allPlayers.length) { startVotingPhase(); return; }
  if (allPlayers[roundPlayerIdx].isAI) await doAITurn(roundPlayerIdx);
  else showWordScreen();
}

function showWordScreen() {
  const idx = roundPlayerIdx, p = allPlayers[idx];
  const isW = roles[idx] === 'white', kw = isW ? kwW : kwC;
  $('word-rlbl').textContent = 'الجولة ' + toAr(roundN);
  $('word-who').textContent = p.name;
  $('word-kv').textContent = kw;
  const bar = $('word-kwbar'), badge = $('word-badge');
  if (isW) { bar.className = 'kwbar whi'; badge.textContent = 'السيد الأبيض'; }
  else { bar.className = 'kwbar cit'; badge.textContent = 'مواطن'; }
  const avail = WORDS.filter(w => !takenWords.has(w)).sort(() => Math.random() - .5).slice(0, 8);
  $('wgrid').innerHTML = avail.map(w =>
    `<div class="wopt" onclick="selW(this,'${w}')">${w}</div>`
  ).join('');
  let selWord = '';
  $('cust').value = ''; $('err-word').textContent = ''; $('sub-btn').disabled = true;

  window.selW = (el, w) => {
    document.querySelectorAll('.wopt').forEach(e => e.classList.remove('sel'));
    el.classList.add('sel'); selWord = w;
    $('cust').value = ''; $('err-word').textContent = ''; $('sub-btn').disabled = false;
  };
  window.onCust = inp => {
    document.querySelectorAll('.wopt').forEach(e => e.classList.remove('sel'));
    selWord = inp.value.trim();
    $('sub-btn').disabled = !selWord; $('err-word').textContent = '';
  };
  window.submitWord = () => {
    if (!selWord) return;
    if (takenWords.has(selWord)) { $('err-word').textContent = 'هذه الكلمة مستخدمة! اختر أخرى.'; return; }
    takenWords.add(selWord);
    curChosen[roundPlayerIdx] = { name: p.name, word: selWord, isAI: false };
    roundPlayerIdx++; processNext();
  };
  show('p-word');
}

async function doAITurn(idx) {
  show('p-ai');
  const p = allPlayers[idx], isW = roles[idx] === 'white', kw = isW ? kwW : kwC;
  $('ai-txt').textContent = p.name + ' يفكر...';
  const pool = WORDS.filter(w => !takenWords.has(w));
  const prompt = `أنت تلعب لعبة "السيد الأبيض".\nدورك: ${isW ? 'السيد الأبيض' : 'مواطن عادي'}.\nكلمتك السرية: "${kw}".\nاختر كلمة واحدة فقط (اسم) باللغة العربية تصف كلمتك السرية.\nمن هذه القائمة: ${pool.slice(0, 20).join('، ')}.\n${isW ? 'تنبيه: كلمتك مختلفة عن المواطنين، اختر بحذر.' : ''}\nأجب بكلمة واحدة فقط.`;
  let word = '';
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 20,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await res.json();
    word = (data.content?.[0]?.text || '').trim().split(/\s+/)[0].replace(/[^\u0600-\u06FFa-zA-Z\-]/g, '');
  } catch (e) { word = ''; }
  if (!word || takenWords.has(word)) word = pool.sort(() => Math.random() - .5)[0] || 'غرفة';
  takenWords.add(word);
  curChosen[idx] = { name: p.name, word, isAI: true };
  roundPlayerIdx++;
  await new Promise(r => setTimeout(r, 700));
  processNext();
}

// ── VOTING PHASE ────────────────────────────────────────────────────────
function startVotingPhase() {
  humanVoters = allPlayers.map((p, i) => ({ p, i })).filter(x => !x.p.isAI);
  currentVoterIdx = 0; collectedVotes = {};
  showVoteForPlayer();
}

function showVoteForPlayer() {
  if (currentVoterIdx >= humanVoters.length) {
    // AI votes randomly
    allPlayers.forEach((p, i) => {
      if (p.isAI) {
        const candidates = allPlayers.map((_, j) => j).filter(j => j !== i);
        collectedVotes[i] = candidates[Math.floor(Math.random() * candidates.length)];
      }
    });
    showVoteResultSummary();
    return;
  }
  const { p } = humanVoters[currentVoterIdx];
  $('vote-rlbl').textContent = 'الجولة ' + toAr(roundN) + ' — التصويت';
  $('voter-label').textContent = '🗳 دور: ' + p.name;
  selVote = -1; $('vote-btn').disabled = true;
  $('vlist').innerHTML = allPlayers.map((pl, j) => `
    <div class="vitem" onclick="selV(this,${j})">
      <div class="av">${pl.name[0]}</div>
      <div style="flex:1">
        <div class="vname">${pl.name}${pl.isAI ? '<span class="ai-tag">AI</span>' : ''}</div>
        <div class="vword">كلمته: "${curChosen[j]?.word || '—'}"</div>
      </div>
      <div class="tick">✕</div>
    </div>`).join('');
  show('p-vote');
}

window.selV = (el, j) => {
  document.querySelectorAll('.vitem').forEach(e => e.classList.remove('sel'));
  el.classList.add('sel'); selVote = j; $('vote-btn').disabled = false;
};

window.confirmVote = () => {
  if (selVote < 0) return;
  const { i } = humanVoters[currentVoterIdx];
  collectedVotes[i] = selVote;
  currentVoterIdx++;
  showVoteForPlayer();
};

function showVoteResultSummary() {
  $('vr-rlbl').textContent = 'الجولة ' + toAr(roundN) + ' — نتيجة التصويت';
  const count = {};
  Object.values(collectedVotes).forEach(v => { count[v] = (count[v] || 0) + 1; });
  const maxV = Math.max(...Object.values(count), 0);
  pendingVerdictIdx = parseInt(Object.keys(count).sort((a, b) => count[b] - count[a])[0]);
  $('vr-list').innerHTML = allPlayers.map((p, i) => `
    <div class="vresult-item">
      <div class="av">${p.name[0]}</div>
      <div style="flex:1">
        <div class="vname">${p.name}${p.isAI ? '<span class="ai-tag">AI</span>' : ''}</div>
        <div class="chosen-by">صوّت لـ: <b>${collectedVotes[i] !== undefined ? allPlayers[collectedVotes[i]]?.name : '—'}</b></div>
      </div>
      <div class="vote-count${count[i] === maxV && (count[i] || 0) > 0 ? ' top' : ''}">${count[i] || 0} صوت</div>
    </div>`).join('');
  $('vr-accused').textContent = allPlayers[pendingVerdictIdx]?.name || '—';
  allRounds.push({ roundN, kwC, kwW, chosen: { ...curChosen } });
  show('p-vresult');
}

window.revealVerdict = () => {
  if (pendingVerdictIdx === whiteIdx) showResult(true, pendingVerdictIdx);
  else showWrong(pendingVerdictIdx);
};

// ── WRONG ──────────────────────────────────────────────────────────────
function showWrong(idx) {
  $('wrong-msg').innerHTML = `<b>${allPlayers[idx].name}</b> ليس السيد الأبيض!<br>السيد الأبيض لا يزال حرًا... 😈`;
  show('p-wrong');
}

window.nextRound = () => { roundN++; pickPair(); revIdx = 0; openOverlay(); };

// ── RESULT ─────────────────────────────────────────────────────────────
function showResult(correct, idx) {
  const wName = allPlayers[whiteIdx].name;
  $('res-hd').innerHTML = correct
    ? `<p class="res-big">السيد الأبيض<br><span style="color:var(--blue)">أُلقي القبض عليه! 🎉</span></p>`
    : `<p class="res-big"><span style="color:var(--red)">${allPlayers[idx].name}</span><br>ليس السيد الأبيض 😈</p>`;
  $('res-info').innerHTML = `السيد الأبيض: <b>${wName}</b>${allPlayers[whiteIdx].isAI ? ' 🤖' : ''}<br>
    كلمة المواطنين: <b>"${kwC}"</b> &nbsp;·&nbsp; كلمة السيد الأبيض: <b>"${kwW}"</b><br>
    انتهت في الجولة <b>${toAr(roundN)}</b>`;
  let html = '';
  allRounds.forEach(r => {
    html += `<div style="padding:5px 0;border-bottom:1px solid var(--border);font-size:11px;color:var(--muted)">الجولة ${toAr(r.roundN)} — مواطن: "${r.kwC}" · السيد الأبيض: "${r.kwW}"</div>`;
    html += allPlayers.map((p, i) => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border)">
        <span>${p.isAI ? '🤖 ' : ''}${p.name}</span>
        <span style="display:flex;gap:6px;align-items:center">
          <span style="color:var(--muted)">"${r.chosen[i]?.word || '—'}"</span>
          <span class="badge ${roles[i] === 'white' ? 'bw' : 'bc'}">${roles[i] === 'white' ? 'السيد الأبيض' : 'مواطن'}</span>
        </span>
      </div>`).join('');
  });
  $('res-tbl').innerHTML = html;
  show('p-result');
}

window.goHome = () => {
  players = []; aiPlayers = []; roles = []; allPlayers = []; curChosen = {}; allRounds = [];
  whiteIdx = -1; usedPairs = []; takenWords = new Set(); aiCount = 0; collectedVotes = {};
  $('chips').innerHTML = ''; $('ai-chips').innerHTML = ''; $('err-home').textContent = '';
  show('p-home');
};