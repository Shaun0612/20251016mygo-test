// =================================================================
// 步驟一：模擬成績數據接收 (保持不變)
// -----------------------------------------------------------------


// 確保這是全域變數
let finalScore = 0; 
let maxScore = 0;
let scoreText = ""; 
let fireworks = []; 
let triggerFirework = false; 

// 【新增】指向 p5.js 畫布容器的變數
let p5Container; 

window.addEventListener('message', function (event) {
    // ... 執行來源驗證 ...
    const data = event.data;
    
    if (data && data.type === 'H5P_SCORE_RESULT') {
        
        // 更新全域變數
        finalScore = data.score; 
        maxScore = data.maxScore;
        scoreText = `最終成績分數: ${finalScore}/${maxScore}`;
        
        console.log("新的分數已接收:", scoreText); 
        
        let percentage = (maxScore > 0) ? (finalScore / maxScore) * 100 : 0;
        
        // -----------------------------------------------------------------
        // 【關鍵修改】：控制畫布的顯示/隱藏
        // -----------------------------------------------------------------
        if (p5Container) {
            // 無論如何，一旦收到成績，就將畫布顯示出來 (即使成績不好也顯示靜態圖)
            p5Container.style.display = 'block'; 
            p5Container.style.pointerEvents = 'none'; // 預設為穿透
        }

        if (percentage >= 80 && !triggerFirework) {
            triggerFirework = true;
            if (p5Container) {
                 // 如果有動畫，防止點擊穿透到 H5P 內容，以確保動畫流暢
                p5Container.style.pointerEvents = 'auto'; 
            }
            
            // 初始觸發時發射多組煙花
            for (let i = 0; i < 5; i++) {
                createFirework(mySketch.random(mySketch.width), mySketch.random(mySketch.height / 4)); 
            }
        } else if (percentage < 80) { 
            triggerFirework = false;
        }

        // 通知 p5.js 實例進行繪製更新
        if (typeof mySketch.redraw === 'function') {
            mySketch.redraw(); 
        }
    }
}, false);


// =================================================================
// 步驟二：使用 p5.js 實例模式 (Instance Mode)
// -----------------------------------------------------------------

// 煙花粒子類別 (實例模式下不需要傳遞 p)
class Particle {
    constructor(p, x, y, hu) {
        this.p = p; // 儲存 p5 實例
        this.pos = p.createVector(x, y);
        this.vel = p.createVector(p.random(-1, 1), p.random(-1, 1));
        this.vel.mult(p.random(2, 8)); 
        this.acc = p.createVector(0, 0.1); 
        this.lifespan = 255;
        this.hu = hu; 
        this.brightness = p.random(85, 100); 
    }

    update() {
        this.vel.add(this.acc); 
        this.pos.add(this.vel);
        this.lifespan -= 4; 
    }
    
    show() {
        this.p.noStroke();
        this.p.fill(this.hu, 100, this.brightness, this.lifespan / 255 * 100); 
        this.p.ellipse(this.pos.x, this.pos.y, 8); 
    }

    isFinished() {
        return this.lifespan < 0;
    }
}

// 創建煙花粒子 (需要傳遞 p5 實例)
function createFirework(p, x, y) {
    let hu = p.random(360); 
    for (let i = 0; i < 150; i++) {
        fireworks.push(new Particle(p, x, y, hu)); 
    }
}


