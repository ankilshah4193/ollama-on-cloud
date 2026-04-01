/**
 * AI CONTRACT ANALYSIS - WEB ENGINE
 * Features: Reality Check Logic, Snappy Output Formatting, Dynamic Policy
 */

const modal = document.getElementById('settings-modal');
const trigger = document.getElementById('settings-trigger');
const saveBtn = document.getElementById('save-settings');
const closeBtn = document.getElementById('close-modal');
const keyInput = document.getElementById('groq-key-input');
const policyInput = document.getElementById('policy-input');
const analyzeBtn = document.getElementById('analyze-btn');
const outputContainer = document.getElementById('results-container');
const outputText = document.getElementById('output-text');

// --- SETTINGS & MODAL LOGIC ---
trigger.onclick = () => {
    keyInput.value = localStorage.getItem('groq_api_key') || '';
    policyInput.value = localStorage.getItem('company_policy') || '';
    modal.style.display = 'block';
};

closeBtn.onclick = () => modal.style.display = 'none';
window.onclick = (event) => { if (event.target == modal) modal.style.display = "none"; };

saveBtn.onclick = () => {
    const key = keyInput.value.trim();
    const policy = policyInput.value.trim();
    
    if (key) {
        localStorage.setItem('groq_api_key', key);
        localStorage.setItem('company_policy', policy); // Allow empty policy
        modal.style.display = 'none';
        alert("Setup & Policy Saved Successfully.");
    } else {
        alert("Please enter a valid API Key.");
    }
};

// --- CORE ANALYSIS ENGINE ---
analyzeBtn.onclick = async () => {
    const contractText = document.getElementById('contract-input').value.trim();
    const apiKey = localStorage.getItem('groq_api_key');
    const policyContext = localStorage.getItem('company_policy') || '';

    if (!apiKey) {
        alert("Configuration Required: Please set your Groq API key in the Settings (⚙️).");
        modal.style.display = 'block';
        return;
    }

    if (!contractText) return alert("Please paste contract text to analyze.");

    analyzeBtn.disabled = true;
    analyzeBtn.innerText = "Auditing against Strategy...";
    outputContainer.classList.remove('hidden');
    outputText.innerText = "Initializing AI Auditor...\n\nEvaluating clauses...";

    const systemPrompt = `You are an Expert Contract Negotiator advising a Project Manager. 

CRITICAL INSTRUCTIONS:
1. DUAL-TONE REQUIREMENT: 
   - Your "THE STRATEGY" section must be in plain, 8th-grade English with NO legal jargon. Talk to me like a Project Manager.
   - Your "COPY/PASTE COUNTER" MUST be written in highly formal, precise legal terminology, matching the tone of a commercial contract. If the change is safe to accept, simply state "No counter needed. Text is acceptable."
2. If multiple distinct clauses are provided, evaluate each one separately.

EVALUATION FRAMEWORK (REALITY CHECK):
1. THE POLICY CHECK: First, evaluate the vendor's text against the COMPANY POLICY below.
2. THE REALITY CHECK: If our COMPANY POLICY dictates a highly aggressive or commercially unreasonable position, you must warn me that the vendor will likely reject our stance. 
3. STRATEGIC COMPROMISE: If our policy is too aggressive, or if the vendor's term is unacceptable, you MUST propose a fair, neutral "Common Ground" counter in formal legal text that keeps the deal moving.
4. SILENT POLICY / FAIRNESS: If the policy is silent, evaluate the change for General Commercial Fairness. NEVER auto-accept a heavily one-sided vendor term just because the policy is silent.
5. BENIGN CHANGES: If a term is standard industry practice and safe, state that it is safe to accept.

OUTPUT FORMAT PER CLAUSE:
🔍 WHAT CHANGED: [In one simple sentence, what is the vendor asking for?]
🚦 RISK LEVEL: [Output exactly: 🔴 High Risk, 🟡 Medium Risk, or 🟢 Safe to Accept]
💡 THE STRATEGY: [Explain exactly why this matters and why your counter is fair, using zero legal jargon. Apply the Reality Check here if needed.]
✍️ COPY/PASTE COUNTER: [Draft the formal, legally binding contract clause to replace the vendor's text, or state that it is safe to accept.]

COMPANY POLICY:
${policyContext ? policyContext : "No specific policy provided. Default to standard, balanced B2B legal protections."}`;

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Evaluate the following contract text:\n\n${contractText}` }
                ],
                temperature: 0.1
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message || "Unknown AI Error");
        outputText.innerText = data.choices[0].message.content;

    } catch (err) {
        outputText.innerHTML = `<span style="color:red; font-weight:bold;">Error:</span> ${err.message}`;
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.innerText = "Analyze Contract";
    }
};
