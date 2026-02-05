document.addEventListener('DOMContentLoaded', () => {
    // Theme Handling
    const toggleButton = document.getElementById('theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    // Check for saved user preference, if any, on load of the website
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme == 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        toggleButton.innerHTML = '<i class="fas fa-sun"></i>';
    } else if (currentTheme == 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        toggleButton.innerHTML = '<i class="fas fa-moon"></i>';
    } else if (prefersDarkScheme.matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
        toggleButton.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        // Default to light
        document.documentElement.setAttribute('data-theme', 'light');
        toggleButton.innerHTML = '<i class="fas fa-moon"></i>';
    }

    toggleButton.addEventListener('click', function() {
        let theme = 'light';
        const current = document.documentElement.getAttribute('data-theme');

        if (current === 'light' || !current) {
            theme = 'dark';
            document.documentElement.setAttribute('data-theme', 'dark');
            this.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            this.innerHTML = '<i class="fas fa-moon"></i>';
        }
        localStorage.setItem('theme', theme);

        // Update chart if it exists
        if (window.scoreChart) {
            window.scoreChart.destroy();
            createVisualization(window.lastCalculatedScores);
        }
    });

    // Reset Button
    const resetButton = document.getElementById('reset-btn');
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            document.querySelectorAll('input[type="number"]').forEach(input => {
                input.value = '';
            });
            document.getElementById('result').classList.add('d-none');
            document.getElementById('visualization').classList.add('d-none');
            window.lastCalculatedScores = null;
        });
    }
});

// Global variable for the chart
window.scoreChart = null;
window.currentChartType = 'bar';
window.lastCalculatedScores = null;

function calculateScore() {
    const subtests = {
        ppu: { maxQuestions: 20, maxScore: 875.92, minScore: 159.87, label: "Pengetahuan dan Pemahaman Umum" },
        pu: { maxQuestions: 30, maxScore: 886.12, minScore: 131.21, label: "Penalaran Umum" },
        pbm: { maxQuestions: 20, maxScore: 857.13, minScore: 160.53, label: "Pemahaman Bacaan dan Menulis" },
        pk: { maxQuestions: 20, maxScore: 1000.0, minScore: 192.00, label: "Pengetahuan Kuantitatif" },
        lbi: { maxQuestions: 30, maxScore: 870.76, minScore: 126.31, label: "Literasi Bahasa Indonesia" },
        pm: { maxQuestions: 20, maxScore: 1000.0, minScore: 242.38, label: "Penalaran Matematika" },
        lbe: { maxQuestions: 20, maxScore: 885.75, minScore: 233.76, label: "Literasi Bahasa Inggris" }
    };

    let totalScore = 0;
    let valid = true;
    let scoresHTML = "";

    // Array to store calculated scores for visualization
    let calculatedScores = {};

    for (const [key, data] of Object.entries(subtests)) {
        const inputElement = document.getElementById(key);
        const correctAnswers = parseInt(inputElement.value) || 0;

        if (correctAnswers < 0 || correctAnswers > data.maxQuestions) {
            alert(`Nilai untuk ${key.toUpperCase()} harus antara 0 dan ${data.maxQuestions}.`);
            valid = false;
            inputElement.focus();
            break;
        }

        const scoreRange = data.maxScore - data.minScore;
        const score = data.minScore + (correctAnswers / data.maxQuestions) * scoreRange;

        // Store the calculated score for visualization
        calculatedScores[key] = {
            score: score,
            maxScore: data.maxScore,
            label: data.label
        };

        scoresHTML += `
            <div class="col-12 col-md-6">
                <div class="input-card p-3">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-0">${key.toUpperCase()}</h6>
                            <small class="text-muted">${data.label}</small>
                            <br>
                            <small class="text-muted">Max: ${data.maxScore.toFixed(2)}</small>
                        </div>
                        <div class="text-primary fw-bold">${score.toFixed(2)}</div>
                    </div>
                    <div class="progress progress-custom mt-2">
                        <div class="progress-bar bg-primary"
                             style="width: ${(score/data.maxScore)*100}%\"></div>
                    </div>
                </div>
            </div>
        `;
        totalScore += score;
    }

    if (!valid) return;

    window.lastCalculatedScores = calculatedScores;

    const averageScore = totalScore / Object.keys(subtests).length;
    const resultDiv = document.getElementById("result");

    // Update results
    document.getElementById("scores").innerHTML = scoresHTML;
    document.getElementById("averageScore").textContent = averageScore.toFixed(2);

    // Update progress bar
    const maxPossible = 1000; // Assuming max possible average score
    const progress = (averageScore/maxPossible)*100;
    document.getElementById("scoreProgress").style.width = `${progress}%`;
    document.getElementById("progressPercentage").textContent = `${progress.toFixed(1)}%`;

    // Show result section
    resultDiv.classList.remove('d-none');

    // Generate visualization
    createVisualization(calculatedScores);

    // Scroll to results
    resultDiv.scrollIntoView({ behavior: 'smooth' });
}

function createVisualization(scores) {
    if (!scores) return;

    const visualizationDiv = document.getElementById("visualization");
    visualizationDiv.classList.remove('d-none');

    const ctx = document.getElementById('scoreChart').getContext('2d');

    // Extract labels and data from scores
    const labels = Object.keys(scores).map(key => key.toUpperCase());
    const userScores = Object.values(scores).map(item => item.score);
    const maxScores = Object.values(scores).map(item => item.maxScore);

    // If chart already exists, destroy it
    if (window.scoreChart) {
        window.scoreChart.destroy();
    }

    // Get color settings based on theme
    const theme = document.documentElement.getAttribute('data-theme');
    const isDarkMode = theme === 'dark';

    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textColor = isDarkMode ? '#e9ecef' : '#212529';

    // Create chart
    window.scoreChart = new Chart(ctx, {
        type: window.currentChartType,
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Skor Anda',
                    data: userScores,
                    backgroundColor: 'rgba(67, 97, 238, 0.5)',
                    borderColor: 'rgba(67, 97, 238, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(67, 97, 238, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(67, 97, 238, 1)'
                },
                {
                    label: 'Skor Maksimum',
                    data: maxScores,
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(153, 102, 255, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(153, 102, 255, 1)'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: { // For radar chart
                    grid: {
                        color: gridColor
                    },
                    angleLines: {
                        color: gridColor
                    },
                    pointLabels: {
                        color: textColor
                    }
                },
                x: { // For bar chart
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        color: gridColor
                    }
                },
                y: { // For bar chart
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        color: gridColor
                    },
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            }
        }
    });
}

function changeChartType(type) {
    window.currentChartType = type;
    if (window.lastCalculatedScores) {
        createVisualization(window.lastCalculatedScores);
    }
}