// -----------------------------------------------------------------
// 定義 p5 實例
// -----------------------------------------------------------------
const sketch = (p) => {
    
    // 將 p5 實例存儲在 mySketch 變數中，供外部調用 (例如 createFirework)
    window.mySketch = p; 

    p.setup = function() { 
        // 取得畫布容器
        p5Container = document.getElementById('p5-container');
        if (!p5Container) {
            // 如果找不到容器，退回到視窗大小並發出警告
            console.error("找不到 ID 為 'p5-container' 的 HTML 元素。畫布將在頁面底部創建。");
            p.createCanvas(p.windowWidth, p.windowHeight); 
        } else {
            // 創建畫布並將其附加到容器中
            p.createCanvas(p5Container.offsetWidth, p5Container.offsetHeight).parent('p5-container');
        }
        
        p.colorMode(p.RGB); 
        p.background(255); 
        p.noLoop(); // 初始停止循環，等待成績
    } 

    p.windowResized = function() {
        if (p5Container) {
            p.resizeCanvas(p5Container.offsetWidth, p5Container.offsetHeight);
        } else {
            p.resizeCanvas(p.windowWidth, p.windowHeight);
        }
    }


    p.draw = function() { 
        
        // -----------------------------------------------------------------
        // A. 背景處理 (圖層 1：夜空背景)
        // -----------------------------------------------------------------
        p.colorMode(p.RGB); 
        
        if (triggerFirework) {
            // 黑色背景 (0, 0, 0)，高透明度 (10)
            p.background(0, 0, 0, 10); 
        } else {
            // 當分數不滿足條件時，清為不透明白色
            p.background(255); 
        }
        
        let percentage = (maxScore > 0) ? (finalScore / maxScore) * 100 : 0;
        
        // -----------------------------------------------------------------
        // B. 煙花特效處理 (圖層 2：粒子動畫)
        // -----------------------------------------------------------------
        if (triggerFirework) {
            
            // 持續發射：每 15 幀隨機發射一次新的煙花
            if (p.frameCount % 15 == 0 && p.random(1) < 0.7) {
                createFirework(p, p.random(p.width), p.random(p.height * 0.2, p.height * 0.8)); 
            }
            
            // 更新和顯示所有粒子
            p.colorMode(p.HSB, 360, 100, 100, 100); 
            
            for (let i = fireworks.length - 1; i >= 0; i--) {
                fireworks[i].update();
                fireworks[i].show();
                if (fireworks[i].isFinished()) {
                    fireworks.splice(i, 1); 
                }
            }
            
            p.loop(); // 確保只要 triggerFirework 為 true，就持續循環
        }
        
        
        // -----------------------------------------------------------------
        // C. 文本和 UI 元素 (圖層 3：最上層，覆蓋所有內容)
        // -----------------------------------------------------------------
        
        p.colorMode(p.RGB); 
        p.textSize(p.width / 15); 
        p.textAlign(p.CENTER);
        
        let textColor = p.color(255, 255, 255); // 白色文字
        
        if (percentage >= 90) {
            p.fill(textColor); 
            p.text("恭喜！優異成績！", p.width / 2, p.height / 2 - 50);
            
        } else if (percentage >= 80) { 
            p.fill(textColor); 
            p.text("超讚！煙花慶祝中！", p.width / 2, p.height / 2 - 50);
            
        } else if (percentage >= 60) {
            p.fill(255, 181, 35); // 中等分數使用黃色
            p.text("成績良好，請再接再厲。", p.width / 2, p.height / 2 - 50);
            
        } else if (percentage > 0) {
            p.fill(200, 0, 0); 
            p.text("需要加強努力！", p.width / 2, p.height / 2 - 50);
            
        } else {
            p.fill(150);
            p.text(scoreText, p.width / 2, p.height / 2);
        }

        // 顯示具體分數
        p.textSize(p.width / 20);
        p.fill(255, 255, 255); 
        p.text(`得分: ${finalScore}/${maxScore}`, p.width / 2, p.height / 2 + 50);
        
        
        // -----------------------------------------------------------------
        // D. 幾何圖形反映 (最上層)
        // -----------------------------------------------------------------
        
        if (percentage >= 90) {
            p.fill(0, 200, 50, 150); 
            p.noStroke();
            p.circle(p.width / 2, p.height / 2 + 150, p.width / 10);
            
        } else if (percentage >= 60) {
            p.fill(255, 181, 35, 150);
            p.rectMode(p.CENTER);
            p.rect(p.width / 2, p.height / 2 + 150, p.width / 10, p.width / 10);
        }
        
        // 只有在分數未達到 80% 且靜態顯示時，才停止循環
        if (!triggerFirework && maxScore > 0 && finalScore > 0) {
            p.noLoop();
        }
    }
}

// 創建 p5.js 實例並啟動
new p5(sketch);
