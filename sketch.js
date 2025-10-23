// =================================================================
// 步驟一：模擬成績數據接收
// -----------------------------------------------------------------


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
        
        // 【修改】檢查是否達到煙花條件 (正確率 > 80%)
        let percentage = (maxScore > 0) ? (finalScore / maxScore) * 100 : 0;
        
        // 只有當百分比首次達到 > 80% 時才觸發動畫
        if (percentage > 80 && !triggerFirework) {
            triggerFirework = true;
            loop(); // 確保 draw() 開始持續循環
            // 【強化】初始觸發時發射多組煙花
            for (let i = 0; i < 5; i++) {
                // 在畫布頂部隨機位置發射
                createFirework(random(width), random(height / 4)); 
            }
        } else if (percentage <= 80) {
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
    // 【修改】擴大畫布尺寸至整個視窗
    createCanvas(windowWidth, windowHeight); 
    background(255); 
    
    // 啟用 HSB 顏色模式，方便製作五顏六色的煙花
    colorMode(HSB, 360, 100, 100, 100); 
    
    // 初始狀態應停止循環，直到收到數據
    noLoop(); 
} 

// 當視窗大小改變時，重新調整畫布大小 (增強網頁體驗)
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
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
        this.vel.mult(random(2, 8)); // 【調整】提高速度範圍
        this.acc = createVector(0, 0.1); // 簡化重力
        this.lifespan = 255;
        this.hu = hu; // 色相 (主色)
        // 【調整】讓每個粒子顏色略有不同
        this.brightness = random(50, 100); 
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
    let hu = random(360); // 隨機色相 (五顏六色)
    // 【調整】增加粒子數量
    for (let i = 0; i < 150; i++) {
        // 創建 150 個粒子，共享同一色相
        fireworks.push(new Particle(x, y, hu)); 
    }
}


// score_display.js 中的 draw() 函數片段

function draw() { 
    
    // 【修改】使用半透明黑色背景，確保煙花動畫的夜空效果
    if (triggerFirework) {
        // 黑色背景 (0, 0, 0)，高透明度 (10)，模擬夜空與殘影
        colorMode(RGB); // 使用 RGB 處理背景
        background(0, 0, 0, 10); 
    } else {
        // 尚未收到分數或不需要動畫時，保持白色背景
        colorMode(RGB); // 使用 RGB 處理背景
        background(255); 
    }
    
    // 確保只在收到成績後計算
    let percentage = (maxScore > 0) ? (finalScore / maxScore) * 100 : 0;
    
    // -----------------------------------------------------------------
    // C. 煙花特效處理
    // -----------------------------------------------------------------
    if (triggerFirework) {
        // 【調整】提高發射頻率：每 15 幀隨機發射一次新的煙花
        if (frameCount % 15 == 0 && random(1) < 0.7) {
            // 在畫布上半部分隨機位置發射
            createFirework(random(width), random(height * 0.2, height * 0.8)); 
        }
        
        // 更新和顯示所有粒子
        colorMode(HSB); // 確保在繪製粒子時使用 HSB 模式
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
    
    // 確保文本在煙花之上顯示，並使用 RGB 模式顯示文字
    colorMode(RGB); 
    textSize(width / 15); // 【調整】文字大小根據畫布寬度自動調整
    textAlign(CENTER);
    
    if (percentage >= 90) {
        fill(0, 200, 50); 
        text("恭喜！優異成績！", width / 2, height / 2 - 50);
        
    } else if (percentage > 80) { 
        fill(255, 215, 0); // 金色
        text("超讚！煙花慶祝中！", width / 2, height / 2 - 50);
        
    } else if (percentage >= 60) {
        fill(255, 181, 35); 
        text("成績良好，請再接再厲。", width / 2, height / 2 - 50);
        
    } else if (percentage > 0) {
        fill(200, 0, 0); 
        text("需要加強努力！", width / 2, height / 2 - 50);
        
    } else {
        // 尚未收到分數
        fill(150);
        text(scoreText, width / 2, height / 2);
    }

    // 顯示具體分數
    textSize(width / 20);
    fill(255, 255, 255); // 在黑色背景上，讓分數更明顯
    text(`得分: ${finalScore}/${maxScore}`, width / 2, height / 2 + 50);
    
    
    // -----------------------------------------------------------------
    // B. 根據分數觸發不同的幾何圖形反映 (畫面反映二)
    // -----------------------------------------------------------------
    
    if (percentage >= 90) {
        fill(0, 200, 50, 150); 
        noStroke();
        circle(width / 2, height / 2 + 150, width / 10);
        
    } else if (percentage >= 60) {
        fill(255, 181, 35, 150);
        rectMode(CENTER);
        rect(width / 2, height / 2 + 150, width / 10, width / 10);
    }
    
    // 如果沒有觸發動畫，並且已經收到分數，停止 draw() 的循環
    if (!triggerFirework && maxScore > 0 && finalScore > 0) {
        noLoop();
    }
}
