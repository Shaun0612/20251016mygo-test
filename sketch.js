// =================================================================
// 步驟一：模擬成績數據接收
// -----------------------------------------------------------------


// 確保這是全域變數
let finalScore = 0; 
let maxScore = 0;
let scoreText = ""; 

// 【新增】煙花特效相關的全域變數
let fireworks = []; 
let triggerFirework = false; 

window.addEventListener('message', function (event) {
    // 執行來源驗證...
    // ...
    const data = event.data;
    
    if (data && data.type === 'H5P_SCORE_RESULT') {
        
        // !!! 關鍵步驟：更新全域變數 !!!
        finalScore = data.score; 
        maxScore = data.maxScore;
        scoreText = `最終成績分數: ${finalScore}/${maxScore}`;
        
        console.log("新的分數已接收:", scoreText); 
        
        // 【檢查條件】：得分達到 4/5 (80%) 及以上時觸發
        let percentage = (maxScore > 0) ? (finalScore / maxScore) * 100 : 0;
        
        // 只有當百分比首次達到 >= 80% 時才觸發動畫
        if (percentage >= 80 && !triggerFirework) {
            triggerFirework = true;
            // 由於 setup 中已強制 loop，這裡無需再次呼叫
            
            // 初始觸發時發射多組煙花
            for (let i = 0; i < 5; i++) {
                createFirework(random(width), random(height / 4)); 
            }
        } else if (percentage < 80) { // 低於 80% 時關閉旗標
            triggerFirework = false;
        }

        if (typeof redraw === 'function') {
            redraw(); 
        }
    }
}, false);


// =================================================================
// 步驟二：使用 p5.js 繪製分數 (在網頁 Canvas 上顯示)
// -----------------------------------------------------------------

function setup() { 
    // 擴大畫布尺寸至整個視窗
    createCanvas(windowWidth, windowHeight); 
    
    // 初始設定 colorMode 為 RGB，這是 p5.js 的預設和安全模式
    colorMode(RGB); 
    background(255); 
    
    // 【修改點 3】：強制 loop() 從啟動開始就持續執行
    loop(); 
} 

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}


// =================================================================
// 步驟三：煙花粒子類別與函數
// -----------------------------------------------------------------

class Particle {
    constructor(x, y, hu) {
        this.pos = createVector(x, y);
        this.vel = p5.Vector.random2D();
        this.vel.mult(random(2, 8)); 
        this.acc = createVector(0, 0.1); 
        this.lifespan = 255;
        this.hu = hu; 
        // 【修改點 2】：提高粒子亮度範圍，確保對比度
        this.brightness = random(85, 100); 
    }

    update() {
        this.vel.add(this.acc); 
        this.pos.add(this.vel);
        this.lifespan -= 4; 
    }
    
    show() {
        noStroke();
        fill(this.hu, 100, this.brightness, this.lifespan / 255 * 100); 
        // 【修改點 1】：將粒子大小從 4 增加到 8
        ellipse(this.pos.x, this.pos.y, 8); 
    }

    isFinished() {
        return this.lifespan < 0;
    }
}

function createFirework(x, y) {
    let hu = random(360); 
    for (let i = 0; i < 150; i++) {
        fireworks.push(new Particle(x, y, hu)); 
    }
}


// score_display.js 中的 draw() 函數片段

function draw() { 
    
    // -----------------------------------------------------------------
    // A. 背景處理 (圖層 1：夜空背景)
    // -----------------------------------------------------------------
    // 必須在最前面處理背景清除
    colorMode(RGB); // 確保使用 RGB 處理背景顏色 (0-255)
    
    if (triggerFirework) {
        // 黑色背景 (0, 0, 0)，高透明度 (10)，確保有煙花殘影
        background(0, 0, 0, 10); 
    } else {
        // 當分數不滿足條件時，清為不透明白色
        background(255); 
    }
    
    let percentage = (maxScore > 0) ? (finalScore / maxScore) * 100 : 0;
    
    // -----------------------------------------------------------------
    // B. 煙花特效處理 (圖層 2：粒子動畫)
    // -----------------------------------------------------------------
    if (triggerFirework) {
        
        // 持續發射：每 15 幀隨機發射一次新的煙花
        if (frameCount % 15 == 0 && random(1) < 0.7) {
            createFirework(random(width), random(height * 0.2, height * 0.8)); 
        }
        
        // 更新和顯示所有粒子
        colorMode(HSB, 360, 100, 100, 100); // 切換到 HSB 處理粒子顏色
        
        for (let i = fireworks.length - 1; i >= 0; i--) {
            fireworks[i].update();
            fireworks[i].show();
            if (fireworks[i].isFinished()) {
                fireworks.splice(i, 1); 
            }
        }
    }
    
    
    // -----------------------------------------------------------------
    // C. 文本和 UI 元素 (圖層 3：最上層，覆蓋所有內容)
    // -----------------------------------------------------------------
    
    colorMode(RGB); // 切換回 RGB 處理文本和 UI 顏色
    textSize(width / 15); 
    textAlign(CENTER);
    
    let textColor = color(255, 255, 255); // 白色文字
    
    if (percentage >= 90) {
        fill(textColor); 
        text("恭喜！優異成績！", width / 2, height / 2 - 50);
        
    } else if (percentage >= 80) { 
        fill(textColor); 
        text("超讚！煙花慶祝中！", width / 2, height / 2 - 50);
        
    } else if (percentage >= 60) {
        fill(255, 181, 35); // 中等分數使用黃色
        text("成績良好，請再接再厲。", width / 2, height / 2 - 50);
        
    } else if (percentage > 0) {
        fill(200, 0, 0); 
        text("需要加強努力！", width / 2, height / 2 - 50);
        
    } else {
        fill(150);
        text(scoreText, width / 2, height / 2);
    }

    // 顯示具體分數
    textSize(width / 20);
    fill(255, 255, 255); 
    text(`得分: ${finalScore}/${maxScore}`, width / 2, height / 2 + 50);
    
    
    // -----------------------------------------------------------------
    // D. 幾何圖形反映 (最上層)
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
    
    // 只有在分數未達到 80% 且靜止狀態時才停止循環
    // 注意：即使啟用了 loop()，noLoop() 仍然可以停止它。
    if (!triggerFirework && maxScore > 0 && finalScore > 0) {
        noLoop();
    }
}
