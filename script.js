// عناصر صفحة التركيز
const focusPage = document.getElementById('focus-page');
const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const stopBtn = document.getElementById('stop-btn');
const resetBtn = document.getElementById('reset-btn'); // زر إعادة الضبط في أعلى الشمال

// عناصر صفحة البريك
const breakPage = document.getElementById('break-page');
const breakTimerDisplay = document.getElementById('break-timer');
const finishBreakBtn = document.getElementById('finish-break-btn');

// عناصر الإعدادات والـ Pop-up
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const breakRatioSelect = document.getElementById('break-ratio-select');
const breakExample = document.getElementById('break-example');

// إضافة زر الإيقاف المؤقت/الاستئناف للبريك برمجياً
const breakControls = document.querySelector('#break-page .controls');
const breakPauseBtn = document.createElement('button');
breakPauseBtn.id = 'break-pause-btn';
breakPauseBtn.textContent = 'PAUSE';
breakPauseBtn.style.marginRight = '10px';
breakControls.insertBefore(breakPauseBtn, finishBreakBtn);

// المتغيرات الخاصة بالعمل
let timerInterval = null;
let totalMilliseconds = 0;
let startTime = 0;
let isPaused = false;

// المتغيرات الخاصة بالبريك والإعدادات
let breakInterval = null;
let breakSeconds = 0;
let isBreakPaused = false;
let currentBreakRatio = parseFloat(breakRatioSelect.value); // القيمة الافتراضية للنسبة (20% أو غيرها)

// تحديث نص المثال بشكل نظيف بدون معادلة طويلة
function updateBreakExample() {
    let sampleWorkMinutes = 60; // ساعة كاملة
    let calculatedBreak = sampleWorkMinutes * currentBreakRatio;
    breakExample.textContent = `break time for an hour = ${calculatedBreak} minutes`;
}

// تنفيذ الدالة عند بدء التشغيل
updateBreakExample();

// تغيير النسبة عند اختيارها من القائمة المنسدلة
breakRatioSelect.addEventListener('change', function() {
    currentBreakRatio = parseFloat(this.value);
    updateBreakExample();
});

// فتح نافذة الإعدادات المنبثقة
settingsBtn.addEventListener('click', function() {
    settingsModal.style.display = 'flex';
});

// إغلاق نافذة الإعدادات
closeSettingsBtn.addEventListener('click', function() {
    settingsModal.style.display = 'none';
});

// دالة إصدار صوت التنبيه عند انتهاء البريك
function playAlertSound() {
    let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    let oscillator = audioCtx.createOscillator();
    let gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = 587.33;
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);
}

// دالة تنسيق وقت العمل (ساعات:دقائق:ثواني:أجزاء من الثانية)
function formatTime(totalMs) {
    let hrs = Math.floor(totalMs / 3600000);
    let mins = Math.floor((totalMs % 3600000) / 60000);
    let secs = Math.floor((totalMs % 60000) / 1000);
    let ms = Math.floor((totalMs % 1000) / 10);

    let formattedHrs = hrs < 10 ? "0" + hrs : hrs;
    let formattedMins = mins < 10 ? "0" + mins : mins;
    let formattedSecs = secs < 10 ? "0" + secs : secs;
    let formattedMs = ms < 10 ? "0" + ms : ms;

    return `${formattedHrs}:${formattedMins}:${formattedSecs}:${formattedMs}`;
}

// دالة تنسيق وقت البريك بالثواني العادية (ساعات:دقائق:ثواني)
function formatBreakTime(totalSecs) {
    let hrs = Math.floor(totalSecs / 3600);
    let mins = Math.floor((totalSecs % 3600) / 60);
    let secs = totalSecs % 60;

    let formattedHrs = hrs < 10 ? "0" + hrs : hrs;
    let formattedMins = mins < 10 ? "0" + mins : mins;
    let formattedSecs = secs < 10 ? "0" + secs : secs;

    return `${formattedHrs}:${formattedMins}:${formattedSecs}`;
}

// دالة التنقل بين الصفحات
function showPage(pageToShow) {
    if (pageToShow === 'break') {
        focusPage.style.display = 'none';
        breakPage.style.display = 'block';
    } else {
        breakPage.style.display = 'none';
        focusPage.style.display = 'block';
    }
}

