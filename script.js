const SUBTESTS = [
    {
        id: "ppu",
        shortLabel: "PPU",
        label: "Pengetahuan dan Pemahaman Umum",
        questions: 20,
        minScore: 159.87,
        maxScore: 875.92,
        icon: "book-open-text"
    },
    {
        id: "pu",
        shortLabel: "PU",
        label: "Penalaran Umum",
        questions: 30,
        minScore: 131.21,
        maxScore: 886.12,
        icon: "brain"
    },
    {
        id: "pbm",
        shortLabel: "PBM",
        label: "Pemahaman Bacaan dan Menulis",
        questions: 20,
        minScore: 160.53,
        maxScore: 857.13,
        icon: "note-pencil"
    },
    {
        id: "pk",
        shortLabel: "PK",
        label: "Pengetahuan Kuantitatif",
        questions: 20,
        minScore: 192.0,
        maxScore: 1000.0,
        icon: "math-operations"
    },
    {
        id: "lbi",
        shortLabel: "LBI",
        label: "Literasi Bahasa Indonesia",
        questions: 30,
        minScore: 126.31,
        maxScore: 870.76,
        icon: "text-aa"
    },
    {
        id: "pm",
        shortLabel: "PM",
        label: "Penalaran Matematika",
        questions: 20,
        minScore: 242.38,
        maxScore: 1000.0,
        icon: "function"
    },
    {
        id: "lbe",
        shortLabel: "LBE",
        label: "Literasi Bahasa Inggris",
        questions: 20,
        minScore: 233.76,
        maxScore: 885.75,
        icon: "translate"
    }
];

const SUBTEST_MAP = Object.fromEntries(SUBTESTS.map((subtest) => [subtest.id, subtest]));
const THEME_KEY = "theme";
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let scoreChart = null;
let currentChartType = "bar";
let lastCalculatedScores = null;

document.addEventListener("DOMContentLoaded", () => {
    const elements = {
        averageScore: document.getElementById("averageScore"),
        bestScore: document.getElementById("bestScore"),
        bestSubtest: document.getElementById("bestSubtest"),
        filledCount: document.getElementById("filledCount"),
        liveRegion: document.getElementById("live-region"),
        progressFill: document.getElementById("scoreProgress"),
        progressMeter: document.querySelector(".progress-meter"),
        progressPercentage: document.getElementById("progressPercentage"),
        resetButton: document.getElementById("reset-btn"),
        resultsPanel: document.getElementById("result"),
        scoreChart: document.getElementById("scoreChart"),
        scoreForm: document.getElementById("score-form"),
        scoresGrid: document.getElementById("scores"),
        subtestGrid: document.getElementById("subtest-grid"),
        summaryBand: document.getElementById("summaryBand"),
        themeColor: document.querySelector('meta[name="theme-color"]'),
        themeToggle: document.getElementById("theme-toggle")
    };

    renderSubtestCards(elements.subtestGrid);
    bindInputValidation(elements.subtestGrid);
    bindStepperButtons(elements.subtestGrid);
    bindActions(elements);
    initializeTheme(elements);
    updateChartSwitchButtons();
    registerServiceWorker();
});

function renderSubtestCards(container) {
    container.innerHTML = SUBTESTS.map((subtest) => {
        return `
            <article class="subject-card">
                <div class="subject-card__head">
                    <div class="subject-card__identity">
                        <span class="subject-card__icon" aria-hidden="true">
                            ${createIcon(subtest.icon)}
                        </span>
                        <div class="subject-card__title-wrap">
                            <strong class="subject-card__code">${subtest.shortLabel}</strong>
                            <span class="subject-card__name">${subtest.label}</span>
                        </div>
                    </div>
                    <span class="subject-card__count">${subtest.questions} Soal</span>
                </div>

                <div class="field-wrap">
                    <label class="field-label" for="${subtest.id}">Jumlah benar</label>
                    <div class="stepper">
                        <button class="stepper__btn" type="button" data-target="${subtest.id}" data-delta="-1" aria-label="Kurangi satu">&#8722;</button>
                        <input
                            id="${subtest.id}"
                            class="field-input stepper__input"
                            type="number"
                            name="${subtest.id}"
                            min="0"
                            max="${subtest.questions}"
                            step="1"
                            inputmode="numeric"
                            autocomplete="off"
                            placeholder="0"
                            aria-describedby="${subtest.id}-hint ${subtest.id}-error"
                        >
                        <button class="stepper__btn" type="button" data-target="${subtest.id}" data-delta="1" aria-label="Tambah satu">+</button>
                    </div>
                    <p id="${subtest.id}-hint" class="field-hint">Rentang 0 sampai ${subtest.questions}.</p>
                    <p id="${subtest.id}-error" class="field-error" aria-live="polite"></p>
                </div>
            </article>
        `;
    }).join("");
}

