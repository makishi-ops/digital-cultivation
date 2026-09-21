import {CHAPTERS, DEFAULT_BINS, OPS, STEPS, applyEdits, cellLabel, runMachine} from './content.mjs';
import {LESSONS, SCENES} from './lessons.mjs';

const esc = value => String(value ?? '').replace(/[&<>"']/gu,
    char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]));
const $ = selector => document.querySelector(selector);
const all = selector => [...document.querySelectorAll(selector)];
const task = step => !['story', 'seal', 'final'].includes(step.type);
const memory = new Map();
let dispose = () => {};
let focusedStep = '';
let images = {};

fetch(new URL('./images/manifest.json', import.meta.url), {cache: 'no-store'})
    .then(response => response.ok ? response.json() : {})
    .then(value => {
        if (value && typeof value === 'object' && !Array.isArray(value)) images = value;
        fillImages();
    }).catch(() => {});

function art(chapter = -1) {
    const [id, title, caption] = SCENES[chapter] || ['00-cover', '天機城失控案', '一卷卷宗，一座待你解開的城。'];
    return `<figure class="scene-art scene-${chapter}" data-scene="${id}">
      <div class="scene-placeholder" role="img" aria-label="${esc(title)}：天機城剪影">
        <span class="scene-orbit" aria-hidden="true"></span><span class="scene-city" aria-hidden="true"></span>
        <span class="scene-title">${esc(title)}</span></div>
      <figcaption>${esc(caption)}</figcaption></figure>`;
}

function fillImages() {
    all('[data-scene]').forEach(figure => {
        const path = images[figure.dataset.scene];
        // Only fixed local filenames are accepted; no remote URLs or traversal.
        if (typeof path !== 'string' || !/^\d{2}-[a-z-]+\.(png|jpe?g|webp)$/u.test(path) || figure.querySelector('img')) return;
        const img = new Image();
        img.alt = figure.querySelector('.scene-title').textContent;
        img.decoding = 'async';
        img.hidden = true;
        img.onload = () => { img.hidden = false; figure.classList.add('has-image'); };
        img.onerror = () => { img.remove(); figure.classList.remove('has-image'); };
        img.src = new URL(`./images/${path}`, import.meta.url).href;
        figure.prepend(img);
    });
}

export function mountCoverArt() {
    dispose();
    const sigil = $('.sigil');
    if (sigil) sigil.outerHTML = art();
    fillImages();
}

// Same starting order for the same student and step, never the answer itself (and never a simple rotation of it).
function shuffledOrder(ids, answer, seed) {
    let hash = 2166136261;
    for (const char of seed) hash = Math.imul(hash ^ char.codePointAt(0), 16777619);
    const random = () => {
        hash = Math.imul(hash ^ (hash >>> 15), 2246822507);
        hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
        return ((hash ^= hash >>> 16) >>> 0) / 4294967296;
    };
    const list = [...ids];
    for (let index = list.length - 1; index > 0; index -= 1) {
        const other = Math.floor(random() * (index + 1));
        [list[index], list[other]] = [list[other], list[index]];
    }
    const rotated = [...answer.slice(1), answer[0]];
    if (list.join() === answer.join() || list.join() === rotated.join()) [list[0], list[list.length - 1]] = [list[list.length - 1], list[0]];
    if (list.join() === answer.join()) [list[0], list[1]] = [list[1], list[0]];
    return list;
}

