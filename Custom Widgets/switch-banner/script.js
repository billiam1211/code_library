switchBanner() {
    // get all switchbanner components on the page
    const switchBannerArr = document.querySelectorAll('div.switchBanner');
    // iterate over each banner
    switchBannerArr.forEach((banner, x) => {
        // get the banner id to pass into selectors so the elements targeted are scoped to the specific banner
        const id = banner.getAttribute('id');
        const buttons = document.querySelectorAll(`div#${id} li.controlsList-item button`);
        const actions = document.querySelectorAll(`div#${id} li.controlsList-item.btn button`);
        const slides = document.querySelectorAll(`div#${id} ul.slideList li.slide`);
        let slideIndex = 0;
        // generate progress bar elements for mobile
        slides.forEach((slide, i) => {
            const segment = document.createElement('LI');
            segment.classList.add('progressBar-item');
            segment.setAttribute('data-index', i);
            if (i === 0) {
                segment.classList.add('is-active');
            }
            document.querySelector(`div#${id} ul.progressBar`).append(segment);
        });
        buttons.forEach((el, index) => {
            el.addEventListener('click', e => {
                if (e.currentTarget.parentElement.classList.contains('is-active')) {
                    return false;
                }
                // handle next
                if (e.currentTarget.getAttribute('data-target') === 'next' && slideIndex < slides.length - 1) {
                    slideIndex++;
                    document.querySelector(`div#${id}`).classList.add('swipe-next');
                }
                // handle previous
                if (e.currentTarget.getAttribute('data-target') === 'prev' && slideIndex > 0) {
                    document.querySelector(`div#${id}`).classList.add('swipe-prev');
                    slideIndex--;
                }
                // set slide index to value of action
                if (e.currentTarget.parentElement.classList.contains('btn')) {
                    slideIndex = e.currentTarget.getAttribute('data-target');
                }
                // handle disbaled button status for previous button
                if (slideIndex === 0) {
                    document.querySelector(`div#${id} li.controlsList-item button[data-target=prev]`).classList.add('disabled');
                } else {
                    document.querySelector(`div#${id} li.controlsList-item button[data-target=prev]`).classList.remove('disabled');
                }
                // handle disbaled button status for next button
                if (slideIndex === slides.length - 1) {
                    document.querySelector(`div#${id} li.controlsList-item button[data-target=next]`).classList.add('disabled');
                } else {
                    document.querySelector(`div#${id} li.controlsList-item button[data-target=next]`).classList.remove('disabled');
                }
                // remove is-active from the active slide
                document.querySelector(`div#${id}`).classList.add('processing');
                document.querySelector(`div#${id} li.controlsList-item.is-active`).classList.add('remove');
                document.querySelector(`div#${id} li.controlsList-item.is-active`).classList.remove('is-active');
                document.querySelector(`div#${id} li.progressBar-item.is-active`).classList.remove('is-active');
                // set value for the slide to be removed and transitioned off the page
                const removeSlide = document.querySelector(`div#${id} ul.slideList li.slide.is-active`);
                // add remove class to start exit transition
                removeSlide.classList.add('remove');
                removeSlide.classList.remove('is-active');
                setTimeout(() => {
                    // remove the exit animation class
                    removeSlide.classList.remove('remove');
                    document.querySelector(`div#${id}`).classList.remove('processing');
                    document.querySelector(`div#${id}`).classList.remove('swipe-next');
                    document.querySelector(`div#${id}`).classList.remove('swipe-prev');
                }, 750);
                // add is active to the new slide
                slides[slideIndex].classList.add('is-active');
                actions[slideIndex].parentElement.classList.add('is-active');
                document.querySelectorAll(`div#${id} li.progressBar-item`)[slideIndex].classList.add('is-active');
            });
        });

        // set touch variables
        let touchstartX = 0;
        let touchendX = 0;

        // define how to handle gesture activity
        const handleGesure = () => {	
            // compare touch event screen location values			
            if (touchendX < touchstartX) {
                if (!banner.querySelector('button[data-target="prev"]').classList.contains('disabled')) {
                    banner.classList.add('swipe-prev');
                    // trigger the previous button click
                    banner.querySelector('button[data-target="prev"]').click();
                }
            }
            // compare touch event screen location values
            if (touchendX > touchstartX) {
                if (!banner.querySelector('button[data-target="next"]').classList?.contains('disabled')) {
                    banner.classList.add('swipe-next');
                    // trigger the next button click
                    banner.querySelector('button[data-target="next"]').click();
                }	
            }
        }

        banner.addEventListener('touchstart', (e) => {
            // when the touch start event is triggered on the banner set the variable for the x axis touchstart value
            touchstartX = e.changedTouches[0].screenX;
        }, false);
        
        banner.addEventListener('touchend', (e) => {
            // when the touch event ends, set the value for the screen position at the end of the guesture
            touchendX = e.changedTouches[0].screenX;
            handleGesure();
        }, false); 

    });
}