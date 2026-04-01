/**
 * RENEWABLE LEGAL AIDE - CORE ENGINE
 * Integrated with Groq Cloud (Llama 3.3 70B)
 */

// --- UI ELEMENTS ---
const modal = document.getElementById('settings-modal');
const trigger = document.getElementById('settings-trigger');
const saveBtn = document.getElementById('save-settings');
const closeBtn = document.getElementById('close-modal');
const keyInput = document.getElementById('groq-key-input');
const analyzeBtn = document.getElementById('analyze-btn');
const outputContainer = document.getElementById('results-container');
const outputText = document.getElementById('output-text');

// --- SETTINGS & MODAL LOGIC ---
trigger.onclick = () => {
    keyInput.value = localStorage.getItem('groq_api_key') || '';
    modal.style.display = 'block';
};

closeBtn.onclick = () => modal.style.display = 'none';

window.onclick = (event) => {
    if (event.target == modal) modal.style.display = "none";
};

saveBtn.onclick = () => {
    const key = keyInput.value.trim();
    if (key) {
        localStorage.setItem('groq_api_key', key);
        modal.style.display = 'none';
        alert("API Settings Saved Successfully.");
    } else {
        alert("Please enter a valid API Key.");
    }
};

// --- CORE ANALYSIS ENGINE ---
analyzeBtn.onclick = async () => {
    const contractText = document.getElementById('contract-input').value.trim();
    const apiKey = localStorage.getItem('groq_api_key');

    if (!apiKey) {
        alert("Configuration Required: Please enter your Groq API key in the Settings (⚙️).");
        modal.style.display = 'block';
        return;
    }

    if (!contractText) {
        alert("Please paste contract text to analyze.");
        return;
    }

    // UI State: Loading
    analyzeBtn.disabled = true;
    analyzeBtn.innerText = "Auditing against Policy...";
    outputContainer.style.display = 'block';
    outputText.innerText = "Fetching Strategic Policy and initializing AI...";

    try {
        // 1. Fetch the Company Policy from your GitHub Repo
        let policyContent = "";
        try {
            const policyResponse = await fetch('company_policy.txt');
            if (policyResponse.ok) {
                policyContent = await policyResponse.text();
            } else {
                console.warn("Policy file not found. Proceeding with general legal knowledge.");
            }
        } catch (e) {
            console.error("Error loading policy file:", e);
        }

        // 2. Prepare the AI Request (Grounded in your 20 Points)
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
                        content: `You are an EDPR Legal AI Auditor. Your objective is to audit contracts against the EDPR Strategic Policy provided below.
                        
                        STRATEGIC POLICY:
                        ${policyContent}
                        
                        For every risk or misalignment found, you MUST use this exact format:
                        
                        Detected Risk: [Describe the specific clause or omission]
                        Policy Alignment: [Reference the Point # from the Policy]
                        Suggested Red-line: [Provide professional, protective legal phrasing]
                        Decorum Tip: [Provide a collaborative framing for the vendor]
                        
                        If the contract aligns well, provide a summary of its strengths relative to EDPR's 2026-28 Plan.` 
                    },
                    { 
                        role: "user", 
                        content: `Audit the following contract text:\n\n${contractText}` 
                    }
                ],
                temperature: 0.1, // Low temperature for high consistency/accuracy
                max_tokens: 4096
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message || "Unknown AI Error");
        }

        // 3. Display Results
        outputText.innerText = data.choices[0].message.content;

    } catch (err) {
        console.error("Analysis Failed:", err);
        outputText.innerHTML = `<span style="color:red;">Error: ${err.message}</span><br>Please check your API key and ensure the 'company_policy.txt' is in your repo.`;
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.innerText = "Analyze Contract";
    }
};