// زر البدء للعمل
startBtn.addEventListener('click', function() {
    startBtn.style.display = 'none';
    pauseBtn.style.display = 'inline-block';
    stopBtn.style.display = 'inline-block';
    
    startTime = Date.now() - totalMilliseconds;
    
    timerInterval = setInterval(() => {
        totalMilliseconds = Date.now() - startTime;
        timerDisplay.textContent = formatTime(totalMilliseconds);
    }, 10);
});

// زر الإيقاف المؤقت/الاستئناف للعمل
pauseBtn.addEventListener('click', function() {
    if (!isPaused) {
        clearInterval(timerInterval);
        pauseBtn.textContent = 'RESUME';
        isPaused = true;
    } else {
        startTime = Date.now() - totalMilliseconds;
        
        timerInterval = setInterval(() => {
            totalMilliseconds = Date.now() - startTime;
            timerDisplay.textContent = formatTime(totalMilliseconds);
        }, 10);
        
        pauseBtn.textContent = 'PAUSE';
        stopBtn.style.display = 'inline-block';
        isPaused = false;
    }
});

// زر إعادة الضبط العام (Reset)
resetBtn.addEventListener('click', function() {
    if (confirm("Are you sure you want to reset the timer?")) {
        clearInterval(timerInterval);
        clearInterval(breakInterval);
        resetToFocusPage();
    }
});

// حساب وقت البريك بناءً على النسبة المختارة في الإعدادات (مثلاً 20% أو غيرها)
function calculateBreak(workMinutes) {
    return Math.round(workMinutes * currentBreakRatio);
}

// زر الانتقال للبريك (STOP)
stopBtn.addEventListener('click', function() {
    let workMinutes = Math.floor(totalMilliseconds / 60000);

    if (workMinutes < 5) {
        alert(`You worked for less than 5 minutes (${workMinutes} min). Keep focusing a bit longer!`);
        return;
    }

    clearInterval(timerInterval);

    let breakMinutes = calculateBreak(workMinutes);
    breakSeconds = breakMinutes * 60;
    isBreakPaused = false;
    breakPauseBtn.textContent = 'PAUSE';

    showPage('break');
    startBreakTimer();
});

// دالة تشغيل العداد التنازلي للبريك (بالثواني العادية)
function startBreakTimer() {
    breakTimerDisplay.textContent = formatBreakTime(breakSeconds);

    breakInterval = setInterval(() => {
        if (breakSeconds > 0) {
            breakSeconds--;
            breakTimerDisplay.textContent = formatBreakTime(breakSeconds);
        } else {
            clearInterval(breakInterval);
            breakTimerDisplay.textContent = "00:00:00";
            playAlertSound(); // تشغيل صوت التنبيه فور انتهاء البريك
            alert("Break is over! Time to focus again.");
            resetToFocusPage();
        }
    }, 1000);
}

// زر الإيقاف المؤقت/الاستئناف للبريك (Break Pause)
breakPauseBtn.addEventListener('click', function() {
    if (!isBreakPaused) {
        clearInterval(breakInterval);
        breakPauseBtn.textContent = 'RESUME';
        isBreakPaused = true;
    } else {
        startBreakTimer();
        breakPauseBtn.textContent = 'PAUSE';
        isBreakPaused = false;
    }
});

// زر إنهاء البريك يدوياً
finishBreakBtn.addEventListener('click', function() {
    if (confirm("Are you sure you want to end your break early?")) {
        clearInterval(breakInterval);
        resetToFocusPage();
    }
});

// إعادة الضبط والعودة للواجهة الرئيسية
function resetToFocusPage() {
    totalMilliseconds = 0;
    isPaused = false;
    isBreakPaused = false;
    timerDisplay.textContent = "00:00:00:00";

    pauseBtn.textContent = 'PAUSE';
    breakPauseBtn.textContent = 'PAUSE';
    pauseBtn.style.display = 'none';
    stopBtn.style.display = 'none';
    startBtn.style.display = 'inline-block';

    showPage('focus');
}
// تسجيل الـ Service Worker لتفعيل الـ PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/Focus/sw.js')
      .then((reg) => console.log('Service Worker Registered!', reg))
      .catch((err) => console.log('Service Worker Registration Failed!', err));
  });
}