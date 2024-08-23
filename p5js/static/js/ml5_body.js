let video;
let poseNet;
let pose;
let poses = [];
let bodyPose;
//let skeleton; //沒骨架的話，此部分不需要

function preload() {
  // Load the bodyPose model
  bodyPose = ml5.bodyPose();
}

function setup() {
  //createCanvas(640, 480);
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  video.size(windowWidth, windowHeight);
  video.hide();

  // Start detecting poses in the webcam video
  bodyPose.detectStart(video, gotPoses);

//    // 檢查 ml5 是否正確加載
//    if (ml5.poseNet) {
//     poseNet = ml5.poseNet(video, modelLoaded);
//     poseNet.on('pose', gotPoses);
// } else {
//     console.error('poseNet function is not available in ml5.js.');
// }
}



function modelLoaded() {   //顯示pose model已經準備就緒
  console.log('poseNet ready');
}

function gotPoses(results) {
  // console.log(poses);
  poses = results;
  
  if (poses.length > 0) {
    for (let i = 0; i < poses.length; i++) {
      pose = poses[i];
      //console.log(pose.nose);
      window.nose = (pose.left_shoulder+pose.right_shoulder)/2;
      window.hand = pose.right_elbow;
      //console.log(pose.right_elbow);
      
    }
  }
  // if (poses.length > 0) {
  //   pose = poses[0].pose;  //把抓到的幾個點，都放置pose變數內
  //   //skeleton = poses[0].skeleton; //把相關於骨架的點都放到skeleton變數內
    
  // }
  //console.log(width/2,height/2);
}

function draw() {
    background(0);
    //image(video, 0, 0);  //顯示攝影機捕捉的畫面在螢幕上
    
  //   if (pose) {
      
  //     // let eyeR = pose.rightEye;  //抓到右眼資訊，放到eyeR
  //     // let eyeL = pose.leftEye;   //抓到左眼資訊，放到eyeL
  //     // let d = dist(eyeR.x, eyeR.y, eyeL.x, eyeL.y); //算出左右眼的距離，當作鼻子顯示圓的直徑
      
      
  // }
}