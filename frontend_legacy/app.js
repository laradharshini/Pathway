const API_URL = "http://localhost:5000";

// Global state
let currentProfile = null;
let globalData = null;
let socket = null; // WebSocket connection

// ========== ERROR BOUNDARIES ==========
window.addEventListener('unhandledrejection', function (event) {
    console.error('Unhandled promise rejection:', event.reason);
    showToast('An error occurred. Please try again.', 'warning');
});

window.addEventListener('error', function (event) {
    console.error('Global error:', event.error);
    // Don't show toast for every error to avoid spam, but log it
});

// ========== WEBSOCKET SETUP ==========
function initializeWebSocket() {
    // Load Socket.IO from CDN if not already loaded
    if (typeof io === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.socket.io/4.5.4/socket.io.min.js';
        script.onload = connectWebSocket;
        document.head.appendChild(script);
    } else {
        connectWebSocket();
    }
}

function connectWebSocket() {
    socket = io(API_URL, {
        transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
        console.log('✅ WebSocket connected');
        // Remove strictly "disconnected" toasts if any exist
        const disToast = document.querySelector('.toast-warning');
        if (disToast && disToast.innerText.includes('Disconnected')) disToast.remove();

        // showToast('Connected to real-time updates', 'success');

        // Join user-specific room
        const user = Auth.getUser();
        if (user) {
            socket.emit('join_user_room', { user_id: user.id });
        }
    });

    socket.on('disconnect', () => {
        console.log('❌ WebSocket disconnected');
        showToast('Disconnected. Attempting to reconnect...', 'warning');
    });

    socket.on('connect_error', (error) => {
        console.log('Connection error:', error);
    });

    socket.io.on("reconnect_attempt", () => {
        console.log("Reconnecting...");
    });

    socket.io.on("reconnect", () => {
        console.log("Reconnected!");
        showToast('Connection restored!', 'success');
    });

    socket.on('connection_response', (data) => {
        console.log('Connection response:', data);
    });

    socket.on('room_joined', (data) => {
        console.log('Joined room:', data.room);
    });

    // Real-time notifications
    socket.on('new_job_match', (data) => {
        console.log('New job match:', data);
        showJobMatchNotification(data);
        // Optionally refresh job list
        analyzeProfile();
    });

    socket.on('application_update', (data) => {
        console.log('Application update:', data);
        showToast(`Application status: ${data.status}`, 'info');
    });

    socket.on('skill_verified', (data) => {
        console.log('Skill verified:', data);
        showToast(data.message, 'success');
        loadUserProfile(); // Refresh profile
    });

    socket.on('resume_analyzed', (data) => {
        console.log('Resume analyzed:', data);
        showToast(data.message, 'info');
    });

    socket.on('profile_updated', (data) => {
        console.log('Profile updated:', data);
        showToast('Profile updated successfully', 'success');
    });

    // Keep-alive ping
    setInterval(() => {
        if (socket && socket.connected) {
            socket.emit('ping');
        }
    }, 30000); // Every 30 seconds
}

