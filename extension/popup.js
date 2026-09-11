const API_BASE = "https://trustlens-qtex.onrender.com";
const WEBSITE_BASE = "https://trusttlens.netlify.app";

const loadingState = document.getElementById("loadingState");
const unsupportedState = document.getElementById("unsupportedState");
const errorState = document.getElementById("errorState");
const resultState = document.getElementById("resultState");

const refreshBtn = document.getElementById("refreshBtn");
const retryBtn = document.getElementById("retryBtn");
const openTrustLensBtn = document.getElementById("openTrustLensBtn");
const fullReportBtn = document.getElementById("fullReportBtn");

let currentPlatform = null;

function showState(state) {
    loadingState.classList.add("hidden");
    unsupportedState.classList.add("hidden");
    errorState.classList.add("hidden");
    resultState.classList.add("hidden");

    state.classList.remove("hidden");
}

function getDomain(url) {
    try {
        const parsed = new URL(url);

        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
            return null;
        }

        return parsed.hostname.replace(/^www\./, "").toLowerCase();
    } catch {
        return null;
    }
}

async function getCurrentTab() {
    const tabs = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
    });

    return tabs[0];
}

async function fetchScore(domain) {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
        controller.abort();
    }, 30000);

    try {
        const url =
            `${API_BASE}/score-by-domain?domain=${encodeURIComponent(domain)}`;

        const response = await fetch(url, {
            signal: controller.signal
        });

        if (response.status === 404) {
            return { unsupported: true };
        }

        if (!response.ok) {
            throw new Error(`Backend returned ${response.status}`);
        }

        return await response.json();
    } finally {
        clearTimeout(timeout);
    }
}

function renderSignal(id, signal) {
    const scoreElement = document.getElementById(`${id}Score`);
    const barElement = document.getElementById(`${id}Bar`);

    if (!scoreElement || !barElement || !signal) {
        return;
    }

    const score = signal.score ?? 0;
    const max = signal.max ?? 0;

    scoreElement.textContent = `${score}/${max}`;

    const percentage = max > 0
        ? Math.max(0, Math.min(100, (score / max) * 100))
        : 0;

    barElement.style.width = `${percentage}%`;
}

function renderActions(actions) {
    const container = document.getElementById("actionSteps");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (!actions || actions.length === 0) {
        container.innerHTML = "<li>No immediate action required.</li>";
        return;
    }

    actions.forEach(action => {
        const li = document.createElement("li");
        li.textContent = action;
        container.appendChild(li);
    });
}

function renderResult(data, domain) {
    document.getElementById("currentDomain").textContent = domain;

    document.getElementById("scoreValue").textContent = data.score;
    document.getElementById("gradeValue").textContent = data.grade;
    document.getElementById("gradeDescription").textContent =
        data.grade_desc || "";

    const dpdpBadge = document.getElementById("dpdpBadge");

    if (data.dpdp_compliant) {
        dpdpBadge.textContent = "DPDP Compliant";
        dpdpBadge.classList.remove("danger");
        dpdpBadge.classList.add("success");
    } else {
        dpdpBadge.textContent = "DPDP Issues Found";
        dpdpBadge.classList.remove("success");
        dpdpBadge.classList.add("danger");
    }

    renderSignal("policy", data.signals.policy);
    renderSignal("breach", data.signals.breach);
    renderSignal("compliance", data.signals.compliance);
    renderSignal("complaint", data.signals.complaint);
    renderSignal("tracker", data.signals.tracker);

    document.getElementById("description").textContent =
        data.description || "No description available.";

    renderActions(data.action_steps);

    currentPlatform =
        data.platform_info?.display_name || domain;

    showState(resultState);
}

async function loadTrustLens() {
    showState(loadingState);

    try {
        const tab = await getCurrentTab();

        if (!tab || !tab.url) {
            throw new Error("Could not access the current tab.");
        }

        const domain = getDomain(tab.url);

        if (!domain) {
            showState(unsupportedState);
            return;
        }

        document.getElementById("currentDomain").textContent = domain;

        const data = await fetchScore(domain);

        if (data.unsupported) {
            showState(unsupportedState);
            return;
        }

        renderResult(data, domain);

    } catch (error) {
        console.error("TrustLens error:", error);

        const errorMessage = document.getElementById("errorMessage");

        if (error.name === "AbortError") {
            errorMessage.textContent =
                "Analysis is taking too long. Please try again.";
        } else {
            errorMessage.textContent =
                "Could not connect to the TrustLens backend.";
        }

        showState(errorState);
    }
}

refreshBtn.addEventListener("click", loadTrustLens);
retryBtn.addEventListener("click", loadTrustLens);

openTrustLensBtn.addEventListener("click", () => {
    chrome.tabs.create({
        url: WEBSITE_BASE
    });
});

fullReportBtn.addEventListener("click", () => {
    if (!currentPlatform) {
        return;
    }

    chrome.tabs.create({
        url: `${WEBSITE_BASE}/score/${encodeURIComponent(currentPlatform)}`
    });
});

loadTrustLens();