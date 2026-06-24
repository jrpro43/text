// ============================================================
// Clow Text to Web - Gemini AI Version
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

    const promptInput = document.getElementById('promptInput');
    const generateBtn = document.getElementById('generateBtn');
    const resultFrame = document.getElementById('resultFrame');
    const statusBadge = document.getElementById('statusBadge');

    // ===== د خپل Gemini API کیلي دلته واچوئ =====
    // د ترلاسه کولو لینک: https://ai.google.dev/gemini-api
    const API_KEY = 'AQ.Ab8RN6IYcfuSCQvBpU2gk1TW6ST0cmYOrg_h0jY3e_YR2brQxw'; // ← خپله کیلي دلته کاپي کړئ
    
    // ===== Gemini API Endpoint =====
    const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

    function setStatus(text, type = '') {
        statusBadge.textContent = text;
        statusBadge.className = 'output-badge' + (type ? ' ' + type : '');
    }

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
                    <span class="hint">⚡ Powered by Gemini AI</span>
                </body>
            </html>
        `;
        setStatus('Ready');
    }
    setWelcomeMessage();

    async function generateWebsite(promptText) {
        const trimmed = promptText.trim();
        if (!trimmed) {
            alert('Please describe the website you want to create.');
            return;
        }

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
                    <p>🤖 Gemini is building your website...</p>
                </body>
            </html>
        `;

        try {
            // د Gemini API غوښتنه
            const response = await fetch(`${API_URL}?key=${API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: `You are an expert web developer. Generate a complete, beautiful, and fully functional HTML document (including CSS and JavaScript inside) based on the user's description. Return ONLY the raw HTML code, with no markdown formatting, no explanations, no backticks. The code must work when opened directly in a browser. Use modern design, gradients, animations, and responsive layouts.
                                    
                                    User description: ${trimmed}
                                    
                                    IMPORTANT: Return ONLY the HTML code. No markdown, no explanations, no backticks. Start directly with <html> or <!DOCTYPE html>.`
                                }
                            ]
                        },
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 8192,
                            topP: 0.95
                        }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                let errorMsg = `API error ${response.status}`;
                if (errorData?.error?.message) {
                    errorMsg = errorData.error.message;
                } else if (errorData?.error?.code) {
                    errorMsg = `${errorData.error.code}: ${errorData.error.message || 'Unknown error'}`;
                }
                throw new Error(errorMsg);
            }

            const data = await response.json();
            
            // د Gemini ځواب استخراج
            let generatedHTML = '';
            if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
                generatedHTML = data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('Invalid response format from Gemini API');
            }

            // د مارکډاون پاکول
            generatedHTML = generatedHTML.replace(/^```html\s*/i, '').replace(/\s*```$/i, '');
            generatedHTML = generatedHTML.replace(/^```\s*/i, '').replace(/\s*```$/i, '');
            
            // که چیرې د html یا DOCTYPE سره پیل نه شي، نو دا ممکن د کوډ پاک وي
            if (!generatedHTML.trim().startsWith('<') && !generatedHTML.trim().startsWith('<!')) {
                // هڅه وکړئ چې د HTML ټګونه ومومئ
                const htmlMatch = generatedHTML.match(/<html[\s\S]*<\/html>/i);
                if (htmlMatch) {
                    generatedHTML = htmlMatch[0];
                }
            }

            if (!generatedHTML || generatedHTML.length < 30) {
                throw new Error('AI returned empty or incomplete response.');
            }

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
                        <span class="detail">API Key: ${API_KEY ? '✅ Provided' : '❌ Missing'}</span>
                    </body>
                </html>
            `;
        }
    }

    generateBtn.addEventListener('click', () => {
        generateWebsite(promptInput.value);
    });

    promptInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            generateWebsite(promptInput.value);
        }
    });

    promptInput.addEventListener('input', () => {
        promptInput.style.height = 'auto';
        promptInput.style.height = Math.min(promptInput.scrollHeight, 300) + 'px';
    });

    console.log('✨ Clow Text to Web (Gemini) ready');
    console.log('📱 Developed by Hemat');
    console.log('🔗 tiktok.com/@devhemat');
}); 
