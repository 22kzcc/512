let video;
let facemesh;
let predictions = [];
let displayW, displayH;

// 濾鏡狀態：'none', 'earring', 'cat', 'heart', 'cyber'
let currentFilter = 'none';
let buttons = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  updateDisplaySize();

  // 1. 設定攝影機
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  // 2. 初始化 Facemesh
  facemesh = ml5.facemesh(video, () => console.log("Model Ready!"));
  facemesh.on("predict", results => {
    predictions = results;
  });

  // 3. 產生所有按鈕
  createFilterButtons();
}

function draw() {
  background('#e7c6ff'); // 粉紅背景

  // 繪製標題
  drawUI();

  push();
  translate(width / 2, height / 2);
  scale(-1, 1); // 鏡像處理
  
  // 繪製影像 (置中，寬高 50%)
  imageMode(CENTER);
  image(video, 0, 0, displayW, displayH);

  // 根據選擇的狀態繪製濾鏡
  if (predictions.length > 0) {
    let keypoints = predictions[0].scaledMesh;
    
    if (currentFilter === 'earring') drawEarrings(keypoints);
    else if (currentFilter === 'cat') drawCatFace(keypoints);
    else if (currentFilter === 'heart') drawHeartEyes(keypoints);
    else if (currentFilter === 'cyber') drawCyberFilter(keypoints);
  }
  pop();
}

// --- 濾鏡按鈕選單 ---
function createFilterButtons() {
  const filterOptions = [
    { name: '清除濾鏡', type: 'none' },
    { name: '珍珠耳環', type: 'earring' },
    { name: '可愛貓咪', type: 'cat' },
    { name: '愛心噴發', type: 'heart' },
    { name: '賽博龐克', type: 'cyber' }
  ];

  // 計算按鈕間距與位置
  let btnWidth = 100;
  let totalWidth = filterOptions.length * (btnWidth + 10);
  let startX = (width - totalWidth) / 2;

  filterOptions.forEach((opt, i) => {
    let btn = createButton(opt.name);
    btn.position(startX + i * (btnWidth + 10), height - 70); // 放在畫面最下方
    btn.size(btnWidth, 40);
    
    // 按鈕樣式設定
    btn.style('background-color', '#ff85a1');
    btn.style('color', 'white');
    btn.style('border', 'none');
    btn.style('border-radius', '10px');
    btn.style('cursor', 'pointer');
    btn.style('font-weight', 'bold');

    btn.mousePressed(() => {
      currentFilter = opt.type;
    });
    buttons.push(btn);
  });
}

// --- 濾鏡 1：耳環 ---
function drawEarrings(keypoints) {
  fill(255, 255, 0);
  noStroke();
  [132, 361].forEach(idx => {
    let p = getPos(keypoints[idx]);
    for (let i = 1; i <= 3; i++) {
      ellipse(p.x, p.y + i * 15, 12, 12);
    }
  });
}

// --- 濾鏡 2：貓咪臉 ---
function drawCatFace(keypoints) {
  // 耳朵
  fill(255, 180, 180);
  let le = getPos(keypoints[103]);
  let re = getPos(keypoints[332]);
  triangle(le.x - 25, le.y, le.x + 25, le.y, le.x, le.y - 60);
  triangle(re.x - 25, re.y, re.x + 25, re.y, re.x, re.y - 60);
  
  // 鼻子
  let nose = getPos(keypoints[1]);
  fill('#ff4d6d');
  ellipse(nose.x, nose.y, 25, 18);
}

// --- 濾鏡 3：愛心眼 ---
function drawHeartEyes(keypoints) {
  let eyes = [getPos(keypoints[159]), getPos(keypoints[386])];
  eyes.forEach(p => {
    fill(255, 50, 50);
    noStroke();
    beginShape();
    vertex(p.x, p.y);
    bezierVertex(p.x - 20, p.y - 20, p.x - 40, p.y + 10, p.x, p.y + 40);
    bezierVertex(p.x + 40, p.y + 10, p.x + 20, p.y - 20, p.x, p.y);
    endShape(CLOSE);
  });
}

// --- 濾鏡 4：賽博龐克 (霓虹線條) ---
function drawCyberFilter(keypoints) {
  noFill();
  strokeWeight(3);
  
  // 臉部輪廓霓虹燈
  stroke(0, 255, 255, 200); // 螢光藍
  beginShape();
  [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109].forEach(idx => {
    let p = getPos(keypoints[idx]);
    vertex(p.x, p.y);
  });
  endShape(CLOSE);

  // 眼睛掃描線
  stroke(255, 0, 255, 200); // 螢光粉
  let ly = getPos(keypoints[159]);
  let ry = getPos(keypoints[386]);
  line(ly.x - 40, ly.y, ry.x + 40, ry.y);
}

// --- 工具函式 ---
function getPos(p) {
  return {
    x: map(p[0], 0, video.width, -displayW / 2, displayW / 2),
    y: map(p[1], 0, video.height, -displayH / 2, displayH / 2)
  };
}

function drawUI() {
  fill(0);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(22);
  text("教科414730118 - 互動濾鏡系統", width / 2, 40);
}

function updateDisplaySize() {
  displayW = width * 0.5;
  displayH = height * 0.5;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateDisplaySize();
  // 重新計算按鈕位置
  let btnWidth = 100;
  let totalWidth = buttons.length * (btnWidth + 10);
  let startX = (width - totalWidth) / 2;
  buttons.forEach((btn, i) => {
    btn.position(startX + i * (btnWidth + 10), height - 70);
  });
}