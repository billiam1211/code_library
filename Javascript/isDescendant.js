document.body.addEventListener('click', e => {
    if (supportToggle.classList.contains('is-open')) {
        let element = e.target;
        let isDescendant = false;				
        let node = e.target;
        const parent = document.querySelector('li.navUser-item--support');
        while (node !== null) {
            if (node === parent) {
                isDescendant = true;
            }
            node = node.parentNode;
        }
        if (!isDescendant) {
            supportToggle.click();
        }			
    }
});