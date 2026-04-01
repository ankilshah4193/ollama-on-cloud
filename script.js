/**
 * AI CONTRACT ANALYSIS - CORE ENGINE
 */

const App = {
    // UI Elements
    elements: {
        modal: document.getElementById('settings-modal'),
        trigger: document.getElementById('settings-trigger'),
        saveBtn: document.getElementById('save-settings'),
        closeBtn: document.getElementById('close-modal'),
        keyInput: document.getElementById('groq-key-input'),
        analyzeBtn: document.getElementById('analyze-btn'),
        outputContainer: document.getElementById('results-container'),
        outputText: document.getElementById('output-text'),
        contractInput: document.getElementById('contract-input')
    },

    init() {
        this.bindEvents();
        this.loadSettings();
    },

    bindEvents() {
        this.elements.trigger.onclick = () => this.toggleModal(true);
        this.elements.closeBtn.onclick = () => this.toggleModal(false);
        this.elements.saveBtn.onclick = () => this.saveSettings();
        this.elements.analyzeBtn.onclick = () => this.runAnalysis();
        window.onclick = (e) => { if (e.target === this.elements.modal) this.toggleModal(false); };
    },

    toggleModal(show) {
        this.elements.modal.style.display = show ? 'block' : 'none';
    },

    loadSettings() {
        this.elements.keyInput.value = localStorage.getItem('groq_api_key') || '';
    },

    saveSettings() {
        const key = this.elements.keyInput.value.trim();
        if (key) {
            localStorage.setItem('groq_api_key', key);
            this.toggleModal(false);
            alert("Settings Saved.");
        }
    },

    async runAnalysis() {
        const text = this.elements.contractInput.value.trim();
        const apiKey = localStorage.getItem('groq_api_key');

        if (!apiKey) return this.toggleModal(true);
        if (!text) return alert("Paste text first.");

        // Update UI State
        this.elements.analyzeBtn.disabled = true;
        this.elements.analyzeBtn.innerText = "Auditing...";
        this.elements.outputContainer.classList.remove('hidden');
        this.elements.outputText.innerText = "Analyzing against strategic policy...";

        try {
            // 1. Fetch Policy
            const policyResponse = await fetch('company_policy.txt');
            const policy = policyResponse.ok ? await policyResponse.text() : "General Policy";

            // 2. AI Request
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { role: "system", content: `You are a Legal Auditor. Policy:\n${policy}` },
                        { role: "user", content: text }
                    ],
                    temperature: 0.1
                })
            });

            const data = await response.json();
            this.elements.outputText.innerText = data.choices[0].message.content;

        } catch (err) {
            this.elements.outputText.innerHTML = `<span style="color:red;">Error: ${err.message}</span>`;
        } finally {
            this.elements.analyzeBtn.disabled = false;
            this.elements.analyzeBtn.innerText = "Run Audit";
        }
    }
};

App.init();
