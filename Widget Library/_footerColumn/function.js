
footerDrawers() {
    // manage footer accordion open / close states
    document.querySelectorAll('button.footerColumn-toggle').forEach((button, index) => {
        button.addEventListener('click', e => {
            const openColumn = document.querySelector('article.footerColumn.is-open');
            openColumn?.classList?.remove('is-open');
            const targetColumn = e.target.closest('article');
            if (targetColumn !== openColumn) {
                targetColumn.classList.add('is-open');
            }
        });
    });
}