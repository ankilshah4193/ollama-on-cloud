const modal = document.getElementById('settings-modal');
const trigger = document.getElementById('settings-trigger');
const saveBtn = document.getElementById('save-settings');
const closeBtn = document.getElementById('close-modal');
const keyInput = document.getElementById('groq-key-input');
const analyzeBtn = document.getElementById('analyze-btn');

// Modal Logic
trigger.onclick = () => {
    keyInput.value = localStorage.getItem('groq_api_key') || '';
    modal.style.display = 'block';
};
closeBtn.onclick = () => modal.style.display = 'none';
saveBtn.onclick = () => {
    localStorage.setItem('groq_api_key', keyInput.value.trim());
    modal.style.display = 'none';
};

// Analysis Logic
analyzeBtn.onclick = async () => {
    const text = document.getElementById('contract-input').value;
    const apiKey = localStorage.getItem('groq_api_key');
    const output = document.getElementById('output-text');
    const container = document.getElementById('results-container');

    if (!apiKey) {
        alert("Please set your API key in Settings first.");
        modal.style.display = 'block';
        return;
    }

    if (!text) return alert("Please paste some text.");

    analyzeBtn.innerText = "Analyzing...";
    container.style.display = 'block';
    output.innerText = "Thinking...";

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
                    { role: "system", content: "You are a Legal Program Manager. Analyze the contract text for risks, renewal clauses, and financial obligations." },
                    { role: "user", content: text }
                ]
            })
        });

        const data = await response.json();
        output.innerText = data.choices[0].message.content;
    } catch (err) {
        output.innerText = "Error: " + err.message;
    } finally {
        analyzeBtn.innerText = "Analyze Selection";
    }
};