function draftFor(actor, state, step, item) {
    const key = `kusu:cultivation:reading-v3:${actor.actorId}:${state.attemptId}:${step.id}`;
    let draft = memory.get(key);
    if (!draft) {
        try { draft = JSON.parse(sessionStorage.getItem(key)); } catch {}
        if (!draft || typeof draft !== 'object') draft = {};
        draft.phase = draft.phase === 1 ? 1 : 0;
        const ids = (step.choices || []).map(([id]) => id);
        const object = value => value && typeof value === 'object' && !Array.isArray(value);
        if (step.type === 'order' && (!Array.isArray(draft.answer) || draft.answer.length !== ids.length ||
            new Set(draft.answer).size !== ids.length || !draft.answer.every(id => ids.includes(id)))) {
            draft.answer = item.answer || shuffledOrder(ids, step.answer, `${state.attemptId}:${step.id}`);
        } else if (step.type === 'multi' && !Array.isArray(draft.answer)) draft.answer = item.answer || [];
        else if (step.type === 'path' && !Array.isArray(draft.answer)) draft.answer = item.answer || [];
        else if (step.type === 'match' && !object(draft.answer)) draft.answer = item.answer || {};
        else if (step.type === 'program' && !object(draft.answer)) {
            draft.answer = item.answer || Object.fromEntries(Object.keys(step.machine.edit).map(cell => [cell, step.machine.memory[cell][0]]));
        }
        memory.set(key, draft);
    }
    if (item.ok) draft.answer = item.answer;
    if (item.submissions || item.ok) draft.phase = 1;
    return {draft, save: () => {
        try { sessionStorage.setItem(key, JSON.stringify(draft)); } catch {}
    }};
}

// The stored-program machine: memory on the left, the CPU and the screen on the right, run one step at a time.
function mountMachine(host, machine, {editable = false, edits = () => ({}), onEdit = () => {}, locked = () => false} = {}) {
    let run = null;
    let index = -1;
    const program = () => applyEdits(machine, editable ? edits() : {});
    const opLabel = (cell, op) => {
        const original = machine.memory[cell];
        const address = original && original.length > 1 ? original[1] : machine.operand?.[cell];
        return ['load', 'add', 'sub', 'mul'].includes(op) ? `${OPS[op]} 第 ${address} 格` : OPS[op];
    };
    const render = () => {
        const cells = program();
        const now = run && index >= 0 ? run.trace[index] : null;
        const pc = now ? now.pc : 0;
        const done = run && index === run.trace.length - 1;
        host.innerHTML = `<div class="sim">
          <div class="sim-memory"><b>記憶體</b><ol>${cells.map((cell, at) => `<li class="${at === pc && run ? 'current' : ''} ${cell?.[0] === 'num' ? 'data' : ''}">
            <span class="addr">${at}</span>${editable && machine.edit[at] ? `<select data-edit="${at}" aria-label="第 ${at} 格的指令" ${locked() ? 'disabled' : ''}>${machine.edit[at].map(op =>
                `<option value="${op}" ${edits()[at] === op ? 'selected' : ''}>${esc(opLabel(at, op))}</option>`).join('')}</select>` :
                `<span>${esc(cellLabel(cell))}</span>`}</li>`).join('')}</ol></div>
          <div class="sim-side"><div class="sim-cpu"><b>CPU</b>
            <span class="unit ${now?.unit === 'control' ? 'on' : ''}">控制單元</span>
            <span class="unit ${now?.unit === 'alu' ? 'on' : ''}">算術邏輯單元</span>
            <span>正在執行：第 ${pc} 格</span><span>計算結果：${now?.acc ?? '—'}</span></div>
            <div class="sim-screen ${now?.unit === 'output' ? 'on' : ''}"><b>螢幕</b><output>${esc((now?.output || []).join('、') || ' ')}</output></div></div>
          <p class="sim-log" role="status">${esc(now ? now.text : '按「執行一步」，看 CPU 怎麼一格一格執行。')}</p>
          <div class="sim-buttons"><button type="button" class="secondary" data-sim="step" ${done ? 'disabled' : ''}>執行一步</button>
            <button type="button" class="secondary" data-sim="all" ${done ? 'disabled' : ''}>全部執行</button>
            <button type="button" class="text-button" data-sim="reset">重來</button></div></div>`;
    };
    host.addEventListener('click', event => {
        const action = event.target.closest('[data-sim]')?.dataset.sim;
        if (!action) return;
        if (action === 'reset') { run = null; index = -1; render(); return; }
        run ||= runMachine(program());
        index = action === 'all' ? run.trace.length - 1 : Math.min(index + 1, run.trace.length - 1);
        render();
    });
    host.addEventListener('change', event => {
        const cell = event.target.dataset?.edit;
        if (cell === undefined || locked()) return;
        onEdit(cell, event.target.value);
        run = null;
        index = -1;
        render();
    });
    render();
}

