// --- 1. 外星人数据结构 ---
const aliensData = [
    {
        id: 'alien1',
        name: 'ZORB',
        race: 'SILICON_BASED',
        role: 'CAPACITOR_THIEF',
        desc: 'Zorb eats 10k resistors for breakfast. Do not leave components unattended.',
        color: '#ff8ba7', // 占位符颜色，后续换成你的图片
        x: 150, y: 350, width: 50, height: 80,
        dialogues: [
            "BZzt... Do you have any spare 555 timers?",
            "I heard they are forbidden here. Delicious.",
            "I am currently compiling a list of missing components."
        ]
    },
    {
        id: 'alien2',
        name: 'GLITCH',
        race: 'UNKNOWN_ERROR',
        role: 'OBSERVER',
        desc: 'Stares at Earth hardware for hours without blinking.',
        color: '#8bd3dd',
        x: 600, y: 380, width: 60, height: 50,
        dialogues: [
            "...",
            "[ANALYZING_YOUR_SOLDERING_JOINTS]",
            "CONCLUSION: SUB-OPTIMAL.",
            "But I like the aesthetic of chaos."
        ]
    }
];

// --- 2. 核心变量 ---
const canvas = document.getElementById('crew-canvas');
const ctx = canvas.getContext('2d');
let selectedAlien = null;
let dialogueIndex = 0;

// 设置 Canvas 内部分辨率与 CSS 尺寸一致
canvas.width = 800;
canvas.height = 500;

// --- 3. 渲染循环 (Game Loop) ---
function renderScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 清空画布
    
    // 画一条简单的地板线
    ctx.strokeStyle = '#594a4e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 430);
    ctx.lineTo(800, 430);
    ctx.stroke();

    // 绘制所有外星人占位符
    aliensData.forEach(alien => {
        // 简单的心跳动画 (让他看起来在呼吸)
        const breathe = Math.sin(Date.now() / 300) * 2;
        
        ctx.fillStyle = alien.color;
        // 如果被选中，画一个白色的边框高亮
        if (selectedAlien === alien) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 4;
            ctx.strokeRect(alien.x - 2, alien.y - breathe - 2, alien.width + 4, alien.height + 4);
        }
        ctx.fillRect(alien.x, alien.y - breathe, alien.width, alien.height);
        
        // 名字标签
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText(alien.name, alien.x + alien.width/2, alien.y - 15 - breathe);
    });

    requestAnimationFrame(renderScene);
}

// 启动渲染循环
renderScene();

// --- 4. 交互逻辑 (点击检测) ---
canvas.addEventListener('mousedown', (e) => {
    // 获取鼠标在 canvas 里的真实坐标
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let clickedAlien = null;

    // 检查鼠标是否在某个外星人的矩形区域内
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
        // 点击空白处关闭面板
        closeIDCard();
        closeDialogue();
    }
});

// --- 5. UI 控制函数 ---
const idPanel = document.getElementById('id-card-panel');
const dialogueBox = document.getElementById('dialogue-box');

function openIDCard(alien) {
    selectedAlien = alien;
    
    // 填充数据
    document.getElementById('card-mugshot').style.backgroundColor = alien.color;
    document.getElementById('card-mugshot').innerText = alien.name;
    document.getElementById('card-name').innerText = alien.name;
    document.getElementById('card-race').innerText = alien.race;
    document.getElementById('card-role').innerText = alien.role;
    document.getElementById('card-desc').innerText = alien.desc;
    
    // 绑定对话按钮事件
    const talkBtn = document.getElementById('talk-btn');
    talkBtn.onclick = () => startDialogue(alien);
    
    idPanel.classList.remove('hidden');
    closeDialogue(); // 打开 ID 卡时关闭对话框
}

function closeIDCard() {
    selectedAlien = null;
    idPanel.classList.add('hidden');
}

function startDialogue(alien) {
    dialogueIndex = 0;
    document.getElementById('speaker-name').innerText = alien.name;
    
    const textEl = document.getElementById('dialogue-text');
    const nextBtn = document.getElementById('next-dialogue-btn');
    
    // 打字机效果函数
    function typeWriter(text, i, cb) {
        if (i < text.length) {
            textEl.innerHTML = text.substring(0, i+1) + '<span class="cursor">_</span>';
            setTimeout(() => typeWriter(text, i + 1, cb), 30); // 打字速度
        } else {
            textEl.innerHTML = text; // 去掉光标
            if (cb) cb();
        }
    }

    // 显示当前句子的函数
    function showLine() {
        if (dialogueIndex < alien.dialogues.length) {
            nextBtn.style.display = 'none'; // 打字时隐藏 NEXT 按钮
            typeWriter(alien.dialogues[dialogueIndex], 0, () => {
                nextBtn.style.display = 'block'; // 打字结束显示 NEXT
            });
        } else {
            closeDialogue(); // 没话了就关闭
        }
    }

    // 绑定 NEXT 按钮点击
    nextBtn.onclick = () => {
        dialogueIndex++;
        showLine();
    };

    dialogueBox.classList.remove('hidden');
    showLine(); // 显示第一句
}

function closeDialogue() {
    dialogueBox.classList.add('hidden');
}