function bindStepperButtons(container) {
    container.querySelectorAll(".stepper__btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const input = document.getElementById(btn.dataset.target);
            const delta = Number(btn.dataset.delta);
            const current = input.value.trim() === "" ? 0 : Number(input.value);
            const next = Math.min(Number(input.max), Math.max(Number(input.min), current + delta));
            input.value = next;
            validateField(input);
        });
    });
}

function bindInputValidation(container) {
    container.querySelectorAll(".field-input").forEach((input) => {
        input.addEventListener("input", () => {
            if (input.value.trim() === "") {
                clearFieldError(input);
                return;
            }

            validateField(input);
        });

        input.addEventListener("blur", () => {
            if (input.value.trim() === "") {
                clearFieldError(input);
                return;
            }

            validateField(input);
        });
    });
}

function bindActions(elements) {
    elements.scoreForm.addEventListener("submit", (event) => {
        event.preventDefault();
        calculateScore(elements);
    });

    elements.resetButton.addEventListener("click", () => {
        resetCalculator(elements);
    });

    elements.themeToggle.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
        const nextTheme = currentTheme === "dark" ? "light" : "dark";
        localStorage.setItem(THEME_KEY, nextTheme);
        applyTheme(nextTheme, elements);

        if (lastCalculatedScores) {
            createVisualization(lastCalculatedScores, elements.scoreChart);
        }
    });

    document.querySelectorAll("[data-chart-type]").forEach((button) => {
        button.addEventListener("click", () => {
            const nextType = button.dataset.chartType;

            if (nextType === currentChartType) {
                return;
            }

            currentChartType = nextType;
            updateChartSwitchButtons();

            if (lastCalculatedScores) {
                createVisualization(lastCalculatedScores, elements.scoreChart);
                announce(elements.liveRegion, `Grafik ${nextType === "bar" ? "bar" : "radar"} aktif.`);
            }
        });
    });
}

function initializeTheme(elements) {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const initialTheme = savedTheme || (prefersDarkScheme.matches ? "dark" : "light");
    applyTheme(initialTheme, elements);

    if (typeof prefersDarkScheme.addEventListener === "function") {
        prefersDarkScheme.addEventListener("change", (event) => {
            if (localStorage.getItem(THEME_KEY)) {
                return;
            }

            applyTheme(event.matches ? "dark" : "light", elements);

            if (lastCalculatedScores) {
                createVisualization(lastCalculatedScores, elements.scoreChart);
            }
        });
    }
}

