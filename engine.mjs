// The KUSU digital-cultivation rules (services/collab/src/v2c-digital-cultivation.mjs) moved into the browser:
// the same steps, answer checks, hints, scoring and seals. Progress lives only in this browser's localStorage.
import {CHAPTERS, COURSE_VERSION, STEPS, TASKS, TOTAL_POINTS, correctAnswer, validAnswer} from './content.mjs';

const fail = code => { throw Object.assign(new Error(code), {code}); };
const isTask = step => !['story', 'seal', 'final'].includes(step.type);
const newId = () => (globalThis.crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
const blank = () => ({version: COURSE_VERSION, attemptId: newId(), step: 0, maxStep: 0, answers: {}, completed: false});
const answerState = (state, step) => state.answers[step.id] ||= {submissions: 0, wrong: 0, hints: 0, ok: false};

export const cultivationScore = state => {
    const done = TASKS.filter(step => state.answers[step.id]?.ok);
    const seals = CHAPTERS.filter((_, chapter) => STEPS.filter(step => step.chapter === chapter && isTask(step))
        .every(step => state.answers[step.id]?.ok)).length;
    return {
        score: done.reduce((sum, step) => sum + step.points, 0),
        maxScore: TOTAL_POINTS,
        tasksDone: done.length,
        taskTotal: TASKS.length,
        progress: Math.round(done.length / TASKS.length * 100),
        corrected: done.filter(step => state.answers[step.id].wrong > 0).length,
        hints: Object.values(state.answers).reduce((sum, item) => sum + (item.hints || 0), 0),
        submissions: Object.values(state.answers).reduce((sum, item) => sum + (item.submissions || 0), 0),
        seals,
        chapter: STEPS[state.step]?.chapter || 0,
        reached: state.maxStep + 1,
        totalSteps: STEPS.length,
        completed: state.completed
    };
};

export const createEngine = storageKey => {
    const load = () => {
        try {
            const row = JSON.parse(localStorage.getItem(storageKey) || 'null');
            return row && row.state?.version === COURSE_VERSION ? row : null;
        } catch {
            return null;
        }
    };
    const view = row => row ? {revision: row.revision, updatedMs: row.updatedMs, state: row.state,
        metrics: cultivationScore(row.state), feedback: null} :
        {revision: 0, updatedMs: null, state: null, metrics: null, feedback: null};
    return {
        mine: () => view(load()),
        reset: () => { try { localStorage.removeItem(storageKey); } catch {} },
        event ({kind, step: stepIndex, value}) {
            const row = load();
            if (!['start', 'submit', 'hint', 'next', 'navigate', 'finish'].includes(kind) ||
                !Number.isInteger(stepIndex) || stepIndex < 0 || stepIndex >= STEPS.length) fail('CULTIVATION_INPUT_INVALID');
            if (!row && kind !== 'start') fail('CULTIVATION_NOT_STARTED');
            const state = row ? row.state : blank();
            if (kind === 'start') {
                if (row || stepIndex !== 0 || value !== null) fail('CULTIVATION_INPUT_INVALID');
            } else if (kind === 'navigate') {
                if (stepIndex > state.maxStep || value !== null) fail('CULTIVATION_STEP_LOCKED');
                state.step = stepIndex;
            } else {
                if (stepIndex !== state.step) fail('CULTIVATION_STEP_CONFLICT');
                const step = STEPS[state.step];
                if (kind === 'submit') {
                    if (!isTask(step) || !validAnswer(step, value)) fail('CULTIVATION_INPUT_INVALID');
                    const item = answerState(state, step);
                    if (!item.ok) {
                        item.answer = value;
                        item.submissions += 1;
                        item.ok = correctAnswer(step, value);
                        if (!item.ok) item.wrong += 1;
                        else item.solvedMs = Date.now();
                    }
                } else if (kind === 'hint') {
                    if (!isTask(step) || value !== null) fail('CULTIVATION_INPUT_INVALID');
                    const item = answerState(state, step);
                    if (!item.ok) item.hints = Math.min(item.hints + 1, step.hints.length);
                } else if (kind === 'next') {
                    if (value !== null || state.step === STEPS.length - 1 || (isTask(step) && !state.answers[step.id]?.ok)) {
                        fail('CULTIVATION_STEP_LOCKED');
                    }
                    state.step += 1;
                } else if (kind === 'finish') {
                    if (value !== null || state.step !== STEPS.length - 1 || cultivationScore(state).score !== TOTAL_POINTS) {
                        fail('CULTIVATION_STEP_LOCKED');
                    }
                    state.completed = true;
                    state.completedMs ||= Date.now();
                }
                state.maxStep = Math.max(state.maxStep, state.step);
            }
            const next = {revision: (row?.revision || 0) + 1, updatedMs: Date.now(), state};
            try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { fail('BROWSER_STORAGE_UNAVAILABLE'); }
            return view(next);
        }
    };
};