function controls(step, item, draft) {
    const disabled = item.ok ? 'disabled' : '';
    if (step.type === 'order') {
        const labels = Object.fromEntries(step.choices);
        return `<p class="instruction" id="order-help">拖曳整張卡片，直接放到目標位置。鍵盤：Tab 選卡，↑↓ 移動，Home／End 移到首尾。</p>
        <ol class="order drag-order" aria-label="${esc(step.title)}" aria-describedby="order-help">${draft.answer.map(id =>
            `<li data-order="${esc(id)}"><button type="button" class="drag-card" ${disabled} aria-label="${esc(labels[id])}，拖曳排序">
            <span class="grip" aria-hidden="true">⠿</span><span class="order-number" aria-hidden="true"></span><span>${esc(labels[id])}</span></button></li>`).join('')}</ol>
        <p id="drag-status" class="instruction" role="status" aria-live="polite">移動完成後，按「驗證排列」。</p>
        <button id="confirm" class="primary" ${disabled}>驗證排列</button>`;
    }
    if (step.type === 'choice' || step.type === 'multi') {
        const multi = step.type === 'multi';
        const selected = item.ok ? item.answer : draft.answer ?? item.answer;
        return `<p class="instruction">${multi ? '可以選多項，選好後一起確認。' : '選一個答案，再按確認；確認前都可以改。'}</p><div class="choices">${step.choices.map(([id, label]) => {
            const active = multi ? selected?.includes(id) : selected === id;
            return `<button data-pick="${esc(id)}" aria-pressed="${!!active}" class="${active ? 'selected' : ''}" ${disabled}>${esc(label)}</button>`;
        }).join('')}</div><button id="confirm" class="primary" ${disabled}>${multi ? '確認判斷' : '確認答案'}</button>`;
    }
    if (step.type === 'match') {
        const bins = step.bins || DEFAULT_BINS;
        return `${step.machine ? '<div id="machine-demo"></div>' : ''}
        <p class="instruction">每一項點一下合適的選項，全部選好再確認；確認前都可以改。</p><div class="assignment">${step.choices.map(([id, label]) =>
            `<fieldset><legend>${esc(label)}</legend>${bins.map(([bin, binLabel]) => `<button data-job="${esc(id)}" data-bin="${esc(bin)}"
            aria-pressed="${draft.answer[id] === bin}" class="${draft.answer[id] === bin ? 'selected' : ''}" ${disabled}>${esc(binLabel)}</button>`).join('')}</fieldset>`).join('')}</div>
            <button id="confirm" class="primary" ${disabled}>確認分類</button>`;
    }
    if (step.type === 'path') {
        const labels = Object.fromEntries(step.nodes.map(([id, label]) => [id, label]));
        return `<p class="instruction">依資料經過的順序點選；點錯可以「退一步」。</p>
        <div class="path-nodes">${step.nodes.map(([id, label, note]) => `<button type="button" data-node="${esc(id)}" ${disabled}>
            <b>${esc(label)}</b><small>${esc(note)}</small></button>`).join('')}</div>
        <p class="path-line" role="status" aria-live="polite">${draft.answer.length ? draft.answer.map(id => esc(labels[id])).join(' → ') : '還沒選任何一站。'}</p>
        <div class="path-tools"><button type="button" class="text-button" data-path="undo" ${disabled}>退一步</button>
            <button type="button" class="text-button" data-path="clear" ${disabled}>清除</button></div>
        <button id="confirm" class="primary" ${disabled}>確認路線</button>`;
    }
    if (step.type === 'program') {
        return `<div id="machine-program"></div><button id="confirm" class="primary" ${disabled}>送出結果</button>`;
    }
    return '';
}

function evidence(step) {
    let html = '';
    if (step.panel) {
        html += `<div class="meter" aria-label="工作管理員">${step.panel.map(([label, value]) =>
            `<div><span>${esc(label)}</span><i class="${Number(value) >= 90 ? 'high' : ''}" style="--value:${Number(value)}%"></i><b>${Number(value)}%</b></div>`).join('')}</div>`;
    }
    if (step.evidence) html += `<pre class="syslog" aria-label="系統日誌">${step.evidence.map(esc).join('\n')}</pre>`;
    return html;
}

