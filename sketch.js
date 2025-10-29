// =================================================================
// 步驟一：模擬成績數據接收
// -----------------------------------------------------------------

let finalScore = 0; 
let maxScore = 0;
let scoreText = ""; 
// (其他變數不變)
let fireworks = [];        
let fireworksActive = false;
let fireworksDuration = 4000; 
let fireworksStartTime = 0;  

// 新增一個變數來儲存 p5.js Canvas 元素本身
let p5Canvas;

window.addEventListener('message', function (event) {
    // ...
    const data = event.data;
    
    if (data && data.type === 'H5P_SCORE_RESULT') {
        
        // !!! 關鍵步驟：更新全域變數 !!!
        finalScore = data.score; // 更新全域變數
        maxScore = data.maxScore;
        scoreText = `最終成績分數: ${finalScore}/${maxScore}`;
        
        console.log("新的分數已接收:", scoreText); 
        
        // --- 關鍵步驟 1: 讓 Canvas 顯示出來 ---
        // 由於我們在 CSS 中預設隱藏，現在成績收到後要讓它顯示
        if (p5Canvas) {
            p5Canvas.style('display', 'block');
        }

        // ----------------------------------------
        // 關鍵步驟 2: 呼叫重新繪製 
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
    // 取得 H5P iframe 的尺寸
    const iframe = document.getElementById('h5pIframe');
    const w = iframe ? iframe.width : 800;
    const h = iframe ? iframe.height : 600;

    // 創建 Canvas，並將其附加到指定的容器 (父容器的 ID)
    // Canvas 的尺寸應與 iframe 相同
    p5Canvas = createCanvas(w, h); 
    p5Canvas.parent('scoreDisplayContainer'); 

    background(255); 
    noLoop(); // 如果您希望分數只有在改變時才繪製，保留此行
    textFont('Arial');
} 

// ... (Particle / Firework 類別 和 startFireworks/maybeSpawnMoreFireworks/stopFireworksIfDone 函數不變) ...

// 對於視窗大小改變時的處理 (必須同步更新 Canvas 尺寸和其父容器的尺寸)
function windowResized() {
    const container = document.getElementById('scoreDisplayContainer');
    const w = container ? container.clientWidth : windowWidth / 2;
    const h = container ? container.clientHeight : windowHeight / 2;
    
    // 重新設定 Canvas 尺寸
    resizeCanvas(w, h);
    redraw();
}

// ... (draw 函數不變) ...

// score_display.js 中的 draw() 函數片段

function draw() { 
    background(255); // 清除背景

    // 計算百分比
    let percentage = (finalScore / maxScore) * 100;

    textSize(80); 
    textAlign(CENTER);
    
    // -----------------------------------------------------------------
    // A. 根據分數區間改變文本顏色和內容 (畫面反映一)
    // -----------------------------------------------------------------
    if (percentage >= 90) {
        // 滿分或高分：顯示鼓勵文本，使用鮮豔顏色
        fill(0, 200, 50); // 綠色 [6]
        text("恭喜！優異成績！", width / 2, height / 2 - 50);
        
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
    
    // 如果您想要更複雜的視覺效果，還可以根據分數修改線條粗細 (strokeWeight) 
    // 或使用 sin/cos 函數讓圖案的動畫效果有所不同 [8, 9]。
}
