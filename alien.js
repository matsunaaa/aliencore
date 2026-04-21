// ==========================================
// NULL_OS // ALIEN CREW THEATRE ENGINE V2.0
// ==========================================

// --- 1. DATA STRUCTURE ---
const aliensData = [
    {
        id: 'alien1',
        name: 'ZORB',
        race: 'SILICON_BASED',
        role: 'CAPACITOR_THIEF',
        desc: 'EATS 10K RESISTORS. DO NOT LEAVE COMPONENTS UNATTENDED.',
        imgSrc: 'IMG_ZORB.png', // RENDER FALLBACK IF MISSING
        sprite: new Image(),
        color: '#ff8ba7', 
        x: 150, y: 350, width: 60, height: 60,
        dialogues: [
            "BZzt... ANY 555 TIMERS?",
            "FORBIDDEN TECH. DELICIOUS.",
            "COMPILING STOLEN ASSETS..."
        ]
    },
    {
        id: 'alien2',
        name: 'GLITCH',
        race: 'UNKNOWN_ERROR',
        role: 'OBSERVER',
        desc: 'STARES AT EARTH HARDWARE. NO BLINKING DETECTED.',
        imgSrc: 'IMG_GLITCH.png',
        sprite: new Image(),
        color: '#8bd3dd',
        x: 550, y: 380, width: 50, height: 50,
        dialogues: [
            "...",
            "[ANALYZING_SOLDERING_JOINTS]",
            "CONCLUSION: SUB-OPTIMAL.",
            "AESTHETIC OF CHAOS ACCEPTED."
        ]
    }
];

// PRE-LOAD SPRITES
aliensData.forEach(alien => alien.sprite.src = alien.imgSrc);

// --- 2. GAME LOOP & RENDERING ---
const canvas = document.getElementById('crew-canvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 500;

let selectedAlien = null;
let audioInit = false;

function renderScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // DRAW FLOOR
    ctx.strokeStyle = '#594a4e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 440);
    ctx.lineTo(800, 440);
    ctx.stroke();

    // RENDER CREW
    aliensData.forEach(alien => {
        const breathe = Math.sin(Date.now() / 300) * 2;
        
        if (selectedAlien === alien) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 4;
            ctx.strokeRect(alien.x - 2, alien.y - breathe - 2, alien.width + 4, alien.height + 4);
        }

        if (alien.sprite.complete && alien.sprite.naturalWidth !== 0) {
            ctx.imageSmoothingEnabled = false; // KEEP PIXELS SHARP
            ctx.drawImage(alien.sprite, alien.x, alien.y - breathe, alien.width, alien.height);
        } else {
            ctx.fillStyle = alien.color;
            ctx.fillRect(alien.x, alien.y - breathe, alien.width, alien.height);
        }
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText(alien.name, alien.x + alien.width/2, alien.y - 15 - breathe);
    });

    requestAnimationFrame(renderScene);
}
renderScene();

// --- 3. MOUSE INTERACTION ---
canvas.addEventListener('mousedown', (e) => {
    // INIT AUDIO ON FIRST CLICK
    if (!audioInit) {
        const bgm = document.getElementById('crew-bgm');
        if(bgm) { bgm.volume = 0.5; bgm.play().catch(() => {}); }
        audioInit = true;
    }

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    let clickedAlien = null;

    for (let alien of aliensData) {
        if (mouseX >= alien.x && mouseX <= alien.x + alien.width &&
            mouseY >= alien.y && mouseY <= alien.y + alien.height) {
            clickedAlien = alien;
            break;
        }
    }

    if (clickedAlien) {
        openIDCard(clickedAlien);
    } else {
        closeIDCard();
        if (TheatreEngine.isPlaying) {
            TheatreEngine.endScript(); 
        }
    }
});

// --- 4. UI PANELS ---
const idPanel = document.getElementById('id-card-panel');

function openIDCard(alien) {
    selectedAlien = alien;
    document.getElementById('card-mugshot').style.backgroundColor = alien.color;
    document.getElementById('card-mugshot').innerText = alien.name;
    document.getElementById('card-name').innerText = alien.name;
    document.getElementById('card-race').innerText = alien.race;
    document.getElementById('card-role').innerText = alien.role;
    document.getElementById('card-desc').innerText = alien.desc;
    
    // LINK ID CARD BUTTON TO THEATRE ENGINE
    document.getElementById('talk-btn').onclick = () => {
        let dynamicScript = "";
        alien.dialogues.forEach(line => dynamicScript += `[${alien.name}] ${line}\n`);
        TheatreEngine.loadScript(dynamicScript.trim());
    };
    
    idPanel.classList.remove('hidden');
}

function closeIDCard() {
    selectedAlien = null;
    idPanel.classList.add('hidden');
}

