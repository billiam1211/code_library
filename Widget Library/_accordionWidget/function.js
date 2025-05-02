accordionWidget() {
    document.querySelectorAll('button.accordionWidget-toggle').forEach((button) => {
        button.addEventListener('click', e => {			
            const content = button.parentElement.querySelector('.accordionWidget-content');
            if (button.parentElement.classList.contains('is-open')) {
                button.parentElement.classList.remove('is-open');
                content.style.maxHeight = '0px';
            } else {
                const openAccordion = button.parentElement.parentElement.querySelector('.accordionWidget-block.is-open');
                if (openAccordion) {
                    openAccordion.classList.remove('is-open');
                    openAccordion.querySelector('.accordionWidget-content').style.maxHeight = '0px';
                }
                button.parentElement.classList.add('is-open');
                content.style.maxHeight = content.scrollHeight + 'px';
            }

        });
    });
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            document.querySelectorAll('.accordionWidget-block.is-open').forEach((block) => {
                const content = block.querySelector('.accordionWidget-content');
                const rect = content.getBoundingClientRect();
    
                // Check if the content is cut off
                if (rect.bottom > window.innerHeight) {
                    const availableHeight = window.innerHeight - rect.top;
                    content.style.maxHeight = `${availableHeight}px`;
                } else {
                    content.style.maxHeight = `${content.scrollHeight}px`;
                }
            });
        }, 500);
    });
}