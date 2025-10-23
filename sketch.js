// =================================================================
// 步驟一：模擬成績數據接收
// -----------------------------------------------------------------


// let scoreText = "成績分數: " + finalScore + "/" + maxScore;
// 確保這是全域變數
let finalScore = 0; 
let maxScore = 0;
let scoreText = ""; // 用於 p5.js 繪圖的文字

// 【新增】煙花特效相關的全域變數
let fireworks = []; // 用於儲存煙花粒子的陣列
let triggerFirework = false; // 追蹤是否需要觸發煙花

window.addEventListener('message', function (event) {
    // 執行來源驗證...
    // ...
    const data = event.data;
    
    if (data && data.type === 'H5P_SCORE_RESULT') {
        
        // !!! 關鍵步驟：更新全域變數 !!!
        finalScore = data.score; // 更新全域變數
        maxScore = data.maxScore;
        scoreText = `最終成績分數: ${finalScore}/${maxScore}`;
        
        console.log("新的分數已接收:", scoreText); 
        
        // 【新增】檢查是否達到煙花條件 (正確率 > 80%)
        let percentage = (maxScore > 0) ? (finalScore / maxScore) * 100 : 0;
        if (percentage > 80) {
            triggerFirework = true;
            // 立即觸發一次煙花爆炸
            createFirework(width / 2, height / 2);
        } else {
            triggerFirework = false;
        }

        // ----------------------------------------
        // 關鍵步驟 2: 呼叫重新繪製 (見方案二)
        // ----------------------------------------
        if (typeof redraw === 'function') {
            redraw(); 
        }
    }
}, false);


// =================================================================
// 步驟二：使用 p5.js 繪製分數 (在網頁 Canvas 上顯示)
// -----------------------------------------------------------------

function setup() { 
    // ... (其他設置)
    createCanvas(windowWidth / 2, windowHeight / 2); 
    background(255); 
    
    // 【修改】如果需要煙花動畫，需要啟用 loop()，或者在 draw() 中處理 noLoop() 邏輯。
    // 這裡我們預設啟用 loop() 來支持動畫，除非分數尚未收到。
    loop(); 
    
    // 啟用 HSB 顏色模式，方便製作五顏六色的煙花
    colorMode(HSB, 360, 100, 100, 100); 
} 


// =================================================================
// 【新增】步驟三：煙花粒子類別與函數
// -----------------------------------------------------------------

// 煙花粒子類別 (簡化版)
class Particle {
    constructor(x, y, hu) {
        this.pos = createVector(x, y);
        // 賦予隨機初始速度，模擬爆炸效果
        this.vel = p5.Vector.random2D();
        this.vel.mult(random(2, 6)); 
        this.acc = createVector(0, 0.1); // 簡化重力
        this.lifespan = 255;
        this.hu = hu; // 色相
        this.brightness = random(70, 100);
    }

    update() {
        this.vel.add(this.acc); // 施加重力
        this.pos.add(this.vel);
        this.lifespan -= 4; // 逐漸消散
    }

    show() {
        noStroke();
        // 使用 HSB 模式和 lifespan 作為透明度 (alpha)
        fill(this.hu, 100, this.brightness, this.lifespan / 255 * 100); 
        ellipse(this.pos.x, this.pos.y, 4);
    }

    isFinished() {
        return this.lifespan < 0;
    }
}

// 創建煙花粒子
function createFirework(x, y) {
    let hu = random(360); // 隨機色相
    for (let i = 0; i < 100; i++) {
        // 創建 100 個粒子，共享同一色相
        fireworks.push(new Particle(x, y, hu)); 
    }
}


// score_display.js 中的 draw() 函數片段

function draw() { 
    // 【修改】使用半透明背景，留下微弱的粒子殘影，模擬煙花軌跡。
    // 如果沒有觸發煙花，則使用不透明白色背景。
    if (triggerFirework) {
        // 黑色背景，高透明度，模擬夜空與殘影
        background(0, 0, 0, 10); 
    } else {
        // 尚未收到分數或不需要動畫時，保持白色背景
        background(255); 
    }
    
    // 確保只在收到成績後計算
    let percentage = (maxScore > 0) ? (finalScore / maxScore) * 100 : 0;
    
    // -----------------------------------------------------------------
    // C. 煙花特效處理
    // -----------------------------------------------------------------
    if (triggerFirework) {
        // 每 30 幀隨機發射一次新的煙花 (如果得分持續高分)
        if (frameCount % 30 == 0 && random(1) < 0.5) {
            // 在底部或隨機位置發射
            createFirework(random(width), height); 
        }
        
        // 更新和顯示所有粒子
        for (let i = fireworks.length - 1; i >= 0; i--) {
            fireworks[i].update();
            fireworks[i].show();
            if (fireworks[i].isFinished()) {
                // 移除已消散的粒子
                fireworks.splice(i, 1); 
            }
        }
    }
    
    
    // -----------------------------------------------------------------
    // A. 根據分數區間改變文本顏色和內容 (畫面反映一)
    // -----------------------------------------------------------------
    // 【新增】確保文本在煙花之上顯示
    colorMode(RGB); // 將顏色模式切換回 RGB 處理文字和 UI 元素
    textSize(80); 
    textAlign(CENTER);
    
    if (percentage >= 90) {
        // 滿分或高分：顯示鼓勵文本，使用鮮豔顏色
        fill(0, 200, 50); // 綠色 [6]
        text("恭喜！優異成績！", width / 2, height / 2 - 50);
        
    } else if (percentage > 80) { // 【修改】新增 > 80% 的區間 (觸發煙花)
        // 特殊高分：顯示慶祝文本
        fill(255, 215, 0); // 金色
        text("超讚！煙花慶祝中！", width / 2, height / 2 - 50);
        
    } else if (percentage >= 60) {
        // 中等分數：顯示一般文本，使用黃色 [6]
        fill(255, 181, 35); 
        text("成績良好，請再接再厲。", width / 2, height / 2 - 50);
        
    } else if (percentage > 0) {
        // 低分：顯示警示文本，使用紅色 [6]
        fill(200, 0, 0); 
        text("需要加強努力！", width / 2, height / 2 - 50);
        
    } else {
        // 尚未收到分數或分數為 0
        fill(150);
        text(scoreText, width / 2, height / 2);
    }

    // 顯示具體分數
    textSize(50);
    fill(50);
    text(`得分: ${finalScore}/${maxScore}`, width / 2, height / 2 + 50);
    
    
    // -----------------------------------------------------------------
    // B. 根據分數觸發不同的幾何圖形反映 (畫面反映二)
    // -----------------------------------------------------------------
    
    if (percentage >= 90) {
        // 畫一個大圓圈代表完美 [7]
        fill(0, 200, 50, 150); // 帶透明度
        noStroke();
        circle(width / 2, height / 2 + 150, 150);
        
    } else if (percentage >= 60) {
        // 畫一個方形 [4]
        fill(255, 181, 35, 150);
        rectMode(CENTER);
        rect(width / 2, height / 2 + 150, 150, 150);
    }
    
    // 如果沒有觸發動畫，停止 draw() 的循環
    if (!triggerFirework && maxScore > 0) {
        noLoop();
    }
}
