// =================================================================
// 步驟一：模擬成績數據接收 (修改版)
// -----------------------------------------------------------------

// 確保這是全域變數
let finalScore = 0; 
let maxScore = 0;
let scoreText = ""; // 用於 p5.js 繪圖的文字
let percentage = 0; // 用於驅動特效的全域百分比

// 煙火特效所需的全域變數
let fireworks = [];
let gravity;

window.addEventListener('message', function (event) {
    // 執行來源驗證...
    // ...
    const data = event.data;
    
    if (data && data.type === 'H5P_SCORE_RESULT') {
        
        // !!! 關鍵步驟：更新全域變數 !!!
        finalScore = data.score;
        maxScore = data.maxScore;
        scoreText = `最終成績分數: ${finalScore}/${maxScore}`;
        
        // 計算百分比
        if (maxScore > 0) {
            percentage = (finalScore / maxScore) * 100;
        } else {
            percentage = 0;
        }
        
        console.log("新的分數已接收:", scoreText, "百分比:", percentage); 
        
        // ----------------------------------------
        // 關鍵步驟 2: 根據分數控制 p5.js 的循環
        // ----------------------------------------
        if (percentage === 100 && finalScore > 0) {
            // 如果是 100 分，啟動 loop()
            if (typeof loop === 'function') {
                loop(); 
            }
        } else {
            // 否則，停止 loop() 並清除舊煙火
            if (typeof noLoop === 'function') {
                noLoop();
                fireworks = []; // 清空煙火
            }
            // 並且手動重繪一次靜態畫面
            if (typeof redraw === 'function') {
                redraw(); 
            }
        }
    }
}, false);


// =================================================================
// 步驟二：p5.js 設置
// -----------------------------------------------------------------

function setup() { 
    createCanvas(windowWidth / 2, windowHeight / 2); 
    gravity = createVector(0, 0.2); // 設定重力
    colorMode(RGB); // 確保顏色模式為 RGB
    background(255); 
    noLoop(); // 預設停止循環，等待分數
} 

// =================================================================
// 步驟三：p5.js 繪圖 (Draw) 函數 (修改版)
// -----------------------------------------------------------------

function draw() { 
    
    // -----------------------------------------------------------------
    // A. 根據是否 100% 來決定背景
    // -----------------------------------------------------------------
    colorMode(RGB); // 重設顏色模式
    if (percentage === 100) {
        // 100分時，使用半透明黑色背景，製造煙火拖尾效果
        background(0, 25); 
    } else {
        // 其他分數時，使用原本的白色背景
        background(255);
    }

    // -----------------------------------------------------------------
    // B. 繪製您原本的成績文本
    // -----------------------------------------------------------------
    
    // (您原本的程式碼)
    textSize(80); 
    textAlign(CENTER);
    
    if (percentage >= 90) {
        fill(0, 200, 50); 
        text("恭喜！優異成績！", width / 2, height / 2 - 50);
    } else if (percentage >= 60) {
        fill(255, 181, 35); 
        text("成績良好，請再接再厲。", width / 2, height / 2 - 50);
    } else if (percentage > 0) {
        fill(200, 0, 0); 
        text("需要加強努力！", width / 2, height / 2 - 50);
    } else {
        fill(150);
        text(scoreText, width / 2, height / 2); // 顯示 "最終成績分數: 0/0"
    }

    // 顯示具體分數 (*** 關鍵修改 ***)
    textSize(50);
    
    // 如果是 100% (黑色背景)，分數文字改為白色，否則用原本的深灰色
    if (percentage === 100) {
        fill(255); // 白色
    } else {
        fill(50); // 深灰色
    }
    text(`得分: ${finalScore}/${maxScore}`, width / 2, height / 2 + 50);
    
    
    // -----------------------------------------------------------------
    // C. 繪製您原本的幾何圖形
    // -----------------------------------------------------------------
    
    // (您原本的程式碼，稍作調整以在黑色背景下也好看)
    if (percentage >= 90) {
        // 畫一個大圓圈代表完美 (100% 時也會顯示)
        fill(0, 200, 50, 150); 
        noStroke();
        circle(width / 2, height / 2 + 150, 150);
        
    } else if (percentage >= 60) {
        // 畫一個方形
        fill(255, 181, 35, 150);
        rectMode(CENTER);
        noStroke();
        rect(width / 2, height / 2 + 150, 150, 150);
    }
    
    
    // -----------------------------------------------------------------
    // D. 煙火特效繪製與更新 (僅在 100% 時執行)
    // -----------------------------------------------------------------
    
    if (percentage === 100) {
        
        // 切換到 HSB 模式以便於產生隨機彩色
        colorMode(HSB); 
        
        // 隨機在底部發射新的煙火
        if (random(1) < 0.04) {
            fireworks.push(new Particle(random(width), height, random(255), true));
        }
        
        // 迭代更新所有粒子 (從後往前刪除才安全)
        for (let i = fireworks.length - 1; i >= 0; i--) {
            fireworks[i].applyForce(gravity);
            fireworks[i].update();
            fireworks[i].show();
            
            // 如果是主火箭且速度歸零 (到達頂點)
            if (fireworks[i].isRocket && fireworks[i].vel.y >= 0) {
                let pos = fireworks[i].pos;
                let hu = fireworks[i].hu;
                explode(pos.x, pos.y, hu); // 在該點引爆
                fireworks.splice(i, 1); // 移除主火箭
            } 
            // 如果粒子生命週期結束
            else if (fireworks[i].isDone()) {
                fireworks.splice(i, 1); // 移除粒子
            }
        }
    }
}


