/**
 * RENEWABLE LEGAL AIDE - WEB ENGINE (DYNAMIC POLICY)
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
    
    if (key && policy) {
        localStorage.setItem('groq_api_key', key);
        localStorage.setItem('company_policy', policy);
        modal.style.display = 'none';
        alert("Settings & Policy Saved Successfully.");
    } else {
        alert("Please enter both an API Key and a Strategic Policy.");
    }
};

// --- CORE ANALYSIS ENGINE ---
analyzeBtn.onclick = async () => {
    const contractText = document.getElementById('contract-input').value.trim();
    const apiKey = localStorage.getItem('groq_api_key');
    const policyContext = localStorage.getItem('company_policy');

    if (!apiKey || !policyContext) {
        alert("Configuration Required: Please set your Groq API key and Policy in the Settings (⚙️).");
        modal.style.display = 'block';
        return;
    }

    if (!contractText) return alert("Please paste contract text to analyze.");

    analyzeBtn.disabled = true;
    analyzeBtn.innerText = "Auditing against Policy...";
    outputContainer.classList.remove('hidden');
    outputText.innerText = "Initializing AI Auditor...";

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
                    {
                        role: "system",
                        content: `You are a Red-Line Auditor. Your ONLY task is to identify where the Vendor's proposed text deviates from the Strategic Policy.
                        
                        STRATEGIC POLICY:
                        ${policyContext}
                        
                        INSTRUCTIONS:
                        1. Ignore standard clauses that align with policy.
                        2. ONLY report on 'Contested' or 'Red-Lined' sections.
                        
                        OUTPUT FORMAT PER RED-LINE:
                        🚩 DETECTED RED-LINE: [Exact Vendor Change]
                        ⚖️ POLICY MISALIGNMENT: [Point # from Policy]
                        📝 RECOMMENDED COUNTER: [Professional Legal Rebuttal]
                        💡 DECORUM STRATEGY: [How to negotiate this without hurting the partnership]`
                    },
                    { role: "user", content: `Identify the critical red-lines in this text:\n\n${contractText}` }
                ],
                temperature: 0.1
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message || "Unknown AI Error");
        outputText.innerText = data.choices[0].message.content;

    } catch (err) {
        outputText.innerHTML = `<span style="color:red;">Error: ${err.message}</span>`;
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.innerText = "Analyze Contract";
    }
};