function bindOrder(canEdit, onChange) {
    const list = $('.drag-order');
    if (!list) return () => {};
    let drag = null;
    let frame = 0;
    const ids = () => [...list.children].map(row => row.dataset.order);
    const announce = row => {
        const index = [...list.children].indexOf(row);
        $('#drag-status').textContent = `已移到第 ${index + 1} 個位置。排列尚未送出。`;
    };
    const move = y => {
        if (!drag) return;
        for (const other of [...list.children].filter(row => row !== drag.row)) {
            const rect = other.getBoundingClientRect();
            if (y < rect.top + rect.height / 2) { list.insertBefore(drag.row, other); return; }
        }
        list.append(drag.row);
    };
    const tick = () => {
        if (!drag) return;
        const delta = drag.y < 100 ? -12 : drag.y > innerHeight - 90 ? 12 : 0;
        if (delta) { window.scrollBy(0, delta); move(drag.y); }
        frame = requestAnimationFrame(tick);
    };
    const end = (cancel = false) => {
        if (!drag) return;
        const current = drag;
        drag = null;
        cancelAnimationFrame(frame);
        if (cancel) current.before.forEach(id => list.append([...list.children].find(row => row.dataset.order === id)));
        current.row.classList.remove('dragging');
        document.body.classList.remove('sorting');
        announce(current.row);
        if (cancel) $('#drag-status').textContent = '已取消移動，恢復原排列。';
        current.button.focus({preventScroll: true});
        onChange(ids());
    };
    const down = event => {
        const button = event.target.closest('.drag-card');
        if (!button || !canEdit() || button.disabled || event.button !== 0 || drag) return;
        event.preventDefault();
        drag = {row: button.closest('li'), button, before: ids(), y: event.clientY, pointerId: event.pointerId};
        button.focus({preventScroll: true});
        drag.row.classList.add('dragging');
        document.body.classList.add('sorting');
        frame = requestAnimationFrame(tick);
    };
    const pointerMove = event => {
        if (!drag || event.pointerId !== drag.pointerId) return;
        if (!canEdit()) { end(true); return; }
        event.preventDefault();
        drag.y = event.clientY;
        move(drag.y);
    };
    const up = event => { if (drag && event.pointerId === drag.pointerId) end(false); };
    const cancel = () => end(true);
    const key = event => {
        if (event.key === 'Escape') { end(true); return; }
        const button = event.target.closest('.drag-card');
        if (!button || button.disabled || !canEdit()) return;
        const row = button.closest('li');
        if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        if (event.key === 'ArrowUp') row.previousElementSibling?.before(row);
        if (event.key === 'ArrowDown') row.nextElementSibling?.after(row);
        if (event.key === 'Home') list.prepend(row);
        if (event.key === 'End') list.append(row);
        button.focus({preventScroll: true});
        announce(row);
        onChange(ids());
    };
    list.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', pointerMove, {passive: false});
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancel);
    window.addEventListener('blur', cancel);
    // Keyboard events bubble from the list to window; handle them there only once.
    window.addEventListener('keydown', key);
    return () => {
        end(true);
        list.removeEventListener('pointerdown', down);
        window.removeEventListener('pointermove', pointerMove);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', cancel);
        window.removeEventListener('blur', cancel);
        window.removeEventListener('keydown', key);
    };
}

