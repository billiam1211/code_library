if ($('article.blog').length) {
    // custom equal heights function for blog articles
    const equalHeights = (selector) => {
        const elms = document.querySelectorAll(selector);
        const len = elms.length;
        let tallest = 0;
        // eslint-disable-next-line one-var
        let elm,
            elmHeight,
            x;

        for (x = 0; x < len; x++) {
            elms[x].style.height = 'auto';
        }

        for (x = 0; x < len; x++) {
            elm = elms[x];
            elmHeight = elm.offsetHeight;
            tallest = (elmHeight > tallest) ? elmHeight : tallest;
        }

        for (x = 0; x < len; x++) {
            // eslint-disable-next-line prefer-template
            elms[x].style.height = tallest + 'px';
        }
    };
    const debounce = (callback, wait) => {
        let timeout;
        return (...args) => {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => callback.apply(context, args), wait);
        };
    };
    const debounceResize = debounce(() => {
        equalHeights('.blog-post-figure img');
        equalHeights('article.blog');
    }, 250);
    window.addEventListener('resize', debounceResize);
    window.dispatchEvent(new Event('resize'));
}