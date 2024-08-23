let toggled = false;

function updateProgress() {
    //const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const divider1 = document.getElementById('divider1');

    if (!toggled) {
        //step1.classList.add('completed');
        step2.classList.add('completed');
        divider1.classList.add('completed');
    } else {
        //step1.classList.remove('completed');
        step2.classList.remove('completed');
        divider1.classList.remove('completed');
    }

    toggled = !toggled;
}