// =================================================================
// 步驟四：煙火相關的輔助功能
// -----------------------------------------------------------------

/**
 * 在指定位置產生爆炸效果
 * @param {number} x - 爆炸 x 座標
 * @param {number} y - 爆炸 y 座標
 * @param {number} hu - 爆炸的 HSB 色相 (0-255)
 */
function explode(x, y, hu) {
    // 產生 100 個爆炸粒子
    for (let i = 0; i < 100; i++) {
        fireworks.push(new Particle(x, y, hu, false));
    }
}


/**
 * 粒子 (Particle) 類別
 * * @param {number} x - 初始 x 座標
 * @param {number} y - 初始 y 座標
 * @param {number} hu - HSB 色相 (0-255)
 * @param {boolean} isRocket - true: 這是上升的主火箭, false: 這是爆炸的火花
 */
function Particle(x, y, hu, isRocket) {
    this.pos = createVector(x, y);
    this.isRocket = isRocket;
    this.lifespan = 255; // 生命週期，用於淡出
    this.hu = hu;
    
    if (this.isRocket) {
        // 主火箭：從底部垂直向上發射
        this.vel = createVector(0, random(-18, -12));
    } else {
        // 爆炸火花：隨機 2D 向量
        this.vel = p5.Vector.random2D().mult(random(2, 10));
    }
    
    this.acc = createVector(0, 0); // 加速度
    
    // 施加力 (例如重力)
    this.applyForce = function(force) {
        this.acc.add(force);
    }
    
    // 更新粒子狀態
    this.update = function() {
        if (!this.isRocket) {
            // 爆炸火花才有空氣阻力
            this.vel.mult(0.9);
            // 並且會淡出
            this.lifespan -= 4;
        }
        
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0); // 清除加速度
    }
    
    // 檢查粒子是否已結束
    this.isDone = function() {
        return (this.lifespan < 0);
    }
    
    // 顯示粒子
    this.show = function() {
        // HSB 模式 (在 draw() 中已設定)
        
        if (!this.isRocket) {
            // 爆炸火花
            strokeWeight(2);
            stroke(this.hu, 255, 255, this.lifespan); // 帶透明度
        } else {
            // 主火箭
            strokeWeight(4);
            stroke(this.hu, 255, 255);
        }
        
        point(this.pos.x, this.pos.y);
    }
}
