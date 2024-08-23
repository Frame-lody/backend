let handPose;
let video;
let hands = [];
let poseNet;
let pose;

function preload() {
  // 加載 handPose 模型
  handPose = ml5.handPose();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  // 創建攝像頭視頻並隱藏
  video = createCapture(VIDEO);
  video.size(windowWidth, windowHeight);
  video.hide();

  // 檢查 ml5 是否加載成功
  console.log('ml5 version:', ml5.version);
  
  // 開始檢測姿勢
  if (ml5.poseNet) {
    poseNet = ml5.poseNet(video, modelLoadedPoseNet);
    poseNet.on('pose', gotPoses);
  } else {
    console.error('poseNet function is not available in ml5.js.');
  }

  // 開始檢測手勢
  handPose.on('predict', gotHands);
  handPose.detect(video, gotHands);
}

function modelLoadedPoseNet() {
  console.log('poseNet ready');
}

function gotPoses(poses) {
  if (poses.length > 0) {
    pose = poses[0].pose;
    //skeleton = poses[0].skeleton;
  }
}

function gotHands(results) {
  hands = results;
}

function draw() {
  // 畫出攝像頭視頻
  //translate(video.width, 0);  // 如果需要翻轉視頻可以解除註釋
  scale(-1, 1);
  background(0);

  if (hands.length > 0) {
    for (let i = 0; i < hands.length; i++) {
      let hand = hands[i];
      let second_finger = hand.annotations.indexFinger[3]; // 抓到食指尖端
      fill(0, 0, 255); // 畫出食指尖端的圓
      ellipse(second_finger[0], second_finger[1], 15);
      window.secondFinger = second_finger;
    }
  }

  if (pose) {
    let eyeR = pose.rightEye;
    let eyeL = pose.leftEye;
    let d = dist(eyeR.x, eyeR.y, eyeL.x, eyeL.y);
    
  }
}