export function renderLearning({record, actor, send, canEdit}) {
    dispose();
    dispose = () => {};
    if (!record?.state) {
        $('#app').innerHTML = `<section class="panel intro">${art()}<p class="eyebrow">一本可以親手解開的故事</p><h1>天機城失控案</h1>
        <p class="narrative">走進九個篇章，讀一段遭遇，學一個概念，再親手修復一處故障。</p>
        <p>線索可以隨時回看；嘗試與訂正都是調查的一部分。</p><button id="start" class="primary">翻開第一頁 →</button></section>`;
        $('#start').onclick = () => send('start');
        fillImages();
        return;
    }
    const state = record.state;
    const step = STEPS[state.step];
    const item = state.answers[step.id] || {};
    const chapter = CHAPTERS[step.chapter];
    const lesson = LESSONS[step.id];
    const {draft, save} = draftFor(actor, state, step, item);
    const rerender = () => { save(); renderLearning({record, actor, send, canEdit}); };
    const ready = !task(step) || item.ok;
    const phase = item.ok ? 2 : draft.phase;
    let html = `<section class="progress"><div><b>${esc(chapter.title)}</b><span>第 ${state.step + 1}／${STEPS.length} 步</span><span>${record.metrics.score}／100</span></div>
    <div class="bar"><i style="width:${record.metrics.progress}%"></i></div></section>
    <nav class="review"><label>重讀卷宗<select id="step-select">${STEPS.slice(0, state.maxStep + 1).map((entry, index) =>
        `<option value="${index}" ${index === state.step ? 'selected' : ''}>${index + 1}·${esc(entry.title)}</option>`).join('')}</select></label></nav>
    <article class="panel reader chapter-${step.chapter}"><p class="eyebrow">${esc(chapter.title)}</p><h1 id="step-heading" tabindex="-1">${esc(step.title)}</h1>`;
    if (step.type === 'story') {
        html += `${art(step.chapter)}<p class="narrative">${esc(step.narrative)}</p>`;
        if (!draft.phase) html += '<div class="next"><button id="reveal" class="primary">隨師父看看線索 →</button></div>';
        else html += `<aside class="metaphor"><b>師父的比喻</b><p>${esc(step.metaphor)}</p></aside>
            <aside class="truth"><b>這一幕，先認識一件事</b><p>${esc(step.truth)}</p></aside>
            <p class="note">接下來會用小任務，逐步拆解這些線索。</p>`;
    } else if (task(step)) {
        html += `<ol class="reading-phases" aria-label="學習節奏">${['讀情境', '動手試', '解開線索'].map((label, index) =>
            `<li ${phase === index ? 'aria-current="step"' : ''}>${label}</li>`).join('')}</ol>`;
        if (phase === 0) {
            html += `<p class="narrative">${esc(lesson[0])}</p><aside class="truth"><b>這次只學一件事</b><p>${esc(lesson[1])}</p></aside>
            <div class="worked-example"><b>跟著師父看一次</b><p>${esc(lesson[2])}</p></div>
            <div class="next"><button id="reveal" class="primary">換我動手試試 →</button></div>`;
        } else {
            html += `<details class="clue-review"><summary>回看故事與示例</summary><p>${esc(lesson[0])}</p><p>${esc(lesson[1])}</p><p>${esc(lesson[2])}</p></details>
            ${evidence(step)}<p class="prompt">${esc(step.prompt)}</p>${controls(step, item, draft)}`;
            if (item.ok) html += `<section class="feedback correct" role="status"><b>線索解開了</b><p>${esc(lesson[1])}</p>
                <p class="narrative">${esc(lesson[3])}</p></section>`;
            else if (item.submissions) html += `<section class="feedback wrong" role="status"><b>還有一處需要核對</b><p>${esc(lesson[1])}</p><p>回看示例再試一次，訂正仍可得完整分數。</p></section>`;
            if (!item.ok && step.hints?.length) html += `<div class="hint"><button id="hint" class="text-button" ${item.hints >= step.hints.length ? 'disabled' : ''}>請師父再提示一步</button>
                ${item.hints ? `<p>${esc(step.hints[Math.min(item.hints, step.hints.length) - 1])}</p>` : ''}</div>`;
        }
    } else if (step.type === 'seal') {
        html += `<div class="seal-card"><div aria-hidden="true">◆</div><p class="narrative">停一下，整理你剛剛親手找到的證據。</p>
        <ul>${step.learned.map(text => `<li>${esc(text)}</li>`).join('')}</ul><p>試著用自己的話，向同學說明其中一件事。</p></div>
        ${step.pause ? `<p class="pause-note" role="note">${esc(step.pause)}</p>` : ''}`;
    } else if (step.type === 'final') {
        html += `${art(8)}<p class="narrative">${esc(step.narrative)}</p><div class="final-score"><b>${record.metrics.score}／100</b>
        <p>九枚道印，記下你走過的調查。</p><button id="finish" class="primary" ${state.completed ? 'disabled' : ''}>${state.completed ? '事故卷宗已封存' : '封存事故卷宗'}</button></div>`;
    }
    if (state.step < STEPS.length - 1 && ready && (step.type !== 'story' || draft.phase)) {
        html += '<div class="next"><button id="next" class="primary">翻開下一頁 →</button></div>';
    }
    html += `</article><details class="record"><summary>我的調查紀錄 · ${record.metrics.tasksDone}／${record.metrics.taskTotal} 項線索</summary>
        <p>已得 ${record.metrics.score} 分，${record.metrics.seals}／9 枚道印。提示、訂正與作答速度不扣分。</p></details>`;
    $('#app').innerHTML = html;
    fillImages();
    $('#step-select').onchange = event => { if (canEdit()) send('navigate', null, Number(event.target.value)); };
    $('#reveal')?.addEventListener('click', () => { draft.phase = 1; rerender(); $('#step-heading').focus({preventScroll: true}); });
    $('#next')?.addEventListener('click', () => send('next'));
    $('#finish')?.addEventListener('click', () => send('finish'));
    $('#hint')?.addEventListener('click', () => send('hint'));
    const locked = () => !canEdit() || item.ok;
    all('[data-pick]').forEach(button => { button.onclick = () => {
        if (locked()) return;
        if (step.type === 'choice') draft.answer = button.dataset.pick;
        else {
            const set = new Set(draft.answer);
            if (set.has(button.dataset.pick)) set.delete(button.dataset.pick); else set.add(button.dataset.pick);
            draft.answer = [...set].sort();
        }
        save();
        all('[data-pick]').forEach(option => {
            const active = step.type === 'choice' ? option.dataset.pick === draft.answer : draft.answer.includes(option.dataset.pick);
            option.classList.toggle('selected', active);
            option.setAttribute('aria-pressed', String(active));
        });
    }; });
    all('[data-job]').forEach(button => { button.onclick = () => {
        if (locked()) return;
        draft.answer[button.dataset.job] = button.dataset.bin; save();
        all('[data-job]').filter(option => option.dataset.job === button.dataset.job).forEach(option => {
            const selected = option === button;
            option.classList.toggle('selected', selected); option.setAttribute('aria-pressed', String(selected));
        });
    }; });
    const labels = Object.fromEntries((step.nodes || []).map(([id, label]) => [id, label]));
    const showPath = () => { $('.path-line').textContent = draft.answer.length ? draft.answer.map(id => labels[id]).join(' → ') : '還沒選任何一站。'; };
    all('[data-node]').forEach(button => { button.onclick = () => {
        if (locked() || draft.answer.length >= 10) return;
        draft.answer = [...draft.answer, button.dataset.node]; save(); showPath();
    }; });
    all('[data-path]').forEach(button => { button.onclick = () => {
        if (locked()) return;
        draft.answer = button.dataset.path === 'undo' ? draft.answer.slice(0, -1) : []; save(); showPath();
    }; });
    if ($('#machine-demo')) mountMachine($('#machine-demo'), step.machine);
    if ($('#machine-program')) {
        mountMachine($('#machine-program'), step.machine, {editable: true, edits: () => draft.answer, locked,
            onEdit: (cell, op) => { draft.answer = {...draft.answer, [cell]: op}; save(); }});
    }
    $('#confirm')?.addEventListener('click', () => {
        if (locked()) return;
        const warn = text => { $('#sync').textContent = text; };
        if (step.type === 'choice' && !draft.answer) { warn('請先選一個答案，再按確認。'); return; }
        if (step.type === 'path' && !draft.answer.length) { warn('請先依序點出資料經過的站。'); return; }
        if (step.type === 'match' && step.choices.some(([id]) => !draft.answer[id])) {
            const first = step.choices.find(([id]) => !draft.answer[id]);
            all('[data-job]').find(option => option.dataset.job === first[0])?.focus();
            warn('每一項都要選好，再按確認。'); return;
        }
        save(); send('submit', step.type === 'multi' ? [...draft.answer].sort() : draft.answer);
    });
    dispose = bindOrder(() => !locked(), value => { draft.answer = value; save(); });
    const key = `${actor.actorId}:${step.id}`;
    if (focusedStep !== key) {
        focusedStep = key;
        requestAnimationFrame(() => { window.scrollTo(0, 0); $('#step-heading')?.focus({preventScroll: true}); });
    }
}
