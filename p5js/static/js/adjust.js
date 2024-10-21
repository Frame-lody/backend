let iframe = document.getElementById('myIframe');
let colors;
let speed;

function updateLabel(colorId) {
    var colorInput = document.getElementById(colorId);
    var label = document.querySelector(`label[for=${colorId}]`);
    label.textContent = colorInput.value.toUpperCase();

    let colorArray = [];
    let clr = '';
    for (let i = 1; i < 4; i++) {
        clr = document.getElementById(`color${i}`).value;
        colorArray.push(clr);
    }

    //傳遞顏色給iframe
    colors = encodeURIComponent(colorArray);
    iframe.src = testUrl + '?colors=' + colors + '&speed=' + speed;
}

const speedSlider = document.getElementById('speed');
const speedOutput = document.getElementById('speedValue');

speedSlider.addEventListener('input', function () {
    speedOutput.textContent = `${this.value}x`; // 根據滑桿的值動態更新顯示

    //傳遞speed給iframe
    speed = encodeURIComponent(this.value);
    iframe.src = testUrl + '?speed=' + speed + '&colors=' + colors;
});

// 切換播放按鈕的圖標
const playButton = document.querySelector('.play-button');

playButton.addEventListener('click', function () {
    if (this.textContent === '⏸') {
        this.textContent = '▶️'; // 當前是暫停狀態，點擊後切換為播放圖標
    } else {
        this.textContent = '⏸'; // 當前是播放狀態，點擊後切換為暫停圖標
    }
});

// // 全螢幕功能
// document.getElementById('fullscreen-button').addEventListener('click', function () {
//     const previewContainer = document.querySelector('.preview-container');
//     if (!document.fullscreenElement) {
//         if (previewContainer.requestFullscreen) {
//             previewContainer.requestFullscreen();
//         } else if (previewContainer.webkitRequestFullscreen) {
//             // Safari
//             previewContainer.webkitRequestFullscreen();
//         } else if (previewContainer.msRequestFullscreen) {
//             // IE11
//             previewContainer.msRequestFullscreen();
//         }
//     } else {
//         if (document.exitFullscreen) {
//             document.exitFullscreen();
//         } else if (document.webkitExitFullscreen) {
//             // Safari
//             document.webkitExitFullscreen();
//         } else if (document.msExitFullscreen) {
//             // IE11
//             document.msExitFullscreen();
//         }
//     }
// });

speedSlider.addEventListener('input', function () {
    speedOutput.textContent = `${this.value}x`; // 根據滑桿的值動態更新顯示
});
