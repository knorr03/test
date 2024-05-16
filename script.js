const startButton = document.getElementById('start-button');
const retryButton = document.getElementById('retry-button');
const mainMusic = document.getElementById('main-music');
const scoreDisplay = document.getElementById('score');
const comboDisplay = document.getElementById('combo');
const finalScoreText = document.getElementById('final-score-text');
const finalScorePopup = document.getElementById('final-score-popup');
const warning = document.getElementById('warning');
const progressBar = document.getElementById('progress-bar');
const timeLabel = document.getElementById('time-label');
let score = 0;
let combo = 0;
let progressInterval;

const sounds = {
    'A': document.getElementById('sound-a'),
    'S': document.getElementById('sound-s'),
    'D': document.getElementById('sound-d'),
    ' ': document.getElementById('sound-space')
};

const intervalA = 666.6;
const intervalS = 1333.2;
const intervalSpace = 1333.2;
const initialDelayA = 2950;
const initialDelayS = 2950;
const initialDelaySpace = 3616.6;
const musicDuration = 89000;
const noteFallTime = 2950;

const maxRepeatsA = Math.floor((musicDuration - initialDelayA - noteFallTime) / intervalA);
const maxRepeatsS = Math.floor((musicDuration - initialDelayS - noteFallTime) / intervalS);
const maxRepeatsSpace = Math.floor((musicDuration - initialDelaySpace - noteFallTime) / intervalSpace);

const notes = [
    { key: 'D', time: 2950 + 9 * 666.6 },
    { key: 'D', time: 2950 + 26 * 666.6 },
    { key: 'D', time: 2950 + 33 * 666.6 },
    { key: 'D', time: 2950 + 42 * 666.6 },
    { key: 'D', time: 2950 + 51 * 666.6 },
    { key: 'D', time: 2950 + 60 * 666.6 },
    { key: 'D', time: 2950 + 89 * 666.6 },
    { key: 'D', time: 2950 + 99 * 666.6 },
    { key: 'D', time: 2950 + 108 * 666.6 },
    { key: 'D', time: 2950 + 117 * 666.6 }
];

let noteElements = [];

startButton.addEventListener('click', startGame);
retryButton.addEventListener('click', startGame);

function startGame() {
    score = 0;
    combo = 0;
    scoreDisplay.textContent = 'Score: 0';
    comboDisplay.textContent = 'Combo: 0';
    finalScorePopup.classList.add('hidden');
    startButton.classList.add('hidden');
    warning.classList.add('hidden');
    mainMusic.play();

    notes.forEach(note => {
        setTimeout(() => createNoteElement(note.key), note.time);
    });

    setTimeout(() => createRepeatedNotes('A', intervalA, initialDelayA, maxRepeatsA), initialDelayA);
    setTimeout(() => createRepeatedNotes('S', intervalS, initialDelayS, maxRepeatsS), initialDelayS);
    setTimeout(() => createRepeatedNotes(' ', intervalSpace, initialDelaySpace, maxRepeatsSpace), initialDelaySpace);

    const startTime = Date.now();
    progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const percentage = (elapsed / musicDuration) * 100;
        progressBar.style.width = percentage + '%';
        timeLabel.textContent = `${Math.floor(elapsed / 1000)}s / 89s`;
    }, 100);

    setTimeout(endGame, musicDuration);
}

function createNoteElement(key) {
    const lane = document.getElementById(`lane-${key === ' ' ? 'space' : key.toLowerCase()}`);
    const note = document.createElement('div');
    note.classList.add('note');
    lane.appendChild(note);
    noteElements.push(note);

    let position = 0;
    const interval = setInterval(() => {
        position += 2;
        note.style.top = position + 'px';
        if (position > 350) {
            clearInterval(interval);
            lane.removeChild(note);
            noteElements = noteElements.filter(n => n !== note);
            combo = 0;
            comboDisplay.textContent = 'Combo: 0';
        }
    }, 20);
}

function createRepeatedNotes(key, interval, initialDelay, maxRepeats) {
    let repeatCount = 0;
    const intervalId = setInterval(() => {
        if (repeatCount >= maxRepeats) {
            clearInterval(intervalId);
        } else {
            createNoteElement(key);
            repeatCount++;
        }
    }, interval);
}

document.addEventListener('keydown', event => {
    const key = event.key.toUpperCase();
    if (sounds[key]) {
        sounds[key].currentTime = 0;
        sounds[key].play();

        const lane = document.getElementById(`lane-${key === ' ' ? 'space' : key.toLowerCase()}`);
        const timingIcon = lane.querySelector('.timing-icon');
        const timingIconRect = timingIcon.getBoundingClientRect();
        
        noteElements.forEach(note => {
            const noteRect = note.getBoundingClientRect();
            if (
                noteRect.bottom > timingIconRect.top &&
                noteRect.top < timingIconRect.bottom &&
                noteRect.left < timingIconRect.right &&
                noteRect.right > timingIconRect.left
            ) {
                score += Math.floor(100 * (combo > 0 ? 1.1 : 1));
                combo++;
                scoreDisplay.textContent = 'Score: ' + score;
                comboDisplay.textContent = 'Combo: ' + combo;
                note.remove();
                noteElements = noteElements.filter(n => n !== note);
                showOkText(timingIcon);
            }
        });
    }
});

function showOkText(timingIcon) {
    const okText = document.createElement('div');
    okText.textContent = 'OK';
    okText.classList.add('ok-text');
    timingIcon.appendChild(okText);
    setTimeout(() => okText.remove(), 500);
}

function endGame() {
    mainMusic.pause();
    mainMusic.currentTime = 0;
    startButton.classList.remove('hidden');
    finalScoreText.textContent = 'Final Score: ' + score;
    finalScorePopup.classList.remove('hidden');
    clearInterval(progressInterval);
}
