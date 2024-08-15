categoryCards() {
    const cards = document.querySelectorAll('div.categoryCard');
    cards?.forEach((card) => {
        card.querySelector('button.categoryCard-toggle').addEventListener('click', () => {
            if (card.classList.contains('is-open')) {
                card.classList.remove('is-open');
            } else {
                card.classList.add('is-open');
            }
        });
    });
}