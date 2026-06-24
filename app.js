// ============================================================
// Clow Text to Web - AI Website Generator (Vercel Ready)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

    // ===== DOM REFS =====
    const promptInput = document.getElementById('promptInput');
    const generateBtn = document.getElementById('generateBtn');
    const resultFrame = document.getElementById('resultFrame');
    const statusBadge = document.getElementById('statusBadge');

    // ===== CONFIG =====
    // 🔑 Replace with your actual Qwen API key
    const API_KEY = 'sk-ws-H.IRHEPY.hSui.MEYCIQDiK2-tuF51VD1_O2uN6WudTu_AQK85sXR7Hqo6TVHzJgIhAKJ-3OhGD1TxKyXKjaMhSXSAT5hc629TbFfJul1MHimf';
    const API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

    // ===== HELPER: Update Status Badge =====
    function setStatus(text, type = '') {
        statusBadge.textContent = text;
        statusBadge.className = 'output-badge' + (type ? ' ' + type : '');
    }

    // ===== INITIAL WELCOME =====
    function setWelcomeMessage() {
        resultFrame.srcdoc = `
            <html>
                <head>
                    <style>
                        * { margin:0; padding:0; box-sizing:border-box; }
                        body {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            height: 100vh;
                            background: linear-gradient(145deg, #f0f4ff, #e8edf8);
                            font-family: 'Inter', -apple-system, sans-serif;
                            color: #1a2340;
                            padding: 2rem;
                            text-align: center;
                        }
                        .icon { font-size: 4rem; margin-bottom: 1rem; opacity: 0.6; }
                        h2 { font-weight: 500; font-size: 1.4rem; color: #2a3a6a; }
                        p { color: #5a6f99; margin-top: 0.5rem; font-size: 0.95rem; max-width: 400px; }
                        .hint { margin-top: 1.5rem; font-size: 0.8rem; color: #7a8db0; background: rgba(0,0,0,0.03); padding: 0.4rem 1.2rem; border-radius: 2rem; }
                    </style>
                </head>
                <body>
                    <div class="icon">✦</div>
                    <h2>Ready to create</h2>
                    <p>Describe your dream website in the prompt box and hit <strong>Generate</strong></p>
                    <span class="hint">⚡ Powered by Qwen AI</span>
                </body>
            </html>
        `;
        setStatus('Ready');
    }
    setWelcomeMessage();

    // ===== GENERATE FUNCTION =====
    async function generateWebsite(promptText) {
        const trimmed = promptText.trim();
        if (!trimmed) {
            alert('Please describe the website you want to create.');
            return;
        }

        // Show loading state
        setStatus('Generating...', 'loading');
        resultFrame.srcdoc = `
            <html>
                <head><style>
                    * { margin:0; padding:0; box-sizing:border-box; }
                    body {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        height: 100vh;
                        background: #0b1120;
                        font-family: 'Inter', sans-serif;
                        color: #b0c4e8;
                        gap: 1rem;
                    }
                    .spinner {
                        width: 48px;
                        height: 48px;
                        border: 3px solid rgba(124,155,255,0.15);
                        border-top-color: #7c9bff;
                        border-radius: 50%;
                        animation: spin 0.8s linear infinite;
                    }
                    @keyframes spin { to { transform: rotate(360deg); } }
                    p { font-size: 1rem; opacity: 0.7; }
                </style></head>
                <body>
                    <div class="spinner"></div>
                    <p>🤖 AI is building your website...</p>
                </body>
            </html>
        `;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: 'qwen-turbo',
                    input: {
                        messages: [
                            {
                                role: 'system',
                                content: `You are an expert web developer. Generate a complete, beautiful, and fully functional HTML document (including CSS and JavaScript inside) based on the user's description. Return ONLY the raw HTML code, with no markdown formatting, no explanations, no backticks. The code must work when opened directly in a browser. Use modern design, gradients, animations, and responsive layouts.`
                            },
                            {
                                role: 'user',
                                content: `Create a stunning, complete website with this description: ${trimmed}`
                            }
                        ]
                    },
                    parameters: {
                        result_format: 'message',
                        temperature: 0.7,
                        max_tokens: 4096
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API error ${response.status}: ${errorData?.message || response.statusText}`);
            }

            const data = await response.json();
            let generatedHTML = data?.output?.choices?.[0]?.message?.content || '';

            // Clean up markdown code fences
            generatedHTML = generatedHTML.replace(/^```html\s*/i, '').replace(/\s*```$/i, '');
            generatedHTML = generatedHTML.replace(/^```\s*/i, '').replace(/\s*```$/i, '');

            if (!generatedHTML || generatedHTML.length < 30) {
                throw new Error('AI returned empty or incomplete response.');
            }

            // Inject the generated HTML
            resultFrame.srcdoc = generatedHTML;
            setStatus('Done ✅');

        } catch (error) {
            console.error('Generation error:', error);
            setStatus('Error', 'error');
            resultFrame.srcdoc = `
                <html>
                    <head><style>
                        * { margin:0; padding:0; box-sizing:border-box; }
                        body {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            height: 100vh;
                            background: #0b1120;
                            font-family: 'Inter', sans-serif;
                            color: #f0a0a0;
                            padding: 2rem;
                            text-align: center;
                            gap: 0.8rem;
                        }
                        .error-icon { font-size: 3.5rem; }
                        h3 { font-weight: 500; color: #f0b0b0; }
                        p { color: #8899bb; font-size: 0.95rem; max-width: 500px; }
                        .detail { font-size: 0.8rem; color: #5a6f99; margin-top: 0.5rem; }
                    </style></head>
                    <body>
                        <div class="error-icon">⚠️</div>
                        <h3>Something went wrong</h3>
                        <p>${error.message || 'Failed to generate website. Please try again.'}</p>
                        <span class="detail">Make sure your API key is valid</span>
                    </body>
                </html>
            `;
        }
    }

    // ===== EVENT LISTENERS =====
    generateBtn.addEventListener('click', () => {
        generateWebsite(promptInput.value);
    });

    // Ctrl+Enter shortcut
    promptInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            generateWebsite(promptInput.value);
        }
    });

    // Auto-resize textarea
    promptInput.addEventListener('input', () => {
        promptInput.style.height = 'auto';
        promptInput.style.height = Math.min(promptInput.scrollHeight, 300) + 'px';
    });

    console.log('✨ Clow Text to Web ready');
    console.log('📱 Developed by Hemat');
    console.log('🔗 tiktok.com/@devhemat');
}); 
