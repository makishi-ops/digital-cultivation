// Preview without login: the KUSU course cover, then the same reading pages (experience.mjs).
// The SERVER rules run in engine.mjs and progress stays in this browser only.
import {renderLearning, mountCoverArt} from './experience.mjs';
import {createEngine} from './engine.mjs';

const TITLE = '數位修真錄';
const SIGIL = '修';
const VARIANT = 'revised';
const $ = selector => document.querySelector(selector);
const actor = {actorId: `preview-${VARIANT}`};
const engine = createEngine(`digital-cultivation-preview:${VARIANT}`);
const errors = {
    CULTIVATION_STEP_LOCKED: '請先完成目前任務。',
    CULTIVATION_STEP_CONFLICT: '另一個分頁已更新進度，已重新載入。',
    CULTIVATION_NOT_STARTED: '試玩進度已清除，請重新開始。',
    BROWSER_STORAGE_UNAVAILABLE: '這個瀏覽器不能保存進度（可能是無痕視窗），重新整理後會從頭開始。'
};
let record = engine.mine();

const status = text => { $('#sync').textContent = text; };

function send(kind, value = null, step = record?.state?.step || 0) {
    try {
        record = engine.event({kind, step, value});
        status(`試玩進度已存在這台瀏覽器 · ${new Date(record.updatedMs).toLocaleTimeString('zh-TW')}`);
    } catch (error) {
        record = engine.mine();
        status(errors[error.code] || `操作沒有完成（${error.code || error.message}）。`);
    }
    play();
}

function play() {
    renderLearning({record, actor, send, canEdit: () => true});
}

function cover() {
    record = engine.mine();
    const step = record.state ? record.state.step + 1 : 0;
    $('#app').innerHTML = `<section class="cover">
      <div class="sigil" aria-hidden="true">${SIGIL}</div>
      <div><p class="eyebrow">九年級·系統平臺</p><h1>${TITLE}</h1>
      <h2>天機城失控案</h2><p class="lead">天機鏡說出末日預言，全城隨即停擺。你要查的不是功法，而是輸入、CPU、記憶體、作業系統與網路留下的證據。</p>
      <div class="preview-actions"><button id="play" class="primary">${step ? `繼續試玩（第 ${step} 步）` : '開始試玩'}</button>
      ${step ? '<button id="restart" class="secondary">從頭開始</button>' : ''}</div>
      <p class="note">試玩版·不需登入·進度只存在這台瀏覽器·提示與訂正不扣分</p></div></section>`;
    mountCoverArt();
    $('#play').onclick = play;
    $('#restart')?.addEventListener('click', restart);
}

function restart() {
    if (!confirm('要清除這個版本的試玩進度，從第一頁重新開始嗎？')) return;
    engine.reset();
    try {
        Object.keys(sessionStorage).filter(key => key.startsWith(`kusu:cultivation:reading-v2:${actor.actorId}:`))
            .forEach(key => sessionStorage.removeItem(key));
    } catch {}
    record = engine.mine();
    status('已清除試玩進度，從第一頁開始。');
    play();
}

$('#reset').onclick = restart;
cover();
