let iframe = document.getElementById('myIframe');
// let colors;
// let speed;

document.addEventListener('DOMContentLoaded', function () {
    iframe.src = testUrl + '?colors=' + colors + '&speed=' + speed + '&sketch=' + sketchName;
});

function updateLabel(colorId) {
    let colorInput = document.getElementById(colorId);
    let label = document.querySelector(`label[for=${colorId}]`);
    label.textContent = colorInput.value.toUpperCase();

    let colorArray = [];
    let clr = '';
    const colorInputs = document.querySelectorAll('[id^="color"]');
    colorInputs.forEach(input => {
        clr = input.value;
        colorArray.push(clr);
    });

    //傳遞顏色給iframe
    colors = encodeURIComponent(colorArray);
    iframe.src = testUrl + '?colors=' + colors + '&speed=' + speed + '&sketch=' + sketchName;

    // 將資料送到後端儲存
    fetch('/p5js/update-segment-color/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken') // 確保有 CSRF Token
        },
        body: JSON.stringify({
            task_id: taskId,  // 傳遞必要的段落 ID
            color_array: colorArray, // 傳遞顏色陣列
            order_id: orderId
        })
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to update colors');
        }
    })
    .then(data => {
        console.log('Colors updated successfully:', data);
    })
    .catch(error => {
        console.error('Error updating colors:', error);
    });
}

const speedSlider = document.getElementById('speed');
const speedOutput = document.getElementById('speedValue');

speedSlider.addEventListener('input', function () {
    speedOutput.textContent = `${this.value}x`; // 根據滑桿的值動態更新顯示

    //傳遞speed給iframe
    speed = encodeURIComponent(this.value);
    iframe.src = testUrl + '?speed=' + speed + '&colors=' + colors + '&sketch=' + sketchName;
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

// Helper: 獲取 CSRF Token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}