let players = [];
let aiPlayers = [];
let aiCount = 0;

const $ = id => document.getElementById(id);

function renderChips(){
  $('chips').innerHTML = players.map((p,i)=>
    `<div class="chip">
      ${p}
      <span class="x" onclick="removeP(${i})">×</span>
    </div>`
  ).join('');
}

function addP(){
  const v = $('pinput').value.trim();

  if(v && !players.includes(v) && (players.length + aiPlayers.length) < 8){
    players.push(v);
    $('pinput').value = '';
    renderChips();
  }
}

function removeP(i){
  players.splice(i,1);
  renderChips();
}

$('pinput').onkeydown = e => {
  if(e.key === 'Enter') addP();
};

function renderAIChips(){
  $('ai-chips').innerHTML = aiPlayers.map(a =>
    `<div class="ai-chip">🤖 ${a}</div>`
  ).join('');
}

function addAI(){
  if(players.length + aiPlayers.length >= 8) return;

  aiCount++;
  aiPlayers.push('AI-' + aiCount);

  renderAIChips();
}

function removeLastAI(){
  if(!aiPlayers.length) return;

  aiPlayers.pop();

  renderAIChips();
}

function startGame(){
  const total = players.length + aiPlayers.length;

  if(total < 3){
    $('err-home').textContent = 'الحد الأدنى ٣ لاعبين!';
    return;
  }

  $('err-home').textContent = '';

  alert('Game Started!');
}