// --- 5. THEATRE ENGINE (PARSER & PLAYER) ---
const TheatreEngine = {
    scriptLines: [],
    currentIndex: 0,
    isPlaying: false,
    isTyping: false,   // 🌟 新增：检测是否正在打字
    skipTyping: false, // 🌟 新增：是否触发跳过打字
    
    // 使用 Getter 动态获取 DOM，彻底杜绝找不到元素的问题
    get boxEl() { return document.getElementById('dialogue-box'); },
    get speakerEl() { return document.getElementById('speaker-name'); },
    get textEl() { return document.getElementById('dialogue-text'); },
    get nextBtn() { return document.getElementById('next-dialogue-btn'); },

    init: function() {
        // 🌟 核心升级：把点击事件绑定在整个对话框上！
        this.boxEl.addEventListener('click', (e) => {
            e.stopPropagation(); // 防止点击穿透到后面的外星人
            
            if (this.isPlaying) {
                if (this.isTyping) {
                    // 如果正在打字，点击则瞬间显示全句
                    this.skipTyping = true;
                } else {
                    // 如果打字完毕，点击则进入下一句
                    this.nextLine();
                }
            }
        });
    },

    loadScript: function(rawText) {
        this.scriptLines = rawText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        this.currentIndex = 0;
        this.isPlaying = true;
        this.boxEl.classList.remove('hidden');
        closeIDCard(); // 开始对话时隐藏 ID 卡
        this.nextLine();
    },

    nextLine: function() {
        if (this.currentIndex >= this.scriptLines.length) {
            this.endScript();
            return;
        }
        const line = this.scriptLines[this.currentIndex++];
        this.processLine(line);
    },

    processLine: function(line) {
        // 解析系统指令
        if (line.startsWith('>>>')) {
            const cmdData = line.substring(3).trim();
            const sepIdx = cmdData.indexOf(':');
            const cmd = sepIdx !== -1 ? cmdData.substring(0, sepIdx).trim() : cmdData;
            
            if (cmd === 'ACTION' && cmdData.includes('SCREEN GLITCH')) {
                document.body.style.filter = "invert(1) hue-rotate(180deg)";
                setTimeout(() => document.body.style.filter = "none", 150);
                setTimeout(() => document.body.style.filter = "invert(1) hue-rotate(180deg)", 250);
                setTimeout(() => document.body.style.filter = "none", 400);
            }
            // 指令执行完瞬间执行下一行
            this.nextLine();
            return;
        }

        // 解析对话
        const match = line.match(/^\[(.*?)\]\s*(.*)$/);
        if (match) {
            this.showDialogue(match[1], match[2]);
        } else {
            this.showDialogue('SYSTEM', line);
        }
    },

    showDialogue: function(speaker, text) {
        this.speakerEl.innerText = speaker;
        this.nextBtn.style.display = 'none';
        this.textEl.innerHTML = '';
        
        this.isTyping = true;
        this.skipTyping = false;
        let i = 0;
        
        // 健壮的打字机箭头函数
        const typeWriter = () => {
            // 如果用户触发了跳过，直接显示完整文字
            if (this.skipTyping) {
                this.textEl.innerHTML = text;
                this.isTyping = false;
                this.nextBtn.style.display = 'block';
                return;
            }

            if (i < text.length) {
                this.textEl.innerHTML = text.substring(0, i+1) + '<span class="cursor">_</span>';
                i++;
                setTimeout(typeWriter, 30); // 这里的数字是打字速度
            } else {
                this.textEl.innerHTML = text;
                this.isTyping = false;
                this.nextBtn.style.display = 'block';
            }
        };
        typeWriter();
    },

    endScript: function() {
        this.isPlaying = false;
        this.isTyping = false;
        this.boxEl.classList.add('hidden');
        
        this.boxEl.style.bottom = '-200px'; 
        this.textEl.innerHTML = '';
        this.speakerEl.innerText = '';
        console.log("SYS_MSG: SCRIPT_TERMINATED");
    }
};

TheatreEngine.init();

// --- 6. DATABANKS EPISODE LOADER (DYNAMIC FETCH) ---
// CALLED BY HTML BUTTONS
async function loadEpisode(filename) {
    console.log(`SYS_MSG: INITIATING UPLINK TO episodes/${filename}...`);
    
    try {
        // Fetch the text file from the episodes directory
        const response = await fetch(`episodes/${filename}`);
        
        // Check if the file actually exists and loaded correctly
        if (!response.ok) {
            throw new Error(`HTTP_ERR: ${response.status} - COMPONENT_MISSING`);
        }
        
        // Extract the raw text
        const scriptText = await response.text();
        
        // Feed it into the Theatre Engine
        TheatreEngine.loadScript(scriptText.trim());
        
    } catch (error) {
        console.error("SYS_ERR: DATABANK CORRUPTION DETECTED.", error);
        
        // In-universe fallback script if the file is missing or blocked
        const errorScript = `
[SYSTEM] >>> ERROR 404: DATABANK CORRUPTED.
[GLITCH] I CANNOT FIND THE REQUESTED FILE IN SECTOR 'episodes'.
[ZORB] I DEFINITELY DID NOT EAT IT. (BURPS IN BINARY)
>>> ACTION: SCREEN GLITCH
        `;
        TheatreEngine.loadScript(errorScript.trim());
    }
}