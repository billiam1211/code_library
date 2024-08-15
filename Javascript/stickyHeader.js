stickyHeader() {
    $(window).on('scroll', () => {
        const header = $('header.header');
        const scroll = $(window).scrollTop();
      
        if (scroll >= 100) {
            header.addClass('sticky') 
        } else {
            header.removeClass('sticky');
        }
    });
}