// ========== NOTIFICATION SYSTEM ==========
function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        width: auto;
        min-width: 280px;
        max-width: 350px;
        background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
        color: white;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
        display: flex;
        align-items: center;
        gap: 0.75rem;
    `;

    const icon = type === 'success' ? '✓' : type === 'warning' ? '⚠' : 'ℹ';
    toast.innerHTML = `
        <span style="font-size: 1.5rem;">${icon}</span>
        <span style="flex: 1;">${message}</span>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; padding: 0; line-height: 1;">&times;</button>
    `;

    document.body.appendChild(toast);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

function showJobMatchNotification(data) {
    const notification = document.createElement('div');
    notification.className = 'job-notification';
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 1000;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
    `;

    notification.innerHTML = `
        <div style="display: flex; align-items: start; gap: 1rem;">
            <div style="background: rgba(255,255,255,0.2); padding: 0.75rem; border-radius: 8px;">
                <i class="fa-solid fa-briefcase" style="font-size: 1.5rem;"></i>
            </div>
            <div style="flex: 1;">
                <div style="font-weight: 700; font-size: 1.1rem; margin-bottom: 0.25rem;">New Job Match!</div>
                <div style="font-size: 0.9rem; margin-bottom: 0.5rem; opacity: 0.9;">${data.job.title} at ${data.job.company}</div>
                <div style="font-size: 0.8rem; opacity: 0.8;">
                    <span style="background: rgba(255,255,255,0.3); padding: 0.25rem 0.5rem; border-radius: 4px;">
                        ${data.job.readiness_score}% Match
                    </span>
                </div>
                <button onclick="viewNewJob('${data.job.job_id}')" style="margin-top: 0.75rem; background: white; color: #667eea; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.875rem;">
                    View Details →
                </button>
            </div>
            <button onclick="this.closest('.job-notification').remove()" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; padding: 0; line-height: 1;">&times;</button>
        </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 10 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 10000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

function viewNewJob(jobId) {
    // Scroll to jobs section and highlight the job
    document.getElementById('jobs-container').scrollIntoView({ behavior: 'smooth' });
    // Optionally trigger job detail modal
    setTimeout(() => {
        const jobCard = document.querySelector(`[data-job-id="${jobId}"]`);
        if (jobCard) {
            jobCard.style.animation = 'pulse 1s ease-in-out 3';
            jobCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 500);
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', async () => {
    // Check auth
    if (!Auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    // Initialize WebSocket
    initializeWebSocket();

    // Load profile
    await loadUserProfile();
});

async function loadUserProfile() {
    try {
        const response = await fetchWithAuth(`${API_URL}/api/candidate/profile`);
        if (!response.ok) throw new Error("Failed to load profile");

        currentProfile = await response.json();

        // Render Sidebar
        renderSidebar(currentProfile);

        // Trigger Analysis for Dashboard
        analyzeProfile();

    } catch (e) {
        console.error("Profile load error:", e);
    }
}

// ========== ANALYZE PROFILE (DASHBOARD FEED) ==========
async function analyzeProfile() {
    try {
        // Only show loading if we don't have jobs yet
        const hero = document.getElementById('hero-card');
        if (hero && !hero.innerHTML.includes('readiness-ring')) {
            hero.innerHTML = '<div style="padding:2rem; text-align:center;"><i class="fa-solid fa-circle-notch fa-spin"></i> Analyzing market fit...</div>';
        }

        const response = await fetchWithAuth(`${API_URL}/api/analyze`, {
            method: 'POST',
            body: JSON.stringify({})
        });

        const data = await response.json();

        if (data.error) throw new Error(data.error);

        globalData = data;

        // Render Gaps
        if (data.analysis && data.analysis.missing_critical_skills) {
            const gaps = data.analysis.missing_critical_skills.map(skill => ({
                name: skill,
                percent: 85 // Mock percent for now as API might not return it
            }));
            renderGaps(gaps);
        }

        // Update Sidebar
        renderSidebar(currentProfile);

    } catch (err) {
        console.error("Analysis error:", err);
        showToast(`Analysis update failed: ${err.message}`, 'warning');
    }
}

// ========== NEW: SKILL ASSESSMENT LAUNCHER ==========
function launchSkillAssessment(skillName) {
    // Create modal for skill assessment
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'assessment-modal';

    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px;">
            <button class="modal-close" onclick="closeAssessmentModal()">×</button>
            <div id="assessment-container"></div>
        </div>
    `;

    document.body.appendChild(modal);

    // Load assessment component (simplified version)
    loadAssessmentQuestions(skillName);
}

function closeAssessmentModal() {
    const modal = document.getElementById('assessment-modal');
    if (modal) modal.remove();
}

