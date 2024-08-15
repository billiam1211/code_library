this.customDropdownHandler([
    {
        toggleSelector: 'li.navUser-item--myAccount a.navUser-action',
        parentSelector: 'li.navUser-item--myAccount'
    },
    {
        toggleSelector: 'li.navUser-item--support a.navUser-action', 
        parentSelector: 'li.navUser-item--support'
    }
]);
// scalable dropdownhandler
dropdownHandler(data) {
    data.forEach((node) => {
        const toggle = document.querySelector(`${node.toggleSelector}`);
        toggle.addEventListener('click', e => {
            e.preventDefault();
            if (e.currentTarget.classList.contains('is-open')) {
                e.currentTarget.classList.remove('is-open');
            } else {
                e.currentTarget.classList.add('is-open');
            }
        });
        if (node.parentSelector) {
            document.body.addEventListener('click', e => {
                if (toggle.classList.contains('is-open')) {
                    let element = e.target;
                    let isDescendant = false;
                    let el = e.target;
                    const parent = document.querySelector(`${node.parentSelector}`);
                    while (el !== null) {
                        if (el === parent) {
                            isDescendant = true;
                        }
                        el = el.parentNode;
                    }
                    if (!isDescendant) {
                        toggle.classList.remove('is-open');
                    }
                }
            });
        }			
    })
}