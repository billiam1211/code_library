//////////////////////////////////////
// EXAMPLE FROM ADVANCED AUTOMATION //
//////////////////////////////////////

// Example for Advanced AUto
jsonLoading() {
    const advancedAutoJson = '/content/advancedAuto.json';
    const advancedAutotoolsAndSolutionsJson = '/content/toolsAndSolutions.json';

    $.getJSON(advancedAutoJson, (data) => {
        this.topCategories(data.top_categories);
    });
    $.getJSON(advancedAutotoolsAndSolutionsJson, (data) => {
        this.toolsAndSolutions(data);
    });
}

// Example from Pinmart
jsonLoading() {
    const pinmartJson = 'https://pinmart-store-1.mybigcommerce.com/content/topBanner.json';

    $.getJSON(pinmartJson, (data) => {
        this.topGlobalBanner(data.top_global_banner);
    });

    if ($('#idSection').length) {
        const iconSectionJson = 'content/iconSection.json';
        $.getJSON(iconSectionJson, (data) => {
            this.iconSection(data.icon_section);
        });
    }
}