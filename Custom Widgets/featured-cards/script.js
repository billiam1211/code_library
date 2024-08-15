featuredCardsCarousel() {
    const featuredCardsArr = $('.featuredCards');
    featuredCardsArr.each((index, el) => {
        if ($(el).hasClass('carousel')) {
            $(el).find('ul').slick({
                dots: false,
                infinite: true,
                autoplay: false,
                slidesToShow: 4,
                slidesToScroll: 4,
                responsive: [
                    {
                        breakpoint: 1261,
                        settings: {
                            slidesToShow: 4,
                            slidesToScroll: 4
                        }
                    },
                    {
                        breakpoint: 1024,
                        settings: {
                            slidesToShow: 3,
                            slidesToScroll: 3
                        }
                    },
                    {
                        breakpoint: 801,
                        settings: {
                            slidesToShow: 2,
                            slidesToScroll: 2
                        }
                    },
                    {
                        breakpoint: 551,
                        settings: {
                            slidesToShow: 1,
                            slidesToScroll: 1
                        }
                    }
                ]
            });
        }
    });


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
        equalHeights('.featuredCards-item img');
    }, 250);
    window.addEventListener('resize', debounceResize);
    window.dispatchEvent(new Event('resize'));
}