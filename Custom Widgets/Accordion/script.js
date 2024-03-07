const buttons = document.querySelectorAll('button.accordionToggle');
if (buttons.length) {
    buttons.forEach((button, index) => {
        button.addEventListener('click', (e) => {
            if (e.target.parentElement?.classList?.contains('is-open')) {
                e.target.parentElement.classList.remove('is-open');
            } else {
                e.target.parentElement.classList.add('is-open');
            }
        });
    });
}