async function loadAssessmentQuestions(skill) {
    const container = document.getElementById('assessment-container');

    // Sample questions (in production, fetch from API)
    const questions = [
        { question: `What is ${skill} primarily used for?`, options: ['A', 'B', 'C', 'D'], correct: 0 },
        { question: `Which of these is a key feature of ${skill}?`, options: ['X', 'Y', 'Z', 'W'], correct: 1 }
    ];

    let currentQ = 0;
    let answers = {};

    function renderQuestion() {
        const q = questions[currentQ];
        container.innerHTML = `
            <h2 style="margin-bottom: 2rem;">${skill} Assessment</h2>
            <div style="margin-bottom: 1rem;">Question ${currentQ + 1} of ${questions.length}</div>
            <div style="background: var(--bg-body); padding: 2rem; border-radius: 8px; margin-bottom: 2rem;">
                <h3 style="margin-bottom: 1rem;">${q.question}</h3>
                ${q.options.map((opt, i) => `
                    <label style="display: block; padding: 1rem; margin-bottom: 0.5rem; border: 1px solid var(--border); border-radius: 6px; cursor: pointer;">
                        <input type="radio" name="answer" value="${i}" ${answers[currentQ] === i ? 'checked' : ''}> ${opt}
                    </label>
                `).join('')}
            </div>
            <div style="display: flex; justify-content: space-between;">
                <button onclick="prevQuestion()" ${currentQ === 0 ? 'disabled' : ''} class="btn btn-outline">Previous</button>
                ${currentQ === questions.length - 1
                ? '<button onclick="submitAssessment()" class="btn btn-primary">Submit</button>'
                : '<button onclick="nextQuestion()" class="btn btn-primary">Next</button>'}
            </div>
        `;

        // Add event listeners
        document.querySelectorAll('input[name="answer"]').forEach(input => {
            input.addEventListener('change', (e) => {
                answers[currentQ] = parseInt(e.target.value);
            });
        });
    }

    window.nextQuestion = () => {
        if (currentQ < questions.length - 1) {
            currentQ++;
            renderQuestion();
        }
    };

    window.prevQuestion = () => {
        if (currentQ > 0) {
            currentQ--;
            renderQuestion();
        }
    };

    window.submitAssessment = async () => {
        let correct = 0;
        questions.forEach((q, i) => {
            if (answers[i] === q.correct) correct++;
        });
        const score = Math.round((correct / questions.length) * 100);

        // Submit to backend
        await fetchWithAuth(`${API_URL}/api/candidate/assessment`, {
            method: 'POST',
            body: JSON.stringify({
                skill: skill,
                score: score,
                answers: answers,
                time_taken: 120
            })
        });

        container.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <div style="font-size: 4rem; color: var(--success); margin-bottom: 1rem;">✓</div>
                <h2>Assessment Complete!</h2>
                <div style="font-size: 3rem; font-weight: 700; color: var(--primary); margin: 1rem 0;">${score}%</div>
                <p style="color: var(--text-sub); margin-bottom: 2rem;">
                    ${score >= 80 ? 'Excellent! Advanced level' : score >= 60 ? 'Good! Intermediate level' : 'Keep learning! Beginner level'}
                </p>
                <button onclick="closeAssessmentModal()" class="btn btn-primary">Done</button>
            </div>
        `;
    };

    renderQuestion();
}

// ========== NEW: AI RESUME ANALYZER ==========
function openResumeAnalyzer() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'resume-analyzer-modal';

    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" onclick="document.getElementById('resume-analyzer-modal').remove()">×</button>
            <h2 style="margin-bottom: 1.5rem;">AI Resume Analyzer</h2>
            
            <div style="background: var(--bg-body); padding: 2rem; border-radius: 12px; text-align: center; margin-bottom: 2rem; border: 2px dashed var(--border);">
                <i class="fa-solid fa-file-upload" style="font-size: 3rem; color: var(--primary); margin-bottom: 1rem;"></i>
                <p style="margin-bottom: 1rem;">Upload your resume for AI-powered analysis</p>
                <input type="file" id="resume-file" accept=".pdf,.docx" style="display: none;" onchange="analyzeResume()">
                <button onclick="document.getElementById('resume-file').click()" class="btn btn-primary">
                    Choose File
                </button>
            </div>
            
            <div id="resume-results"></div>
        </div>
    `;

    document.body.appendChild(modal);
}

async function analyzeResume() {
    const fileInput = document.getElementById('resume-file');
    const resultsDiv = document.getElementById('resume-results');

    if (!fileInput.files[0]) return;

    const formData = new FormData();
    formData.append('resume', fileInput.files[0]);

    resultsDiv.innerHTML = '<div style="text-align: center; padding: 2rem;"><i class="fa-solid fa-circle-notch fa-spin"></i> Analyzing with AI...</div>';

    try {
        const response = await fetchWithAuth(`${API_URL}/api/resume/analyze`, {
            method: 'POST',
            body: formData,
            headers: {} // Let browser set Content-Type for FormData
        });

        const data = await response.json();

        if (data.error) throw new Error(data.error);

        const analysis = data.analysis;

        resultsDiv.innerHTML = `
            <div style="background: white; padding: 2rem; border-radius: 12px; border: 1px solid var(--border);">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div style="font-size: 3rem; font-weight: 700; color: ${analysis.ats_score >= 70 ? 'var(--success)' : 'var(--warning)'};">
                        ${analysis.ats_score}/100
                    </div>
                    <div style="color: var(--text-sub);">ATS Compatibility Score</div>
                </div>

                <div style="margin-bottom: 2rem;">
                    <h4 style="color: var(--success); margin-bottom: 1rem;">✓ Strengths</h4>
                    <ul style="padding-left: 1.5rem;">
                        ${analysis.strengths.map(s => `<li style="margin-bottom: 0.5rem;">${s}</li>`).join('')}
                    </ul>
                </div>

                <div style="margin-bottom: 2rem;">
                    <h4 style="color: var(--danger); margin-bottom: 1rem;">⚠ Improvements Needed</h4>
                    <ul style="padding-left: 1.5rem;">
                        ${analysis.improvements.map(i => `<li style="margin-bottom: 0.5rem;">${i}</li>`).join('')}
                    </ul>
                </div>

                <div style="background: var(--warning-bg); padding: 1rem; border-radius: 8px;">
                    <h4 style="margin-bottom: 0.5rem;">Missing Keywords</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                        ${analysis.missing_keywords.map(k => `
                            <span style="background: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.875rem;">${k}</span>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

    } catch (error) {
        resultsDiv.innerHTML = `<div style="color: var(--danger); text-align: center; padding: 2rem;">Error: ${error.message}</div>`;
    }
}

// ========== KEEP ALL YOUR EXISTING FUNCTIONS ==========
// (All your original functions below remain unchanged)

function simulateSkillImpact(skillName) {
    if (!globalData || !globalData.top_matches) return;

    const relevantJob = globalData.top_matches.find(job =>
        job.missing_skills && job.missing_skills.includes(skillName)
    );

    if (!relevantJob) {
        alert("Great news! You're actually qualified for jobs requiring " + skillName);
        return;
    }

    showJobDetail(relevantJob);

    setTimeout(() => {
        const simContainer = document.getElementById(`simulator-container-${relevantJob.job_id}`);
        if (simContainer) {
            simContainer.scrollIntoView({ behavior: 'smooth' });
            const select = document.getElementById(`sim-select-${relevantJob.job_id}`);
            if (select) {
                select.value = skillName;
                select.dispatchEvent(new Event('change'));
                const btn = document.getElementById(`sim-btn-${relevantJob.job_id}`);
                if (btn) btn.click();
            }
        }
    }, 500);
}

// [Keep all your existing rendering functions: renderSidebar, renderDashboard, renderHero, etc.]
// I'm including them but they're the same as your original code

async function renderSidebar(profile) {
    const sidebar = document.getElementById('profile-card');
    if (!sidebar) return;

    // Fetch Gamification Stats
    let gamification = { level: 1, xp: 0 };
    try {
        const res = await fetchWithAuth(`${API_URL}/api/gamification/progress`);
        if (res.ok) gamification = await res.json();
    } catch (e) {
        console.warn("Could not load gamification:", e);
    }

    const { level, xp } = gamification;
    const previousLevelXp = 100 * Math.pow(level - 1, 2); // Approximation for bar
    const nextLevelXp = 100 * Math.pow(level, 2); // Simple quadratic curve
    // Or closer to actual formula: Level = 1 + sqrt(XP / 100) => XP = 100 * (Level-1)^2
    // Let's just use linear for visual simplicity if formula is complex
    const levelProgress = Math.min(100, (xp % 100)); // Simplified: 100 XP per level for visual

    const initials = profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U';

    let goalsHtml = '';

    if (globalData && globalData.analysis && globalData.analysis.missing_critical_skills.length > 0) {
        const topMiss = globalData.analysis.missing_critical_skills[0];
        goalsHtml += `
            <div class="gap-item" style="margin-top: 1rem; background: var(--warning-bg); cursor:pointer;" onclick="launchSkillAssessment('${topMiss}')">
                <div class="gap-icon" style="background: white; color: var(--warning);">1</div>
                <div style="font-size: 0.875rem;">Take ${topMiss} assessment</div>
            </div>
        `;
    } else {
        goalsHtml += `
            <div class="gap-item" style="margin-top: 1rem; background: var(--success-bg);">
                <div class="gap-icon" style="background: white; color: var(--success);"><i class="fa-solid fa-check"></i></div>
                <div style="font-size: 0.875rem;">Keep your skills updated!</div>
            </div>
        `;
    }

    if (globalData && globalData.top_matches && globalData.top_matches.length > 0) {
        const topJob = globalData.top_matches[0];
        goalsHtml += `
            <div class="gap-item" style="margin-top: 0.5rem; background: var(--primary-light);">
                <div class="gap-icon" style="background: white; color: var(--primary);">2</div>
                <div style="font-size: 0.875rem;">Apply to <strong>${(topJob.company && topJob.company !== 'nan') ? topJob.company : 'Confidential Company'}</strong></div>
            </div>
        `;
    }

    sidebar.innerHTML = `
        <div style="position: relative; display: inline-block;">
            <div class="profile-avatar">${initials}</div>
            <div class="level-badge" style="position: absolute; bottom: 0; right: 0;">${level}</div>
        </div>
        
        <div class="profile-name">${profile.full_name || 'User'}</div>
        <div class="profile-role">${profile.target_role || 'No Role Set'}</div>
        
        <div style="margin: 1rem 0; text-align: left;">
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-sub);">
                <span>Level ${level}</span>
                <span>${xp} XP</span>
            </div>
            <div class="xp-bar-container">
                <div class="xp-bar-fill" style="width: ${levelProgress}%"></div>
            </div>
        </div>

        <div class="profile-stat">
            <span class="stat-label">Experience</span>
            <span class="stat-value" style="text-transform: capitalize;">${profile.experience_level || 'Entry'}</span>
        </div>
        <div class="profile-stat">
            <span class="stat-label">Skills Verified</span>
            <span class="stat-value">${profile.skills?.filter(s => s.verified).length || 0}/${profile.skills?.length || 0}</span>
        </div>
        
        <button onclick="openProfileEditor()" class="btn btn-outline" style="width: 100%; margin-top: 0.5rem;">
            Edit Profile
        </button>
        <button onclick="openResumeAnalyzer()" class="btn btn-primary" style="width: 100%; margin-top: 0.5rem;">
            <i class="fa-solid fa-wand-magic-sparkles"></i> Analyze Resume
        </button>
        
        <div style="margin-top: 2rem; text-align: left;">
            <h4 style="margin-bottom:0.5rem;"><i class="fa-solid fa-bullseye text-warning"></i> Smart Goals</h4>
            ${goalsHtml}
        </div>
    `;
}

// ========== RESTORED FUNCTIONS ==========


async function loadDashboard() {
    const user = Auth.getUser();
    if (!user) return;

    // 1. Profile Card
    // (Existing logic: already fetching profile)

    // 2. Fetch Intelligent Job Recommendations
    try {
        const res = await fetchWithAuth('/api/jobs/recommendations');
        if (res.ok) {
            const response = await res.json();
            if (response.recommendations) {
                renderJobs(response.recommendations);

                // Render Hero Stats based on top match
                if (response.recommendations.length > 0) {
                    const topMatch = response.recommendations[0];
                    renderHero(topMatch);
                }
            }
        }
    } catch (error) {
        console.error("Job fetch error:", error);
        document.getElementById('jobs-container').innerHTML = `<div class="p-3 text-center text-sub">Unable to load intelligence feed.</div>`;
    }
}

function renderHero(topMatch) {
    const hero = document.getElementById('hero-card');
    if (!hero) return;

    const score = topMatch.readiness_score || 0;
    const cat = topMatch.category || { color: 'warning', label: 'Developing', message: 'Keep growing skills' };

    hero.innerHTML = `
        <div class="readiness-ring" style="border-top-color: var(--${cat.color}); border-color: var(--${cat.color}-bg); box-shadow: 0 0 20px -5px var(--${cat.color}-bg);">
            <span class="readiness-score" style="color:var(--${cat.color})">${Math.round(score)}%</span>
            <div style="font-size:0.7rem; color:var(--text-sub);">READINESS</div>
        </div>
        <div class="hero-content">
            <div class="status-badge" style="background:var(--${cat.color}-bg); color:var(--${cat.color}); display:inline-block; margin-bottom:0.5rem; font-size:0.75rem;">
                <i class="fa-solid fa-${cat.icon || 'star'}"></i> ${cat.label}
            </div>
            <h3 style="font-size: 1.25rem; font-weight:600; margin-bottom: 0.5rem;">${cat.message}</h3>
            <p style="margin-bottom: 1rem; color: var(--text-sub);">
                Best match: <strong>${topMatch.title}</strong> at ${topMatch.company}
            </p>
            <button onclick='window.viewJobDetails(${JSON.stringify(topMatch).replace(/'/g, "&#39;")})' class="btn btn-primary" style="padding: 0.5rem 1.5rem; border-radius: 20px;">
                View Fit Analysis
            </button>
        </div>
    `;
}

function renderJobs(jobs) {
    const container = document.getElementById('jobs-container');
    if (!jobs || jobs.length === 0) {
        container.innerHTML = '<div class="card p-3 text-center">No matching jobs found yet. Try updating your profile!</div>';
        return;
    }

    container.innerHTML = jobs.map(job => {
        const cat = job.category || { color: 'secondary', label: 'Unknown', icon: 'question' };
        const action = job.best_action || { message: 'View Details' };
        const jobJson = JSON.stringify(job).replace(/'/g, "&#39;").replace(/"/g, "&quot;");

        return `
        <div class="card job-card" style="position:relative; overflow:hidden; transition: transform 0.2s; cursor:pointer;" onclick='window.viewJobDetails(${jobJson})'>
            <!-- Readiness Strip -->
            <div style="position:absolute; top:0; left:0; width:4px; height:100%; background:var(--${cat.color});"></div>
            
            <div class="job-header" style="margin-bottom:0.5rem;">
                <div>
                     <div class="job-title" style="font-weight:700; font-size:1.05rem;">${job.title}</div>
                     <div class="job-company" style="font-size:0.9rem; color:var(--text-sub);">
                        <i class="fa-solid fa-building"></i> ${job.company}
                     </div>
                </div>
                <!-- Readiness Badge -->
                <div style="text-align:right;">
                    <div style="font-size:1.4rem; font-weight:800; color:var(--${cat.color}); line-height:1;">
                        ${job.readiness_score}%
                    </div>
                    <span class="tag" style="background:var(--${cat.color}-bg); color:var(--${cat.color}); font-size:0.65rem; padding:2px 6px;">
                        ${cat.label.toUpperCase()}
                    </span>
                </div>
            </div>

            <!-- Intelligent Insight -->
            <div style="background:var(--bg-body); padding:0.6rem; border-radius:4px; font-size:0.8rem; display:flex; gap:0.5rem; align-items:center;">
                <i class="fa-solid fa-lightbulb text-warning"></i>
                <span style="color:var(--text-main); font-weight:500;">
                    ${action.message}
                </span>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.8rem; font-size:0.8rem; color:var(--text-sub);">
                <div><i class="fa-solid fa-location-dot"></i> ${job.location}</div>
                <div style="display:flex; gap:0.5rem;">
                     ${job.missing_skills.length > 0 ?
                `<span style="color:var(--danger);"><i class="fa-solid fa-triangle-exclamation"></i> Missing ${job.missing_skills.length} skills</span>` :
                `<span style="color:var(--success);"><i class="fa-solid fa-check"></i> Perfect Match</span>`
            }
                </div>
            </div>
        </div>
    `}).join('');
}

window.viewJobDetails = function (job) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const cat = job.category || { color: 'primary', label: 'Analysis' };

    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
            
            <!-- Header -->
            <div style="margin-bottom: 1.5rem; padding-bottom:1rem; border-bottom:1px solid var(--border);">
                <div style="font-size: 1.4rem; font-weight: 700;">${job.title}</div>
                <div style="font-size: 1rem; color: var(--text-sub);">${job.company} &bull; ${job.location}</div>
            </div>

            <!-- Readiness Explanation -->
            <div style="background:var(--${cat.color}-bg); padding:1.5rem; border-radius:8px; text-align:center; margin-bottom:1.5rem;">
                <div style="font-size:0.9rem; color:var(--${cat.color}); margin-bottom:0.5rem; font-weight:600;">
                    ${cat.message}
                </div>
                <div style="font-size:3rem; font-weight:800; color:var(--${cat.color}); line-height:1;">
                    ${job.readiness_score}%
                </div>
                <div style="font-size:0.8rem; color:var(--${cat.color}); opacity:0.8;">READINESS SCORE</div>
                
                <!-- Breakdown -->
                <div style="display:flex; justify-content:center; gap:1.5rem; margin-top:1rem; padding-top:1rem; border-top:1px solid rgba(0,0,0,0.05);">
                    ${job.readiness_breakdown?.breakdown.map(b => `
                        <div style="text-align:center;">
                            <div style="font-weight:700; color:var(--text-main);">${b.value}%</div>
                            <div style="font-size:0.7rem; color:var(--text-sub);">${b.label}</div>
                        </div>
                    `).join('') || ''}
                </div>
            </div>

            <!-- Skill Gaps -->
            <div style="margin-bottom:2rem;">
                <h4 style="font-size:0.9rem; margin-bottom:0.5rem;">Skill Gap Analysis</h4>
                <div style="display:flex; flex-wrap:wrap; gap:0.5rem;">
                     ${job.required_skills.map(skill => {
        const isMissing = job.missing_skills.includes(skill);
        return isMissing
            ? `<span class="tag" style="background:white; border:1px solid var(--danger); color:var(--danger);"><i class="fa-solid fa-xmark"></i> ${skill}</span>`
            : `<span class="tag" style="background:var(--success-bg); color:var(--success);"><i class="fa-solid fa-check"></i> ${skill}</span>`;
    }).join('')}
                </div>
            </div>

            <!-- Smart Actions -->
            <div style="display: flex; gap: 1rem;">
                <button id="apply-btn" class="btn btn-primary" style="flex:1; background:var(--${cat.color}); border:none;">
                    ${cat.label === 'Apply Now' ? 'Apply Now' : 'Apply Anyway'}
                </button>
                <button class="btn btn-outline" style="flex:1;" onclick="this.closest('.modal-overlay').remove()">
                    Not Ready Yet
                </button>
            </div>
            
            <div id="apply-warning" style="display:none; margin-top:1rem; font-size:0.85rem; color:var(--danger); text-align:center;">
                <i class="fa-solid fa-triangle-exclamation"></i> Are you sure? Your readiness is below 70%.
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Smart Apply Logic
    const applyBtn = modal.querySelector('#apply-btn');
    applyBtn.onclick = async () => {
        if (job.readiness_score < 50 && !applyBtn.getAttribute('data-confirmed')) {
            modal.querySelector('#apply-warning').style.display = 'block';
            applyBtn.innerText = "Yes, I'm confident";
            applyBtn.setAttribute('data-confirmed', 'true');
            return;
        }

        // Proceed to apply
        try {
            applyBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Applying...';
            const res = await fetchWithAuth(`/api/jobs/${job.job_id}/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ readiness_at_apply: job.readiness_score })
            });

            if (res.readiness_score) {
                showToast('Application Sent!', 'success');
                modal.remove();
                // Refresh dashboard to show applied status if needed
            } else if (res.error) {
                showToast(res.error, 'error');
                applyBtn.innerText = 'Run into Error';
            }
        } catch (e) {
            console.error(e);
            showToast('Application failed', 'error');
        }
    };
};

function showJobDetail(job) {
    // Legacy alias to new window function
    window.viewJobDetails(job);
}

function renderGaps(gaps) {
    const container = document.getElementById('gaps-container');
    if (!gaps.length) {
        container.innerHTML = '<div style="padding:1rem; color:var(--text-sub);"><i class="fa-solid fa-check-circle text-success"></i> You have no critical skill gaps!</div>';
        return;
    }

    container.innerHTML = gaps.map(gap => `
        <div class="gap-item" style="transition: transform 0.2s; cursor: default;" onmouseover="this.style.transform='translateX(4px)'" onmouseout="this.style.transform='translateX(0)'">
            <div class="gap-icon" style="background:var(--danger-bg); color:var(--danger); width:40px; height:40px; font-size:1rem;">
                <i class="fa-solid fa-bolt"></i>
            </div>
            <div style="flex: 1;">
                <div style="font-weight: 600; font-size: 1rem;">${gap.name}</div>
                <div style="font-size: 0.8rem; color: var(--text-sub);">
                    Required in <strong>~${gap.percent}%</strong> of roles
                </div>
            </div>
            <button class="btn btn-outline" style="font-size: 0.75rem; border-color: var(--primary); color: var(--primary);" 
              onclick="simulateSkillImpact('${gap.name}')">
                See Impact <i class="fa-solid fa-chart-line"></i>
            </button>
            <button class="btn btn-outline" style="font-size: 0.75rem; margin-left:0.5rem; border-color: var(--success); color: var(--success);" 
              onclick="launchSkillAssessment('${gap.name}')">
                Verify <i class="fa-solid fa-check"></i>
            </button>
        </div>
    `).join('');
}


function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) modal.remove();
}

function renderSimulator(job) {
    const container = document.getElementById(`simulator-container-${job.job_id}`);
    if (!container || !job.missing_skills || job.missing_skills.length === 0) return;

    container.innerHTML = `
        <h4 style="margin-bottom: 0.5rem;">What-If Simulator 🧠</h4>
        <div style="background: var(--bg-body); padding: 1rem; border-radius: var(--radius-md); display: flex; gap: 0.5rem; align-items: center;">
            <span style="font-size: 0.9rem;">If I learn:</span>
            <select id="sim-select-${job.job_id}" style="padding: 0.4rem; border-radius: 4px; border: 1px solid var(--border);">
                ${job.missing_skills.map(s => `<option value="${s}">${s}</option>`).join('')}
            </select>
            <button id="sim-btn-${job.job_id}" class="btn btn-outline" style="padding: 0.4rem 0.8rem;">Simulate</button>
        </div>
        <div id="sim-result-${job.job_id}" style="margin-top: 1rem;"></div>
    `;

    document.getElementById(`sim-btn-${job.job_id}`).onclick = () => runSimulation(job);
}

async function runSimulation(job) {
    const skillSelect = document.getElementById(`sim-select-${job.job_id}`);
    const resultDiv = document.getElementById(`sim-result-${job.job_id}`);
    const skill = skillSelect.value;
    resultDiv.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Calculating...';

    try {
        const response = await fetchWithAuth(`${API_URL}/simulate`, {
            method: 'POST',
            body: JSON.stringify({
                profile: currentProfile,
                add_skill: { name: skill, proficiency: 'intermediate' },
                target_job_id: job.job_id
            })
        });
        const data = await response.json();
        const improvement = data.projected_match - data.current_match;
        resultDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem; background: var(--success-bg); padding: 1rem; border-radius: var(--radius-sm); color: var(--success-dark);">
                <div style="font-size: 1.5rem; font-weight: 700;">+${improvement.toFixed(1)}%</div>
                <div><strong>Readiness Boost</strong><br>New Score: ${data.projected_readiness}%</div>
            </div>
        `;
    } catch (e) {
        resultDiv.innerHTML = `<span style="color:red">Error: ${e.message}</span>`;
    }
}

function openProfileEditor() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'profile-editor-modal';

    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" onclick="closeProfileEditor()">×</button>
            <h3>Edit Profile</h3>
            <div style="margin: 1rem 0;">
                <label>Target Role</label>
                <input type="text" id="edit-role" value="${currentProfile.target_role || ''}" style="width:100%; padding:0.5rem; margin-top:0.5rem;">
            </div>
            <div style="margin: 1rem 0;">
                <label>Skills</label>
                 <div style="display:flex; flex-wrap:wrap; gap:0.5rem; margin:0.5rem 0;">
                    ${currentProfile.skills.map(s => `
                        <span class="tag" style="background:var(--bg-body);">
                            ${s.name} <i class="fa-solid fa-xmark" onclick="removeEditorSkill('${s.name}')" style="cursor:pointer; margin-left:0.5rem;"></i>
                        </span>
                    `).join('')}
                </div>
                <div style="display:flex; gap:0.5rem;">
                    <input type="text" id="new-skill-input" placeholder="Add skill..." style="flex:1; padding:0.5rem;">
                    <button onclick="addEditorSkill()" class="btn btn-outline">Add</button>
                </div>
            </div>
            <button onclick="saveProfile()" class="btn btn-primary" style="width:100%;">Save</button>
        </div>
    `;
    document.body.appendChild(modal);
}

function closeProfileEditor() {
    const modal = document.getElementById('profile-editor-modal');
    if (modal) modal.remove();
}

function removeEditorSkill(name) {
    currentProfile.skills = currentProfile.skills.filter(s => s.name !== name);
    closeProfileEditor(); openProfileEditor();
}

function addEditorSkill() {
    const val = document.getElementById('new-skill-input').value.trim();
    if (val) {
        currentProfile.skills.push({ name: val, proficiency: 'intermediate' });
        closeProfileEditor(); openProfileEditor();
    }
}

async function saveProfile() {
    const role = document.getElementById('edit-role').value;
    currentProfile.target_role = role;
    try {
        await fetchWithAuth(`${API_URL}/api/candidate/profile`, {
            method: 'PUT',
            body: JSON.stringify(currentProfile)
        });
        closeProfileEditor();
        analyzeProfile();
    } catch (e) {
        alert("Failed to save: " + e.message);
    }
}

// Global Exports
window.viewJobDetails = showJobDetail;
window.closeModal = closeModal;
window.simulateSkillImpact = simulateSkillImpact;
window.openProfileEditor = openProfileEditor;
window.closeProfileEditor = closeProfileEditor;
window.removeEditorSkill = removeEditorSkill;
window.addEditorSkill = addEditorSkill;
window.saveProfile = saveProfile;
window.launchSkillAssessment = launchSkillAssessment;
window.openResumeAnalyzer = openResumeAnalyzer;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    initializeWebSocket();
    loadDashboard();
});