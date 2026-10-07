import test from 'node:test';
import assert from 'node:assert/strict';
import {createEngine, cultivationScore} from './engine.mjs';
import {STEPS, TASKS, COURSE_VERSION} from './content.mjs';
const values = new Map();
globalThis.localStorage = {getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key)};
const create = () => createEngine(`test-${values.size}-${Math.random()}`);
const event = (app, kind, value = null, step = app.mine().state?.step || 0) => app.event({kind, value, step});
const reach = (app, id) => {
    event(app, 'start');
    for (;;) {
        const step = STEPS[app.mine().state.step];
        if (step.id === id) return;
        if (!['story', 'seal', 'final'].includes(step.type)) event(app, 'submit', step.answer);
        event(app, 'next');
    }
};
for (const type of ['choice', 'multi']) {
    test(`public ${type}: repeated errors accumulate, hints are free and correction keeps penalty after reload`, () => {
        const app = create();
        const step = TASKS.find(entry => entry.type === type);
        reach(app, step.id);
        const wrong = type === 'choice' ? step.choices.find(([id]) => id !== step.answer)[0] : [];
        event(app, 'submit', wrong);
        event(app, 'submit', wrong);
        event(app, 'hint');
        const solved = event(app, 'submit', step.answer);
        assert.equal(solved.metrics.choicePenalty, 2);
        assert.equal(app.mine().metrics.score, Math.max(0, solved.metrics.earnedScore - 2));
        assert.equal(event(app, 'submit', wrong).metrics.choicePenalty, 2);
    });
}
test('public sorting and matching corrections are free', () => {
    for (const type of ['order', 'match']) {
        const app = create();
        const step = TASKS.find(entry => entry.type === type);
        reach(app, step.id);
        const wrong = type === 'order' ? [...step.answer].reverse() :
            Object.fromEntries(step.choices.map(([id]) => [id, step.bins[0][0]]));
        const result = event(app, 'submit', wrong);
        assert.equal(result.state.answers[step.id].ok, false);
        assert.equal(result.metrics.choicePenalty, 0);
        const solved = event(app, 'submit', step.answer);
        assert.equal(solved.metrics.score, solved.metrics.earnedScore);
    }
});
test('public completion caps 101 wrong answers at the task points and preserves raw history', () => {
    const app = create();
    event(app, 'start');
    let charged = false;
    for (const step of STEPS) {
        if (step.type === 'choice' && !charged) {
            for (let index = 0; index < 101; index++) event(app, 'submit', step.choices.find(([id]) => id !== step.answer)[0]);
            charged = true;
        }
        if (!['story', 'seal', 'final'].includes(step.type)) event(app, 'submit', step.answer);
        if (step.type === 'final') event(app, 'finish');
        else event(app, 'next');
    }
    assert.equal(app.mine().metrics.score, 97);
    assert.equal(app.mine().metrics.earnedScore, 100);
    assert.equal(app.mine().metrics.choicePenalty, 3);
    assert.equal(app.mine().state.answers[TASKS.find(step => step.type === 'choice').id].choicePenalty, 101);
    assert.equal(app.mine().metrics.completed, true);
});
test('public completed pre-update grade and progress survive upgrading the rule', () => {
    const state = {version: COURSE_VERSION, attemptId: 'legacy', step: STEPS.length - 1,
        maxStep: STEPS.length - 1, completed: true,
        answers: Object.fromEntries(TASKS.map(step => [step.id, {ok: true, wrong: 5, submissions: 6, hints: 2}]))};
    values.set('legacy', JSON.stringify({revision: 80, state, updatedMs: 1000}));
    const loaded = createEngine('legacy').mine();
    assert.equal(loaded.state.attemptId, 'legacy');
    assert.equal(loaded.revision, 80);
    assert.equal(loaded.metrics.score, 100);
    assert.equal(loaded.metrics.choicePenalty, 0);
    assert.deepEqual(loaded.metrics, cultivationScore(state));
});

for (const type of ['choice', 'multi']) {
    test(`public ${type}: cap, old raw history, correction and persisted reload`, () => {
        const key = `cap-${type}`;
        const app = createEngine(key);
        const step = TASKS.find(entry => entry.type === type);
        reach(app, step.id);
        const wrong = type === 'choice' ? step.choices.find(([id]) => id !== step.answer)[0] : [];
        for (let i = 0; i < 17; i++) event(app, 'submit', wrong);
        assert.equal(app.mine().metrics.choicePenalty, step.points);
        assert.equal(app.mine().state.answers[step.id].choicePenalty, 17);
        const stored = values.get(key);
        assert.equal(createEngine(key).mine().metrics.choicePenalty, step.points);
        assert.equal(values.get(key), stored);
        event(app, 'submit', step.answer);
        assert.equal(createEngine(key).mine().metrics.choicePenalty, step.points);
        assert.equal(createEngine(key).mine().state.answers[step.id].choicePenalty, 17);
    });
}
test('legacy over-cap completed public record is recalculated without storage changes', () => {
    const state = {version: COURSE_VERSION, attemptId: 'old-over-cap', step: 46, maxStep: 46, completed: true,
        answers: Object.fromEntries(TASKS.map(step => [step.id, {ok: true, wrong: 0, hints: 0}]))};
    state.answers['os-jobs'] = {ok: true, wrong: 17, choicePenalty: 17};
    const saved = JSON.stringify({revision: 99, state, updatedMs: 10});
    values.set('old-over-cap', saved);
    assert.equal(createEngine('old-over-cap').mine().metrics.score, 97);
    assert.equal(values.get('old-over-cap'), saved);
});