function applyTheme(theme, elements) {
    const isDark = theme === "dark";
    const iconUse = elements.themeToggle.querySelector("use");

    document.documentElement.setAttribute("data-theme", theme);
    elements.themeColor.setAttribute("content", isDark ? "#0f1b20" : "#f5f7f4");
    elements.themeToggle.setAttribute("aria-label", isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap");
    elements.themeToggle.setAttribute("title", isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap");
    iconUse.setAttribute("href", isDark ? "#icon-sun" : "#icon-moon-stars");
}

function calculateScore(elements) {
    clearAllErrors();

    let totalScore = 0;
    let filledCount = 0;
    let firstInvalidInput = null;
    const calculatedScores = {};

    for (const subtest of SUBTESTS) {
        const input = document.getElementById(subtest.id);
        const validation = validateField(input);

        if (!validation.valid) {
            if (!firstInvalidInput) {
                firstInvalidInput = input;
            }
            continue;
        }

        const correctAnswers = validation.value;
        const scoreRange = subtest.maxScore - subtest.minScore;
        const score = subtest.minScore + (correctAnswers / subtest.questions) * scoreRange;

        if (input.value.trim() !== "") {
            filledCount += 1;
        }

        calculatedScores[subtest.id] = {
            ...subtest,
            correctAnswers,
            score
        };

        totalScore += score;
    }

    if (firstInvalidInput) {
        announce(elements.liveRegion, "Periksa kembali nilai yang belum valid.");
        firstInvalidInput.focus();
        return;
    }

    const averageScore = totalScore / SUBTESTS.length;
    lastCalculatedScores = calculatedScores;

    renderResults(calculatedScores, averageScore, filledCount, elements);
    showResults(elements.resultsPanel, elements.progressFill, elements.progressMeter);
    createVisualization(calculatedScores, elements.scoreChart);
    announce(elements.liveRegion, `Perhitungan selesai. Rata-rata skor ${averageScore.toFixed(2)}.`);
}

function renderResults(scores, averageScore, filledCount, elements) {
    const entries = Object.values(scores);
    const highest = entries.reduce((best, current) => current.score > best.score ? current : best, entries[0]);
    const progress = (averageScore / 1000) * 100;

    elements.scoresGrid.innerHTML = entries.map((entry) => {
        const ratio = entry.score / entry.maxScore;

        return `
            <article class="score-card">
                <div class="score-card__top">
                    <div class="score-card__identity">
                        <span class="score-card__icon" aria-hidden="true">
                            ${createIcon(entry.icon)}
                        </span>
                        <div>
                            <strong class="score-card__code">${entry.shortLabel}</strong>
                            <span class="score-card__name">${entry.label}</span>
                        </div>
                    </div>

                    <div class="score-card__reading">
                        <strong class="score-card__value">${entry.score.toFixed(2)}</strong>
                        <span class="score-card__metric">${entry.correctAnswers}/${entry.questions} benar</span>
                    </div>
                </div>

                <div class="score-card__meta">
                    <span>Maks. ${entry.maxScore.toFixed(2)}</span>
                    <span>${(ratio * 100).toFixed(1)}%</span>
                </div>

                <div class="mini-progress" aria-hidden="true">
                    <div class="mini-progress__fill" style="--fill: ${ratio};"></div>
                </div>
            </article>
        `;
    }).join("");

    elements.averageScore.textContent = averageScore.toFixed(2);
    elements.filledCount.textContent = `${filledCount}/${SUBTESTS.length}`;
    elements.bestSubtest.textContent = highest.shortLabel;
    elements.bestScore.textContent = highest.score.toFixed(2);
    elements.summaryBand.textContent = `Terbaik: ${highest.shortLabel}`;
    elements.progressPercentage.textContent = `${progress.toFixed(1)}%`;
    elements.progressMeter.setAttribute("aria-valuenow", progress.toFixed(1));
    elements.progressFill.style.setProperty("--fill", "0");
    elements.progressFill.dataset.progress = String(progress / 100);
}

function showResults(resultsPanel, progressFill, progressMeter) {
    resultsPanel.hidden = false;

    const applyProgress = () => {
        const progress = progressFill.dataset.progress || "0";
        progressFill.style.setProperty("--fill", progress);
        progressMeter.setAttribute("aria-valuenow", (Number(progress) * 100).toFixed(1));
    };

    if (prefersReducedMotion.matches) {
        applyProgress();
        resultsPanel.scrollIntoView({ block: "start" });
        return;
    }

    requestAnimationFrame(() => {
        requestAnimationFrame(applyProgress);
    });

    resultsPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetCalculator(elements) {
    elements.scoreForm.reset();
    clearAllErrors();

    lastCalculatedScores = null;
    currentChartType = "bar";
    updateChartSwitchButtons();

    elements.resultsPanel.hidden = true;
    elements.scoresGrid.innerHTML = "";
    elements.progressFill.style.setProperty("--fill", "0");
    elements.progressMeter.setAttribute("aria-valuenow", "0");
    elements.progressPercentage.textContent = "0.0%";
    elements.averageScore.textContent = "0.00";
    elements.bestSubtest.textContent = "-";
    elements.bestScore.textContent = "0.00";
    elements.filledCount.textContent = `0/${SUBTESTS.length}`;
    elements.summaryBand.textContent = "Rata-rata skor";

    if (scoreChart) {
        scoreChart.destroy();
        scoreChart = null;
    }

    announce(elements.liveRegion, "Formulir direset.");
    document.getElementById(SUBTESTS[0].id).focus();
}

function validateField(input) {
    const subtest = SUBTEST_MAP[input.id];
    const rawValue = input.value.trim();

    if (rawValue === "") {
        clearFieldError(input);
        return { valid: true, value: 0 };
    }

    const numericValue = Number(rawValue);

    if (!Number.isFinite(numericValue) || !Number.isInteger(numericValue)) {
        showFieldError(input, `Gunakan angka bulat untuk ${subtest.shortLabel}.`);
        return { valid: false, value: 0 };
    }

    if (numericValue < 0 || numericValue > subtest.questions) {
        showFieldError(input, `Masukkan nilai antara 0 sampai ${subtest.questions} untuk ${subtest.shortLabel}.`);
        return { valid: false, value: 0 };
    }

    clearFieldError(input);
    return { valid: true, value: numericValue };
}

function showFieldError(input, message) {
    const errorElement = document.getElementById(`${input.id}-error`);
    errorElement.textContent = message;
    input.setAttribute("aria-invalid", "true");
}

function clearFieldError(input) {
    const errorElement = document.getElementById(`${input.id}-error`);
    errorElement.textContent = "";
    input.removeAttribute("aria-invalid");
}

function clearAllErrors() {
    document.querySelectorAll(".field-input").forEach((input) => {
        clearFieldError(input);
    });
}

function createVisualization(scores, canvas) {
    if (!canvas || typeof Chart === "undefined" || !scores) {
        return;
    }

    const labels = SUBTESTS.map((subtest) => subtest.shortLabel);
    const userScores = SUBTESTS.map((subtest) => scores[subtest.id].score);
    const maxScores = SUBTESTS.map((subtest) => scores[subtest.id].maxScore);

    if (scoreChart) {
        scoreChart.destroy();
    }

    const primary = getCssVar("--primary");
    const accent = getCssVar("--accent");
    const text = getCssVar("--text");
    const mutedText = getCssVar("--muted-text");
    const border = hexToRgba(getCssVar("--border"), 0.82);
    const surface = getCssVar("--surface");

    Chart.defaults.font.family = '"Plus Jakarta Sans", "Segoe UI", sans-serif';
    Chart.defaults.color = text;

    scoreChart = new Chart(canvas.getContext("2d"), {
        type: currentChartType,
        data: {
            labels,
            datasets: [
                {
                    label: "Skor kamu",
                    data: userScores,
                    borderColor: primary,
                    backgroundColor: hexToRgba(primary, currentChartType === "radar" ? 0.18 : 0.3),
                    pointBackgroundColor: primary,
                    pointBorderColor: surface,
                    pointHoverBackgroundColor: surface,
                    pointHoverBorderColor: primary,
                    borderWidth: 2,
                    borderRadius: 10,
                    fill: currentChartType === "radar"
                },
                {
                    label: "Skor maksimum",
                    data: maxScores,
                    borderColor: accent,
                    backgroundColor: hexToRgba(accent, currentChartType === "radar" ? 0.16 : 0.24),
                    pointBackgroundColor: accent,
                    pointBorderColor: surface,
                    pointHoverBackgroundColor: surface,
                    pointHoverBorderColor: accent,
                    borderWidth: 2,
                    borderRadius: 10,
                    fill: currentChartType === "radar"
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: "index",
                intersect: false
            },
            elements: {
                line: {
                    tension: 0.18
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: mutedText
                    },
                    grid: {
                        color: border
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: mutedText
                    },
                    grid: {
                        color: border
                    }
                },
                r: {
                    beginAtZero: true,
                    suggestedMax: 1000,
                    angleLines: {
                        color: border
                    },
                    grid: {
                        color: border
                    },
                    pointLabels: {
                        color: text
                    },
                    ticks: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: text,
                        usePointStyle: true,
                        boxWidth: 10,
                        boxHeight: 10
                    }
                },
                tooltip: {
                    backgroundColor: surface,
                    titleColor: text,
                    bodyColor: mutedText,
                    borderColor: hexToRgba(primary, 0.18),
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true
                }
            }
        }
    });
}

function updateChartSwitchButtons() {
    document.querySelectorAll("[data-chart-type]").forEach((button) => {
        const isActive = button.dataset.chartType === currentChartType;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });
}

function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
        return;
    }

    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js").catch((error) => {
            console.error("Service worker registration failed:", error);
        });
    });
}

function announce(liveRegion, message) {
    liveRegion.textContent = "";
    window.setTimeout(() => {
        liveRegion.textContent = message;
    }, 30);
}

function createIcon(name) {
    return `
        <svg class="icon" viewBox="0 0 256 256" aria-hidden="true" focusable="false">
            <use href="#icon-${name}"></use>
        </svg>
    `;
}

function getCssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function hexToRgba(hex, alpha) {
    const value = hex.replace("#", "");
    const normalized = value.length === 3
        ? value.split("").map((char) => char + char).join("")
        : value;
    const numeric = Number.parseInt(normalized, 16);

    const red = (numeric >> 16) & 255;
    const green = (numeric >> 8) & 255;
    const blue = numeric & 255;

    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
