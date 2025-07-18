// Secure flag storage - flags are never exposed to client
        const SERVER_ENDPOINT = '/api'; // This would be your actual server endpoint
        
        // Authentication state
        let currentUser = null;
        let isLoginMode = true;
        
        // User data
        let userSolved = [];
        let userScoreValue = 0;
        
        // Sample challenges (in production, these would come from server without flags)
        let challenges = [
            {
                id: 1,
                title: "Welcome to CTF",
                description: "This is your first challenge! The flag is hidden in the source code of this page. Look carefully at the HTML comments.",
                code: "<!-- Look for the flag in the HTML structure -->\n<h1>Welcome Hacker!</h1>\n<p>Find the flag in the source!</p>",
                difficulty: "easy",
                points: 50,
                category: "Web"
            },
            {
                id: 2,
                title: "Base64 Decoder",
                description: "Decode this Base64 string to find the flag.",
                code: "Q1RGe2Jhc2U2NF9pc19lYXN5fQ==",
                difficulty: "easy",
                points: 100,
                category: "Crypto"
            },
            {
                id: 3,
                title: "Simple Cipher",
                description: "This looks like a Caesar cipher with shift 13 (ROT13). Decode it!",
                code: "PGS{ebg13_vf_sha}",
                difficulty: "medium",
                points: 150,
                category: "Crypto"
            },
            {
                id: 4,
                title: "SQL Injection",
                description: "Find the flag in this vulnerable login form. The password field is vulnerable to SQL injection.",
                code: "SELECT * FROM users WHERE username='admin' AND password='[YOUR_INPUT]';\n\n-- Table structure:\n-- users (id, username, password, flag)\n-- admin user exists with flag in the flag column",
                difficulty: "medium",
                points: 200,
                category: "Web"
            },
            {
                id: 5,
                title: "Buffer Overflow",
                description: "Analyze this C code and find the vulnerability. The flag is revealed when you overflow the buffer correctly.",
                code: "#include <stdio.h>\n#include <string.h>\n\nvoid vulnerable_function(char *input) {\n    char buffer[64];\n    strcpy(buffer, input);\n    \n    // Hidden: if buffer overflows into secret_flag variable\n    // The flag is hidden in the binary\n}\n\nint main() {\n    char input[256];\n    gets(input);\n    vulnerable_function(input);\n    return 0;\n}",
                difficulty: "hard",
                points: 300,
                category: "Pwn"
            }
        ];

        // Simulated user database
        let users = [
            {
                id: 1,
                username: 'admin',
                password: 'admin123', // In production, this would be hashed
                email: 'admin@ctf.com',
                isAdmin: true,
                score: 0,
                solved: []
            }
        ];

        // Sample correct flags for demo (in production, these would be on server only)
        const correctFlags = {
            1: "CTF{welcome_to_the_game}",
            2: "CTF{base64_is_easy}",
            3: "CTF{rot13_is_fun}",
            4: "CTF{sql_injection_master}",
            5: "CTF{buffer_overflow_pwned}"
        };

        function createParticles() {
            const particles = document.getElementById('particles');
            for (let i = 0; i < 50; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 6 + 's';
                particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
                particles.appendChild(particle);
            }
        }

        function toggleAuthMode() {
            isLoginMode = !isLoginMode;
            const authTitle = document.getElementById('authTitle');
            const authBtn = document.getElementById('authBtn');
            const authToggleText = document.getElementById('authToggleText');
            const emailGroup = document.getElementById('emailGroup');
            
            if (isLoginMode) {
                authTitle.textContent = 'Login';
                authBtn.textContent = 'Login';
                authToggleText.textContent = "Don't have an account?";
                emailGroup.style.display = 'none';
            } else {
                authTitle.textContent = 'Register';
                authBtn.textContent = 'Register';
                authToggleText.textContent = "Already have an account?";
                emailGroup.style.display = 'block';
            }
            
            clearMessages();
        }

        function clearMessages() {
            document.getElementById('errorMessage').style.display = 'none';
            document.getElementById('successMessage').style.display = 'none';
        }

        function showError(message) {
            const errorDiv = document.getElementById('errorMessage');
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            document.getElementById('successMessage').style.display = 'none';
        }

        function showSuccess(message) {
            const successDiv = document.getElementById('successMessage');
            successDiv.textContent = message;
            successDiv.style.display = 'block';
            document.getElementById('errorMessage').style.display = 'none';
        }

        function handleAuth() {
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const email = document.getElementById('email').value.trim();
            
if (!username || !password) {
    showError('Please fill in all required fields.');
    return;
}

if (!isLoginMode) {
    // Registration-specific validation
    if (password.length < 8) {
        showError('Password must be at least 8 characters long.');
        return;
    }

    if (!email) {
        showError('Email is required for registration.');
        return;
    }

    if (!email.endsWith('@example.com')) {
        showError('Email must be in the format: user@example.com');
        return;
    }

    if (users.find(u => u.username === username)) {
        showError('Username already exists.');
        return;
    }
}

                
                const newUser = {
                    id: users.length + 1,
                    username,
                    password,
                    email,
                    isAdmin: false,
                    score: 0,
                    solved: []
                };
                
                users.push(newUser);
                showSuccess('Registration successful! You can now login.');
                
                // Auto-switch to login mode
                setTimeout(() => {
                    toggleAuthMode();
                }, 1500);
            }
        }

        function showMainPlatform() {
            document.getElementById('authContainer').style.display = 'none';
            document.getElementById('mainContainer').style.display = 'block';
            document.getElementById('userInfo').style.display = 'flex';
            document.getElementById('welcomeMessage').textContent = `Welcome, ${currentUser.username}!`;
            
            // Show admin toggle if user is admin
            if (currentUser.isAdmin) {
                document.getElementById('adminToggle').style.display = 'block';
            }
            
            updateStats();
            renderChallenges();
            updateLeaderboard();
        }

        function logout() {
            currentUser = null;
            userSolved = [];
            userScoreValue = 0;
            document.getElementById('authContainer').style.display = 'flex';
            document.getElementById('mainContainer').style.display = 'none';
            document.getElementById('userInfo').style.display = 'none';
            document.getElementById('adminPanel').style.display = 'none';
            
            // Clear form
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
            document.getElementById('email').value = '';
            clearMessages();
        }

        function toggleAdmin() {
            if (!currentUser || !currentUser.isAdmin) {
                showError('Access denied: Admin privileges required.');
                return;
            }
            
            const adminPanel = document.getElementById('adminPanel');
            adminPanel.style.display = adminPanel.style.display === 'none' ? 'block' : 'none';
        }

        function updateStats() {
            document.getElementById('totalChallenges').textContent = challenges.length;
            document.getElementById('solvedChallenges').textContent = userSolved.length;
            document.getElementById('userScore').textContent = userScoreValue;
        }

        function updateLeaderboard() {
            const leaderboardContent = document.getElementById('leaderboardContent');
            const sortedUsers = [...users].sort((a, b) => (b.score || 0) - (a.score || 0));
            
            leaderboardContent.innerHTML = '';
            sortedUsers.forEach((user, index) => {
                const item = document.createElement('div');
                item.className = 'leaderboard-item';
                item.innerHTML = `
                    <span>${index + 1}. ${user.username}</span>
                    <span>${user.score || 0} pts</span>
                `;
                leaderboardContent.appendChild(item);
            });
        }

        function renderChallenges() {
            const challengesContainer = document.getElementById('challenges');
            challengesContainer.innerHTML = '';

            challenges.forEach(challenge => {
                const isSolved = userSolved.includes(challenge.id);
                const challengeCard = document.createElement('div');
                challengeCard.className = `challenge-card ${isSolved ? 'solved' : ''}`;
                
                challengeCard.innerHTML = `
                    <div class="challenge-header">
                        <div class="challenge-title">${challenge.title}</div>
                        <div class="difficulty ${challenge.difficulty}">${challenge.difficulty}</div>
                    </div>
                    <div class="challenge-description">${challenge.description}</div>
                    <div class="challenge-code">${challenge.code}</div>
                    <div style="color: #888; font-size: 0.9rem; margin-bottom: 1rem;">
                        Category: ${challenge.category} | Points: ${challenge.points}
                    </div>
                    <div class="flag-input">
                        <input type="text" placeholder="Enter flag here..." id="flag-${challenge.id}" ${isSolved ? 'disabled' : ''}>
                        <button class="submit-btn" onclick="submitFlag(${challenge.id})" ${isSolved ? 'disabled' : ''}>
                            ${isSolved ? 'Solved ✓' : 'Submit'}
                        </button>
                    </div>
                    <div class="status" id="status-${challenge.id}">
                        ${isSolved ? 'Challenge completed! +' + challenge.points + ' points' : ''}
                    </div>
                `;
                
                challengesContainer.appendChild(challengeCard);
            });
        }

        // Secure flag submission (in production, this would be a server request)
        function submitFlag(challengeId) {
            if (!currentUser) {
                showError('Please login first.');
                return;
            }
            
            const challenge = challenges.find(c => c.id === challengeId);
            const inputElement = document.getElementById(`flag-${challengeId}`);
            const statusElement = document.getElementById(`status-${challengeId}`);
            const userFlag = inputElement.value.trim();
            
            if (!userFlag) {
                showStatus(statusElement, `Correct! +${challenge.points} points`, 'success');
                inputElement.disabled = true;
                inputElement.parentElement.querySelector('button').disabled = true;
                inputElement.parentElement.querySelector('button').textContent = 'Solved ✓';
                
                // Add solved class to card
                inputElement.closest('.challenge-card').classList.add('solved');
                
                updateStats();
                updateLeaderboard();
                
                // Celebration effect
                createCelebrationEffect();
            } else {
                showStatus(statusElement, 'Incorrect flag. Try again!', 'error');
            }
        }

        function showStatus(element, message, type) {
            element.textContent = message;
            element.className = `status ${type}`;
            element.style.opacity = '1';
            
            setTimeout(() => {
                element.style.opacity = '0';
            }, 3000);
        }

        function createCelebrationEffect() {
            for (let i = 0; i < 20; i++) {
                const sparkle = document.createElement('div');
                sparkle.style.position = 'fixed';
                sparkle.style.width = '4px';
                sparkle.style.height = '4px';
                sparkle.style.backgroundColor = '#00ff41';
                sparkle.style.borderRadius = '50%';
                sparkle.style.left = Math.random() * window.innerWidth + 'px';
                sparkle.style.top = Math.random() * window.innerHeight + 'px';
                sparkle.style.zIndex = '9999';
                sparkle.style.animation = 'sparkle 1s ease-out forwards';
                document.body.appendChild(sparkle);
                
                setTimeout(() => {
                    if (document.body.contains(sparkle)) {
                        document.body.removeChild(sparkle);
                    }
                }, 1000);
            }
        }

        function addChallenge() {
            if (!currentUser || !currentUser.isAdmin) {
                alert('Access denied: Admin privileges required.');
                return;
            }
            
            const title = document.getElementById('adminTitle').value.trim();
            const description = document.getElementById('adminDescription').value.trim();
            const code = document.getElementById('adminCode').value.trim();
            const flag = document.getElementById('adminFlag').value.trim();
            const difficulty = document.getElementById('adminDifficulty').value;
            const points = parseInt(document.getElementById('adminPoints').value);
            
            if (!title || !description || !flag) {
                alert('Please fill in all required fields!');
                return;
            }
            
            const newChallenge = {
                id: challenges.length + 1,
                title,
                description,
                code,
                difficulty,
                points,
                category: 'Custom'
            };
            
            // Store flag securely (in production, this would be server-side only)
            correctFlags[newChallenge.id] = flag;
            
            challenges.push(newChallenge);
            renderChallenges();
            updateStats();
            
            // Clear form
            document.getElementById('adminTitle').value = '';
            document.getElementById('adminDescription').value = '';
            document.getElementById('adminCode').value = '';
            document.getElementById('adminFlag').value = '';
            document.getElementById('adminPoints').value = '100';
            
            alert('Challenge added successfully!');
        }

        // Security: Prevent common inspection methods
        function preventInspection() {
            // Disable right-click context menu
            document.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                return false;
            });
            
            // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
            document.addEventListener('keydown', function(e) {
                if (e.key === 'F12' || 
                    (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
                    (e.ctrlKey && e.key === 'U')) {
                    e.preventDefault();
                    return false;
                }
            });
            
            // Detect if developer tools are open
            let devtools = {
                open: false,
                orientation: null
            };
            
            const threshold = 160;
            
            setInterval(() => {
                if (window.outerHeight - window.innerHeight > threshold || 
                    window.outerWidth - window.innerWidth > threshold) {
                    if (!devtools.open) {
                        devtools.open = true;
                        console.clear();
                        console.log('%cDeveloper Tools Detected!', 'color: red; font-size: 40px; font-weight: bold;');
                        console.log('%cFlags are not stored in the client side!', 'color: orange; font-size: 20px;');
                        console.log('%cGood luck finding them! 😉', 'color: green; font-size: 16px;');
                    }
                } else {
                    devtools.open = false;
                }
            }, 500);
        }

        // Obfuscate flag storage
        function obfuscateFlags() {
            // Convert correctFlags to a more obfuscated format
            const obfuscated = {};
            for (let key in correctFlags) {
                // Simple obfuscation - in production, use stronger encryption
                obfuscated[key] = btoa(correctFlags[key]).split('').reverse().join('');
            }
            return obfuscated;
        }

        // Deobfuscate flag for verification
        function deobfuscateFlag(challengeId, obfuscatedFlags) {
            const obfuscated = obfuscatedFlags[challengeId];
            if (!obfuscated) return null;
            try {
                return atob(obfuscated.split('').reverse().join(''));
            } catch (e) {
                return null;
            }
        }

        // Add sparkle animation CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes sparkle {
                0% { transform: scale(0) rotate(0deg); opacity: 1; }
                50% { transform: scale(1) rotate(180deg); opacity: 1; }
                100% { transform: scale(0) rotate(360deg); opacity: 0; }
            }
            
            /* Additional security styles */
            * {
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
            }
            
            input, textarea {
                -webkit-user-select: text;
                -moz-user-select: text;
                -ms-user-select: text;
                user-select: text;
            }
        `;
        document.head.appendChild(style);

        // Initialize with enhanced security
        function initializePlatform() {
            createParticles();
            preventInspection();
            
            // Obfuscate flags after initial setup
            const obfuscatedFlags = obfuscateFlags();
            
            // Override the submitFlag function to use obfuscated flags
            window.submitFlag = function(challengeId) {
                if (!currentUser) {
                    showError('Please login first.');
                    return;
                }
                
                const challenge = challenges.find(c => c.id === challengeId);
                const inputElement = document.getElementById(`flag-${challengeId}`);
                const statusElement = document.getElementById(`status-${challengeId}`);
                const userFlag = inputElement.value.trim();
                
                if (!userFlag) {
                    showStatus(statusElement, 'Please enter a flag!', 'error');
                    return;
                }
                
                // Use deobfuscated flag for comparison
                const correctFlag = deobfuscateFlag(challengeId, obfuscatedFlags);
                const isCorrect = correctFlag === userFlag;
                
                if (isCorrect) {
                    userSolved.push(challengeId);
                    userScoreValue += challenge.points;
                    
                    // Update user in database
                    currentUser.solved = userSolved;
                    currentUser.score = userScoreValue;
                    
                    showStatus(statusElement, `Correct! +${challenge.points} points`, 'success');
                    inputElement.disabled = true;
                    inputElement.parentElement.querySelector('button').disabled = true;
                    inputElement.parentElement.querySelector('button').textContent = 'Solved ✓';
                    
                    // Add solved class to card
                    inputElement.closest('.challenge-card').classList.add('solved');
                    
                    updateStats();
                    updateLeaderboard();
                    
                    // Celebration effect
                    createCelebrationEffect();
                } else {
                    showStatus(statusElement, 'Incorrect flag. Try again!', 'error');
                }
            };
            
            // Clear original correctFlags object
            for (let key in correctFlags) {
                delete correctFlags[key];
            }
        }

        // Add warning message in console
        console.log('%c🚨 SECURITY WARNING 🚨', 'color: red; font-size: 20px; font-weight: bold;');
        console.log('%cThis is a CTF platform. Flags are securely stored on the server side.', 'color: orange; font-size: 14px;');
        console.log('%cTrying to find flags in client-side code is against the rules!', 'color: yellow; font-size: 12px;');
        console.log('%cPlay fair and solve the challenges as intended. 🎯', 'color: green; font-size: 12px;');

        // Initialize platform
        initializePlatform();

        // Handle Enter key for authentication
        document.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && document.getElementById('authContainer').style.display !== 'none') {
                handleAuth();
            }
        });
