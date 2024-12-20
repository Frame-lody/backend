let video;
let poseNet;
let pose;
let poses = [];
let bodyPose;

function preload() {
  // Load the bodyPose model
  bodyPose = ml5.bodyPose();
}

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  video = createCapture(VIDEO);
  video.size(window.innerWidth, window.innerHeight);
  video.hide();

  // Start detecting poses in the webcam video
  bodyPose.detectStart(video, gotPoses);

//    // 檢查 ml5 是否正確加載
//    if (ml5.poseNet) {
//     poseNet = ml5.poseNet(video, modelLoaded);
//     poseNet.on('pose', gotPoses);
// } else {
//     console.error('poseNet function is not available in ml5.js.');
}

function modelLoaded() {   //顯示pose model已經準備就緒
  console.log('poseNet ready');
}

function gotPoses(results) {
  // console.log(poses);
  poses = results;
  let wristX = 0
  if (poses.length > 0) {
    for (let i = 0; i < poses.length; i++) {
      pose = poses[i];
      window.nose = (pose.left_shoulder+pose.right_shoulder)/2;
      if(pose.right_wrist.x<200){
        wristX = pose.right_wrist.x+100
      }else{
        wristX = 0.5*pose.right_wrist.x-180

      }
      window.hand = createVector(wristX, pose.right_wrist.y);

     // console.log(pose.right_wrist.x);
    }
  }
}

function draw() {
    background(0);
}