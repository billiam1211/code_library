import utils from '@bigcommerce/stencil-utils';
import ProductDetailsBase, { optionChangeDecorator } from './product-details-base';
import 'foundation-sites/js/foundation/foundation';
import 'foundation-sites/js/foundation/foundation.reveal';
import ImageGallery from '../product/image-gallery';
import modalFactory, { alertModal, showAlertModal, showAlertAddToCartSuccess } from '../global/modal';
import { isEmpty, isPlainObject } from 'lodash';
import nod from '../common/nod';
import { announceInputErrorMessage } from '../common/utils/form-utils';
import forms from '../common/models/forms';
import { normalizeFormData } from './utils/api';
import { isBrowserIE, convertIntoArray } from './utils/ie-helpers';
import bannerUtils from './utils/banner-utils';
import currencySelector from '../global/currency-selector';

export default class ProductDetails extends ProductDetailsBase {
    constructor($scope, context, productAttributesData = {}) {
        super($scope, context);

        this.$overlay = $('[data-cart-item-add] .loadingOverlay');
        this.imageGallery = new ImageGallery($('[data-image-gallery]', this.$scope));
        this.imageGallery.init();
        this.listenQuantityChange();
        this.$swatchOptionMessage = $('.swatch-option-message');
        this.swatchInitMessageStorage = {};
        this.swatchGroupIdList = $('[id^="swatchGroup"]').map((_, group) => $(group).attr('id'));
        this.storeInitMessagesForSwatches();

        const $form = $('form[data-cart-item-add]', $scope);

        this.addToCartValidator = nod({
            submit: $form.find('input#form-action-addToCart'),
            tap: announceInputErrorMessage,
        });

        const $productOptionsElement = $('[data-product-option-change]', $form);
        let hasOptions;

        if ($productOptionsElement.length === 0) {
            hasOptions = 0;
        } else {
            hasOptions = $productOptionsElement.html().trim().length;
        }

        const hasDefaultOptions = $productOptionsElement.find('[data-default]').length;
        const $productSwatchGroup = $('[id*="attribute_swatch"]', $form);
        const $productSwatchLabels = $('.form-option-swatch', $form);
        const placeSwatchLabelImage = (_, label) => {
            const $optionImage = $('.form-option-expanded', $(label));
            const optionImageWidth = $optionImage.outerWidth();
            const extendedOptionImageOffsetLeft = 55;
            const { right } = label.getBoundingClientRect();
            const emptySpaceToScreenRightBorder = window.screen.width - right;
            const shiftValue = optionImageWidth - emptySpaceToScreenRightBorder;

            if (emptySpaceToScreenRightBorder < (optionImageWidth + extendedOptionImageOffsetLeft)) {
                $optionImage.css('left', `${shiftValue > 0 ? -shiftValue : shiftValue}px`);
            }
        };

        $(window).on('load', () => {
            this.registerAddToCartValidation();
            $.each($productSwatchLabels, placeSwatchLabelImage);
        });

        if (context.showSwatchNames) {
            this.$swatchOptionMessage.removeClass('u-hidden');

            $productSwatchGroup.on('change', ({ target }) => {
                const swatchGroupElement = target.parentNode.parentNode;

                this.showSwatchNameOnOption($(target), $(swatchGroupElement));
            });

            $.each($productSwatchGroup, (_, element) => {
                const swatchGroupElement = element.parentNode.parentNode;

                if ($(element).is(':checked')) this.showSwatchNameOnOption($(element), $(swatchGroupElement));
            });
        }

        $productOptionsElement.on('change', event => {
            this.productOptionsChanged(event);
            this.setProductVariant();
        });

        $form.on('submit', event => {
            this.addToCartValidator.performCheck();

            if (this.addToCartValidator.areAll('valid')) {
                this.addProductToCart(event, $form[0]);
            }
        });

        // Update product attributes. Also update the initial view in case items are oos
        // or have default variant properties that change the view
        if ((isEmpty(productAttributesData) || hasDefaultOptions) && hasOptions) {
            const $productId = $('[name="product_id"]', $form).val();
            const optionChangeCallback = optionChangeDecorator.call(this, hasDefaultOptions);

            utils.api.productAttributes.optionChange($productId, $form.serialize(), 'products/bulk-discount-rates', optionChangeCallback);
        } else {
            this.updateProductAttributes(productAttributesData);
            bannerUtils.dispatchProductBannerEvent(productAttributesData);
        }

        $productOptionsElement.show();

        this.previewModal = modalFactory('#previewModal')[0];
        // console.log('context', this.context)

        if ($('div.featuredCarousel').length) {
            this.featuredCarousel();
        }

        if ($('div.online').length) {
            this.getMsrp();
        }

        if ($('div.recipeView').length) {
            this.recipeTabManager();
            this.specialProducts();
            this.methodCheckList();
            this.selectAll();
            this.addSelectedToCart();
            this.toggleNote();
            this.relatedRecipes();
            this.wordpressBlog();
            this.customShare();
            this.printRecipe();
        }

        if ($('div.associatedItem').length) {
            this.getAssicatedItemSkus();
        }

        if ($('[data-session').length) {
            this.initGetSessionData();
        }
        $('.product-rating').on('click', () => {
            $('.reviews .accordion-body').show()
            $('.reviews .accordion-header').addClass('active')
        })
    }

    getAssicatedItemSkus() {
        // get the customfields list
        let customFields = this.context.customFields;
        // get the key for the custom field name, which will vary for pdp pages and class pages
        let key = document.querySelector('div[data-custom-field-name]').getAttribute('data-custom-field-name');
        // set variable for sku array
        let skuArray = null;
        // iterate over custom fields and check for custom field name
        for (let index = 0; index < customFields.length; index++) {
            const customField = customFields[index];
            if (customField.name === key) {
                // if custom field name matches the key save the sku list
                skuArray = customField.value.split(',');
            }
        }
        // if there are skus
        if (skuArray.length && skuArray !== null) {
            // iterate over the sku list
            for (let index = 0; index < skuArray.length; index++) {
                const sku = skuArray[index];
                // make graphQL call for each SKU to get it's data                
                if (index == (skuArray.length - 1)) {
                    this.getAssociatedItemData(sku, true);
                } else {
                    this.getAssociatedItemData(sku, false);
                }
            }
        }
    }

    getAssociatedItemData(sku, lastItem) {
        // build graphql call to get data for the sku that is passed in
        const data = {
            type: 'POST',
            url: '/graphql',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${this.context.storefrontApiToken}`,
            },
            data: JSON.stringify({
                query: `query getProductId {
                    site {
                        product(sku:"${sku}"){
                            name
                            id
                            entityId
                            sku
                            defaultImage {
                                urlOriginal
                                altText
                            }
                            productOptions {
                                edges {
                                    node {
                                        __typename
                                        displayName
                                        entityId
                                        isRequired
                                        ... on MultipleChoiceOption {
                                            displayStyle
                                        }
                                    }
                                }
                            }
                            availabilityV2 {
                              status
                            }   
                            inventory {
                                isInStock
                            }     
                            prices(includeTax:false){
                                price {
                                    currencyCode
                                    value
                                }
                                salePrice {
                                    currencyCode
                                    value
                                }
                            }
                        }
                    }
                }`
            }),
        };
        // make call to graphQL to get the product entity ID from the SKU
        $.ajax(data).done((response) => {
            const productData = response.data.site.product;
            // console.log('response => ', productData);
            // if response is null, skip product 
            if(productData === null) {
                return false;
            }
            // check if product is available
            if (productData.availabilityV2.status !== 'Available') {
                return false;
            }
            // check inventory, if false skip item
            if (!productData.inventory.isInStock) {
                return false;
            }
            // if product has options do not include it. Only simple products will be included
            if (productData.productOptions.edges.length) {
                return false;
            }
            let price;
            if (productData.prices.price.currencyCode == 'USD') {
                price = '$';
            }
            // if there is a sale price, use that instead
            if (productData.prices.salePrice.value.length ) {
                price += productData.prices.salePrice.value;
            } else {
                price += productData.prices.price.value;
            }
            // set up template for each item
            let associatedItem = `<li class="associatedItem-item" data-sku="${productData.sku}" data-entityId="${productData.entityId}"> <div class="associatedItem-card"> <div class="associatedItem-image"> <img src="${productData.defaultImage.urlOriginal}" alt="${productData.defaultImage.altText}"> <input type="checkbox" checked name="addToCartCheck" id="addToCartCheck--${sku}"> <label for="addToCartCheck--${sku}"></label> </div> <div class="associatedItem-content"> <h3 class="associatedItem-name">${productData.name}</h3> <p class="associatedItem-price"> ${price} </p> <div class="associatedItem-rating"> <div class="yotpo bottomLine" data-yotpo-product-id="${productData.entityId}"></div> </div> </div> </div> </li>`;
            // add item to the list 
            document.querySelector('ul.associatedItem-list').innerHTML += associatedItem;
            var api = new Yotpo.API(yotpo);
            api.refreshWidgets();
        }).done(() => {
            if (lastItem) {
                // once last item is written to the page, add slick slider and populate the action values
                $('ul.associatedItem-list').slick({
                    mobileFirst: true,
                    dots: false,
                    infinite: false,
                    arrows: false,
                    centerMode: true,
                    centerPadding: '40px',
                    responsive: [
                        {
                            breakpoint: 1024,
                            settings: {
                                slidesToShow: 4,
                                slidesToScroll: 4,
                                centerMode: false,
                                centerPadding: '0px'
                            }
                        },
                        {
                            breakpoint: 768,
                            settings: {
                                slidesToShow: 3,
                                slidesToScroll: 3
                            }
                        },
                        {
                            breakpoint: 551,
                            settings: {
                                slidesToShow: 2,
                                slidesToScroll: 2,
                                centerPadding: '0px',
                                centerMode: false
                            }
                        },
                        {
                            breakpoint: 200,
                            settings: {
                                slidesToShow: 1,
                                slidesToScroll: 1
                            }
                        }
                    ]
                });
                // on page load if this component fires, process the selected items and values
                this.refreshAssociatedItemData();
                this.associatedProductsAddToCart();
            }
        }).fail((error) => {
            console.log(`Error `, error); 
        });
    }

    associatedProductsAddToCart() {
        // console.log('init associated products add to cart');
        // set up event listener for the bundle add to cart button
        $('button.associatedItem-addToCart').on('click', () => {
            // set up variables
            let productIds = [];
            let itemData = [];
            // iterate over the associated items and get the id for each item that is checked
            let items = $('li.associatedItem-item');
            for (let index = 0; index < items.length; index++) {
                const item = items[index];
                // get the items that are checked
                if ($(item).find('input').is(':checked')) {
                    // get item sku
                    let itemName = $(item).find('.associatedItem-name').text();
                    // get item id
                    let itemId = $(item).attr('data-entityId');
                    // set item quantity
                    let quantity = 1;
                    // set up item data array of objects (every item data obj will just be id and a quantity of 1)
                    let obj = {
                        "name": itemName,
                        "quantity": 1,
                        "productId": itemId
                    };
                    // add values to their corresponding arrays
                    productIds.push(itemId);
                    itemData.push(obj);
                }
            }
            if (productIds.length) {
                this.getUserCart(productIds, itemData);
            } else {
                this.customModal('', 'No items selected. Please check items to add them to the bundle!', 'Close');
            }
        });
    }

    customModal(title, message, action) {
        // set up alert
        const alert = document.createElement('div');
        alert.classList.add('customAlert');
        // set alert message and inject item name
        let str = `<div class="customAlert-container"><p class="customAlert-text"><strong>${title} </strong>${message}</p><button class="customAlert-button">${action}</button></div>`;
        // add message to the alert 
        alert.innerHTML += str;
        // add alert to the page
        $('main.body').append(alert);
        // add event listener to close the alert modal whether the user clicks on the button or anywhere on the page 
        $('body').on('click', (e) => {
            if ($(e.target).is('div.customAlert') || $(e.target).is('button.customAlert-button')) {
                $('div.customAlert').remove();
            }
        });
    }

    addToCartToaster(items) {
        // create modal
        const modal = document.createElement('div');
        modal.classList.add('addToCartModal');
        // for each product added to cart, inject the name and quantity into the modal text
        for (let index = 0; index < items.length; index++) {
            const item = items[index];
            let str = `<p class='addToCartModal-item'>Added ${item.quantity} x <strong>${item.name}</strong> to your cart.</p>`;
            // text to the modal
            modal.innerHTML += str;
        }
        // add modal to the page
        document.querySelector('main.body').prepend(modal);
        // in 3 seconds, add remove animation
        setTimeout(() => {
            modal.classList.add('remove');
        }, 3500);
        // in 3.5 seconds remove modal from DOM
        setTimeout(() => {
            $(modal).remove();
        }, 3800);
    }

    refreshAssociatedItemData() {
        // get a list of the items
        let associatedItems = $('li.associatedItem-item');
        // set variable for bundle amount
        let bundleTotal = 0;
        let itemsSelected = 0;
        // iterate over the list of associated items
        for (let index = 0; index < associatedItems.length; index++) {
            const item = associatedItems[index];            
            // if the item is checked, get the value and add it to the total
            if ($(item).find('input').is(':checked')) {
                itemsSelected += 1;
                bundleTotal += parseFloat($(item).find('.associatedItem-price').text().replace('$', ''), 2);
            }
        }
        bundleTotal = '$' + bundleTotal;
        $('.associatedItem .bundle-total').text(bundleTotal);
        $('span.associatedItem-quantity').text(`(${itemsSelected} selected items)`);
        // set up event listener to update values when a user clicks on a checkbox input
        $('li.associatedItem-item input').on('change', () => {
            this.refreshAssociatedItemData();
        });
    }

    printRecipe() {
        $('#print-recipe').on('click', (e) => {        
            e.preventDefault();
            document.body.classList.add('print-recipe');
            setTimeout(() => {
                window.print();
            }, 500);
        });

        window.addEventListener('afterprint', () => {
            document.body.classList.remove('print-recipe');
        });
    }

    customShare() {
        // console.log('init custom share');
        // get current url and page title
        const currentUrl = window.location.href;
        const pageTitle = this.context.pageTitle;
        // grab the list of share items
        const shareItems = document.querySelectorAll('.socialLinks--custom li');
        // iterate over the items
        for (let index = 0; index < shareItems.length; index++) {
            const item = shareItems[index];
            // iterate over the item child nodes
            for (let i = 0; i < item.childNodes.length; i++) {
                const child = item.childNodes[i];                
                // check for class to find the anchor
                if (child.classList !== undefined) {                    
                    if (child.classList.contains('socialLinks__link')) {
                        const href = child.getAttribute('href');
                        const cleaned = href.replace('<url>', currentUrl).replace('<title>', pageTitle);
                        // update the href with the correct values
                        child.setAttribute('href', cleaned);
                    }
                }  
            }
            if ((shareItems.length - 1) === index) {
                // show the share icons
                document.querySelector('div.socialLinks-container').classList.remove('hidden');
            }
        }
    }

    initGetSessionData() {
        // console.log('init get registration data');
        // grab the product id
        const pid = this.context.productId;
        // make a list of the sessions on the page
        const sessionsArr = $('ul[data-session');
        // iterate over the array
        for (let index = 0; index < sessionsArr.length; index++) {
            const session = sessionsArr[index];
            const nameSpace = $(session).attr('data-session');
            // console.log(`Namespace: ${nameSpace}, PID: ${pid}`);
             // call funciton to get data from graphql and pass in namespace value and pid
            this.sessionGraphQL(pid, nameSpace, session);
        }
    }

    sessionGraphQL(pid, namespace, target) {
        const data = {
            type: 'POST',
            url: '/graphql',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${this.context.storefrontApiToken}`,
            },
            data: JSON.stringify({
                query: `
                    query productById{
                        site {
                            product(entityId:${pid}){
                                metafields(namespace:${JSON.stringify(namespace)}){
                                    edges {
                                        node {
                                            value
                                        }
                                    }
                                }
                            }
                        }
                    }
                `
            }),
        };
        // make call to graphQL to get the product entity ID from the SKU
        $.ajax(data).done((response) => {
            // console.log('Response: ', response);
            // get the data attribute to determine the class type, online or in person
            const classType = document.querySelector('div[data-class').getAttribute('data-class');
            // check to see if there is a response with dates / times
            if (response.data.site.product.metafields.edges.length) {
                // set array for list of available sessions
                const datesArr = response.data.site.product.metafields.edges;
                // set var for the target element 
                const $target = $(`ul[data-session="${namespace}"]`);
                // add class to denote a list that will have available sessions
                $target.addClass('has-children');
                // add classes to headings to show them only if there are sessions writing to the page
                $target.parent().find('h2.section-title').removeClass('hidden');
                // show the sub title if the session list has items
                if($target.prev().is('h3')) {
                    $target.prev().removeClass('hidden');
                }
                // show section
                $target.parent().removeClass('hidden');
                // set value for the list of items
                let availableDates = '';
                // iterate over the list of items
                for (let index = 0; index < datesArr.length; index++) {
                    const data = datesArr[index];
                    if (classType === 'online') {
                        let date = data.node.value.split('<|>')[0];
                        let time = data.node.value.split('<|>')[1];
                        let url = data.node.value.split('<|>')[2];
                        availableDates += `<li class="sessionItem"><div class="sessionItem-container"><span class="date">${date}</span><span class="time">${time}</span><a href="${url}" class="register">REGISTER</a></div></li>`;
                    } else {                    
                        // create time and links variables
                        let time = data.node.value.split('<|>')[0];
                        let url = data.node.value.split('<|>')[1];
                        // inject the time and url values into the template and add it to the list
                        availableDates += `<li class="sessionItem"><div class="sessionItem-container"><span class="date">${time}</span><a href="${url}" class="register">REGISTER</a></div></li>`;
                    }
                }
                // inject the completed list of times to the parent 
                $target.html(availableDates);
            } else {
                // hide the session lists if there are no available sessions
                target.classList.add('hidden');
            }

        }).fail((error) => {
            console.log(`Error `, error); 
        });
    }

    getMsrp() {
        let pid = $('[data-msrp]').attr('data-msrp');
        const data = {
            type: 'POST',
            url: '/graphql',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${this.context.storefrontApiToken}`,
            },
            data: JSON.stringify({
                query: `query singleProdcut {
                    site {
                      product(entityId:${pid}) {
                        name
                        prices(currencyCode:USD){
                          retailPrice {
                            value
                          }
                        }
                      }
                    }
                  }`
            }),
        };
        // make call to graphQL to get the product entity ID from the SKU
        $.ajax(data).done((response) => {
            let msrp = `$${parseFloat(response.data.site.product.prices.retailPrice.value).toFixed(2)}`;
            $('[data-msrp]').text(msrp);
        }).fail((error) => {
            console.log(`Error `, error); 
        });
    }

    featuredCarousel() {
        $('ul.featuredCarousel-slides').slick({
            mobileFirst: true,
            dots: false,
            infinite: true,
            responsive: [
                {
                    breakpoint: 1261,
                    settings: {
                        arrows: false,
                        slidesToShow: 5,
                        slidesToScroll: 5
                    }
                },
                {
                    breakpoint: 1024,
                    settings: {
                        arrows: false,
                        centerMode: false,
                        slidesToShow: 4,
                        slidesToScroll: 4
                    }
                },
                {
                    breakpoint: 768,
                    settings: {
                        arrows: false,
                        centerMode: true,
                        slidesToShow: 3,
                        slidesToScroll: 3
                    }
                },
                {
                    breakpoint: 551,
                    settings: {
                        arrows: false,
                        centerMode: true,
                        slidesToShow: 2,
                        slidesToScroll: 2
                    }
                },
                {
                    breakpoint: 200,
                    settings: {
                        arrows: false,
                        centerMode: true,
                        centerPadding: '40px',
                        slidesToShow: 1,
                        slidesToScroll: 1
                    }
                }
            ]
        });
    }

    wordpressBlog() {
        $('ul.wordpressBlog-slides').slick({
            centerMode: true,
            centerPadding: '60px',
            mobileFirst: true,
            dots: false,
            responsive: [
                {
                    breakpoint: 768,
                    settings: {
                        arrows: false,
                        centerMode: true,
                        slidesToShow: 3,
                        slidesToScroll: 1
                    }
                },
                {
                    breakpoint: 200,
                    settings: {
                        arrows: false,
                        centerMode: true,
                        centerPadding: '40px',
                        slidesToShow: 1,
                        slidesToScroll: 1
                    }
                }
            ]
        })
    }

    relatedRecipes() {
        $('ul.relatedProducts-list').slick({
            centerMode: true,
            centerPadding: '60px',
            infinite: true,
            mobileFirst: true,
            dots: false,
            swipe: true,
            swipeToSlide: true,
            responsive: [
                {
                    breakpoint: 1261,
                    settings: {
                        arrows: true,
                        centerMode: true,
                        centerPadding: '100px',
                        slidesToShow: 6,
                        slidesToScroll: 1
                    }
                },
                {
                    breakpoint: 1024,
                    settings: {
                        arrows: false,
                        centerMode: true,
                        centerPadding: '60px',
                        slidesToShow: 4,
                        slidesToScroll: 1
                    }
                },
                {
                    breakpoint: 768,
                    settings: {
                        arrows: false,
                        centerMode: true,
                        centerPadding: '50px',
                        slidesToShow: 3,
                        slidesToScroll: 1
                    }
                },
                {
                    breakpoint: 350,
                    settings: {
                        arrows: false,
                        centerMode: true,
                        centerPadding: '20px',
                        slidesToShow: 2,
                        slidesToScroll: 1
                    }
                },
                {
                    breakpoint: 200,
                    settings: {
                        arrows: false,
                        centerMode: true,
                        slidesToShow: 1,
                        slidesToScroll: 1
                    }
                }
            ]
        })
    }

    toggleNote() {
        const notesArr = document.getElementsByClassName('notesItem');
        if (!notesArr.length) {
            document.querySelector('div.notes-content').classList.add('hidden');
        }
    }

    addSelectedToCart() {
        // console.log('init add selected to cart');
        $('button.recipeTabs-addToCart').on('click', (e) => {
            let pids = [];
            let addedItemsData = [];
            // grab list of items that are purchaseable
            const itemsArr = $('li.ingredient.can-purchase');
            // set flag
            let itemsSelected = false;
            // iterate over items
            for (let index = 0; index < itemsArr.length; index++) {
                const item = itemsArr[index];
                // grab the checkbox
                const checkbox = $(item).find('input.specialProduct-checkbox');
                // if an item is checked, switch the flag                
                if (checkbox.prop('checked')) {
                    itemsSelected = true;
                    const productId = $(item).attr('data-entityId');
                    const itemData = {"name": $(item).find('p.ingredient-name').text(), "quantity": 1, "productId": productId};
                    addedItemsData.push(itemData);
                    pids.push(productId);
                }
            }
            // if there are no items selected
            if (!itemsSelected) {
                // create tooltip pop up
                let toolTip = $('<div class="recipeTabs-tooltip"><div class="recipeTabs-toolTip--layout"><p>Please select items to add to cart</p></div></div>');
                // add tooltip to the page 
                $('div.recipeTabs-actions').append(toolTip);
                $('button.recipeTabs-addToCart').addClass('disabled');
                // call the tooltip handler function in order to remove it when the correct parameters are set 
                this.toolTipHandler();
                // stop function from moving forward
                return;
            } 
            // if there are selected items determine whether there is an existing cart or not and pass in product ids array
            this.getUserCart(pids, addedItemsData);
        });
    }

    getUserCart(pids, addedItemsData) {
        // console.log('Get user cart is firing');
        // console.log('Data: ', pids, addedItemsData);
        // api call to get the cart items
        $.ajax({
            method: 'GET',
            url: '/api/storefront/carts',
            dataType: 'json',
            success: (response) => {
                // console.log('success', response);
            },
            error: (error) => {
                console.log('error', error);
            },
        }).done((response) => {
            // check to see if the cart response has products init
            if (response.length > 0) {
                const cartId = response[0].id;
                this.addToExistingCart(cartId, pids, addedItemsData);
            } else {
                this.createNewCart(pids, addedItemsData);
            }            
        });
    }

    addToExistingCart(cartId, pids, addedItemsData) {
        // console.log(`init add to existing cart.`);
        // console.log(`Product IDs: ${pids}. Added items list: `, addedItemsData);
        // set up item object
        let itemsObj = {
            "lineItems": []
        };
        // add items to the object
        for (let index = 0; index < addedItemsData.length; index++) {
            const item = addedItemsData[index];
            const obj = {
                'quantity': item.quantity,
                'productId': item.productId
            }
            itemsObj.lineItems.push(obj);
        }
        // configure API settings
        var settings = {
            "url": `/api/storefront/carts/${cartId}/items`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(itemsObj)
        };
        // make call to add items to cart
        $.ajax(settings).done((response) => {
            // console.log('Add to exsisting response: ');     
            // grab the quantity of items added to cart
            let itemCount = itemsObj.lineItems.length;
            // grab the current countpill value
            let currentCartCount = parseInt($('.navUser-item--cart span.countPill').text(), 10);
            // if there are no items reset value to 0
            if (currentCartCount === NaN) {
                currentCartCount = 0;
            };
            itemCount = itemCount + currentCartCount;
            // update the countpill value
            $('span.countPill').text(itemCount);
            this.addToCartToaster(addedItemsData);
            // deselect the checkboxes
            this.deselectCheckboxes();
        }).fail((response) => {
            this.addToCartFail(response);
        });
    }

    createNewCart(pids, addedItemsData) {
        // console.log(`init create new cart, Product IDs: ${pids}, ${addedItemsData}`)
        // set up item object
        let itemsObj = {
            "lineItems": []
        };
        // add items to the object
        for (let index = 0; index < addedItemsData.length; index++) {
            const item = addedItemsData[index];
            const obj = {
                'quantity': item.quantity,
                'productId': item.productId
            }
            itemsObj.lineItems.push(obj);
        }
        // configure API settings
        var settings = {
            "url": `/api/storefront/carts`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(itemsObj)
        };
        $.ajax(settings).done((response) => {
            // console.log('Create Cart Response: ', response)
            const itemCount = itemsObj.lineItems.length;        
            // update the countpill value
            $('.navUser-item--cart span.countPill').text(itemCount).addClass('countPill--positive');
            this.addToCartToaster(addedItemsData);
            // deselect checkboxes
            this.deselectCheckboxes();
        }).fail((response) => {
            console.log(response);
            this.addToCartFail(response);
        })
    }

    addToCartFail(response) {
        console.log('init add to cart fail')
        // check the response message for stock message on associated items
        if (response.responseJSON.title === 'Not enough stock' && $('li.associatedItem-item').length) {
            // iterate over the associated items
            $('li.associatedItem-item').each((index, item) => {
                // get the item name
                let itemName = $(item).find('h3.associatedItem-name').text();
                // check the item name to see if it is a substring in the response message
                if (response.responseJSON.detail.includes(itemName)) {
                    this.customModal(itemName, 'is out of stock and has been removed from the bundle. Please try again.', 'Close');                    
                    $('ul.associatedItem-list').slick('slickRemove', `${$(item).attr('data-slick-index')}`);
                    // call slick refresh method
                    $('ul.associatedItem-list').slick('refresh');
                    this.refreshAssociatedItemData();
                }
            });
        }
    }

    toolTipHandler() {
        // listen for change on special product checkboxes
        $('input.specialProduct-checkbox').on('change', (e) => {
            // if the checkbox is checked and the tooltip exists add animation and remove from DOM
            if ($(e.currentTarget).prop('checked') && $('div.recipeTabs-tooltip').length) {
                $('div.recipeTabs-tooltip').addClass('remove');
                $('button.recipeTabs-addToCart').removeClass('disabled');
                setTimeout(() => {
                    $('div.recipeTabs-tooltip').remove();
                }, 1000);
            }
        });
    }

    selectAll() {
        // set up event listener for select all
        $('button.recipeTabs-selectAll').on('click', (e) => {
            // grab all the purchaseable items with checkboxes
            const itemsArr = $('li.ingredient.can-purchase');
            // if there are no checkboxes, return
            if (!itemsArr.length) {
                return;
            } 
            // iterate over all the items
            for (let index = 0; index < itemsArr.length; index++) {
                const item = itemsArr[index];
                // grab the checkbox
                const checkbox = $(item).find('input.specialProduct-checkbox');
                // if it is not checked, check it
                if (!checkbox.prop('checked')) {
                    checkbox.prop('checked', true);
                }
            }
        });
    }

    deselectCheckboxes() {
        // grab all the purchaseable items with checkboxes
        const itemsArr = $('li.ingredient.can-purchase');
        // if there are no checkboxes, return
        if (!itemsArr.length) {
            return;
        } 
        // iterate over all the items
        for (let index = 0; index < itemsArr.length; index++) {
            const item = itemsArr[index];
            // grab the checkbox
            const checkbox = $(item).find('input.specialProduct-checkbox');
            // if it is checked, uncheck it
            if (checkbox.prop('checked')) {
                checkbox.prop('checked', false);
            }
        }
    }

    specialProducts() {
        // console.log('init special products');
        let specialProductsArray = $('li.ingredient.can-purchase');
        for (let index = 0; index < specialProductsArray.length; index++) {
            const product = specialProductsArray[index];
            // get the product id
            const pid = $(product).find('form').attr('data-sku');
            // get the currency code
            let currencyCode = this.context.currency;
            // set up data for GraphQL call and inject parameters
            const data = {
                type: 'POST',
                url: '/graphql',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${this.context.storefrontApiToken}`,
                },
                data: JSON.stringify({
                    query: `query getProductData{
                        site {
                          product(sku: "${pid}") {
                            name
                            id
                            entityId
                            prices(
                              includeTax: false, currencyCode: ${currencyCode}){
                              price {
                                value:value
                              }
                            }
                          }
                        }
                      }`
                }),
            };
            $.ajax(data).done((response) => {
                // console.log('response ==> ', response);
                let price = parseFloat(response.data.site.product.prices.price.value).toFixed(2);
                $(product).find('span.specialProduct-price').text('$' + price);
                $(product).attr('data-entityId', response.data.site.product.entityId);
            }).fail((error) => {
                console.log(`Error `, error); 
            });
        }
    }
    
    recipeTabManager() {
        $('ul.recipeTabs-controls').on('click', 'a.recipeTab-action', (e) => {
            const targetId = $(e.currentTarget).attr('href');
            $('div.recipeTab-content.is-active').removeClass('is-active');
            $(`div${targetId}`).addClass('is-active');
        });
    }

    methodCheckList() {
        // console.log('init method checklist');
        $('#recipeTab-method ol li').on('click', (e) => {
            if ($(e.currentTarget).hasClass('checked')) {
                $(e.currentTarget).removeClass('checked');
            } else {
                $(e.currentTarget).addClass('checked');
            }
        });
    }

    registerAddToCartValidation() {
        this.addToCartValidator.add([{
            selector: '[data-quantity-change] > .form-input--incrementTotal',
            validate: (cb, val) => {
                const result = forms.numbersOnly(val);
                cb(result);
            },
            errorMessage: this.context.productQuantityErrorMessage,
        }]);

        return this.addToCartValidator;
    }

    storeInitMessagesForSwatches() {
        if (this.swatchGroupIdList.length && isEmpty(this.swatchInitMessageStorage)) {
            this.swatchGroupIdList.each((_, swatchGroupId) => {
                if (!this.swatchInitMessageStorage[swatchGroupId]) {
                    this.swatchInitMessageStorage[swatchGroupId] = $(`#${swatchGroupId} ~ .swatch-option-message`).text().trim();
                }
            });
        }
    }

    setProductVariant() {
        const unsatisfiedRequiredFields = [];
        const options = [];

        $.each($('[data-product-attribute]'), (index, value) => {
            const optionLabel = value.children[0].innerText;
            const optionTitle = optionLabel.split(':')[0].trim();
            const required = optionLabel.toLowerCase().includes('required');
            const type = value.getAttribute('data-product-attribute');

            if ((type === 'input-file' || type === 'input-text' || type === 'input-number') && value.querySelector('input').value === '' && required) {
                unsatisfiedRequiredFields.push(value);
            }

            if (type === 'textarea' && value.querySelector('textarea').value === '' && required) {
                unsatisfiedRequiredFields.push(value);
            }

            if (type === 'date') {
                const isSatisfied = Array.from(value.querySelectorAll('select')).every((select) => select.selectedIndex !== 0);

                if (isSatisfied) {
                    const dateString = Array.from(value.querySelectorAll('select')).map((x) => x.value).join('-');
                    options.push(`${optionTitle}:${dateString}`);

                    return;
                }

                if (required) {
                    unsatisfiedRequiredFields.push(value);
                }
            }

            if (type === 'set-select') {
                const select = value.querySelector('select');
                const selectedIndex = select.selectedIndex;

                if (selectedIndex !== 0) {
                    options.push(`${optionTitle}:${select.options[selectedIndex].innerText}`);

                    return;
                }

                if (required) {
                    unsatisfiedRequiredFields.push(value);
                }
            }

            if (type === 'set-rectangle' || type === 'set-radio' || type === 'swatch' || type === 'input-checkbox' || type === 'product-list') {
                const checked = value.querySelector(':checked');
                if (checked) {
                    const getSelectedOptionLabel = () => {
                        const productVariantslist = convertIntoArray(value.children);
                        const matchLabelForCheckedInput = inpt => inpt.dataset.productAttributeValue === checked.value;
                        return productVariantslist.filter(matchLabelForCheckedInput)[0];
                    };
                    if (type === 'set-rectangle' || type === 'set-radio' || type === 'product-list') {
                        const label = isBrowserIE ? getSelectedOptionLabel().innerText.trim() : checked.labels[0].innerText;
                        if (label) {
                            options.push(`${optionTitle}:${label}`);
                        }
                    }

                    if (type === 'swatch') {
                        const label = isBrowserIE ? getSelectedOptionLabel().children[0] : checked.labels[0].children[0];
                        if (label) {
                            options.push(`${optionTitle}:${label.title}`);
                        }
                    }

                    if (type === 'input-checkbox') {
                        options.push(`${optionTitle}:Yes`);
                    }

                    return;
                }

                if (type === 'input-checkbox') {
                    options.push(`${optionTitle}:No`);
                }

                if (required) {
                    unsatisfiedRequiredFields.push(value);
                }
            }
        });

        let productVariant = unsatisfiedRequiredFields.length === 0 ? options.sort().join(', ') : 'unsatisfied';
        const view = $('.productView');

        if (productVariant) {
            productVariant = productVariant === 'unsatisfied' ? '' : productVariant;
            if (view.attr('data-event-type')) {
                view.attr('data-product-variant', productVariant);
            } else {
                const productName = view.find('.productView-title')[0].innerText.replace(/"/g, '\\$&');
                const card = $(`[data-name="${productName}"]`);
                card.attr('data-product-variant', productVariant);
            }
        }
    }

    /**
     * Checks if the current window is being run inside an iframe
     * @returns {boolean}
     */
    isRunningInIframe() {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    }

    /**
     *
     * Handle product options changes
     *
     */
    productOptionsChanged(event) {
        const $changedOption = $(event.target);
        const $form = $changedOption.parents('form');
        const productId = $('[name="product_id"]', $form).val();

        // Do not trigger an ajax request if it's a file or if the browser doesn't support FormData
        if ($changedOption.attr('type') === 'file' || window.FormData === undefined) {
            return;
        }

        utils.api.productAttributes.optionChange(productId, $form.serialize(), 'products/bulk-discount-rates', (err, response) => {
            const productAttributesData = response.data || {};
            const productAttributesContent = response.content || {};
            this.updateProductAttributes(productAttributesData);
            this.updateView(productAttributesData, productAttributesContent);
            bannerUtils.dispatchProductBannerEvent(productAttributesData);

            if (!this.checkIsQuickViewChild($form)) {
                const $context = $form.parents('.productView').find('.productView-info');
                modalFactory('[data-reveal]', { $context });
            }
        });
    }

    /**
     * if this setting is enabled in Page Builder
     * show name for swatch option
     */
    showSwatchNameOnOption($swatch, $swatchGroup) {
        const swatchName = $swatch.attr('aria-label');
        const activeSwatchGroupId = $swatchGroup.attr('aria-labelledby');
        const $swatchOptionMessage = $(`#${activeSwatchGroupId} ~ .swatch-option-message`);

        $('#firstOptionLabel span').text(swatchName);
        $swatchOptionMessage.text(`${this.swatchInitMessageStorage[activeSwatchGroupId]} ${swatchName}`);
        this.setLiveRegionAttributes($swatchOptionMessage, 'status', 'assertive');
    }

    setLiveRegionAttributes($element, roleType, ariaLiveStatus) {
        $element.attr({
            role: roleType,
            'aria-live': ariaLiveStatus,
        });
    }

    checkIsQuickViewChild($element) {
        return !!$element.parents('.quickView').length;
    }

    showProductImage(image) {
        if (isPlainObject(image)) {
            const zoomImageUrl = utils.tools.imageSrcset.getSrcset(
                image.data,
                { '1x': this.context.zoomSize },
                /*
                    Should match zoom size used for data-zoom-image in
                    components/products/product-view.html
                    Note that this will only be used as a fallback image for browsers that do not support srcset
                    Also note that getSrcset returns a simple src string when exactly one size is provided
                */
            );

            const mainImageUrl = utils.tools.imageSrcset.getSrcset(
                image.data,
                { '1x': this.context.productSize },
                /*
                    Should match fallback image size used for the main product image in
                    components/products/product-view.html
                    Note that this will only be used as a fallback image for browsers that do not support srcset
                    Also note that getSrcset returns a simple src string when exactly one size is provided
                */
            );

            const mainImageSrcset = utils.tools.imageSrcset.getSrcset(image.data);

            this.imageGallery.setAlternateImage({
                mainImageUrl,
                zoomImageUrl,
                mainImageSrcset,
            });
        } else {
            this.imageGallery.restoreImage();
        }
    }

    /**
     *
     * Handle action when the shopper clicks on + / - for quantity
     *
     */
    listenQuantityChange() {
        this.$scope.on('click', '[data-quantity-change] button', event => {
            event.preventDefault();
            const $target = $(event.currentTarget);
            const viewModel = this.getViewModel(this.$scope);
            const $input = viewModel.quantity.$input;
            const quantityMin = parseInt($input.data('quantityMin'), 10);
            const quantityMax = parseInt($input.data('quantityMax'), 10);

            let qty = forms.numbersOnly($input.val()) ? parseInt($input.val(), 10) : quantityMin;
            // If action is incrementing
            if ($target.data('action') === 'inc') {
                qty = forms.validateIncreaseAgainstMaxBoundary(qty, quantityMax);
            } else if (qty > 1) {
                qty = forms.validateDecreaseAgainstMinBoundary(qty, quantityMin);
            }

            // update hidden input
            viewModel.quantity.$input.val(qty);
            // update text
            viewModel.quantity.$text.text(qty);
            // perform validation after updating product quantity
            this.addToCartValidator.performCheck();
        });

        // Prevent triggering quantity change when pressing enter
        this.$scope.on('keypress', '.form-input--incrementTotal', event => {
            // If the browser supports event.which, then use event.which, otherwise use event.keyCode
            const x = event.which || event.keyCode;
            if (x === 13) {
                // Prevent default
                event.preventDefault();
            }
        });
    }

    /**
     *
     * Add a product to cart
     *
     */
    addProductToCart(event, form) {
        const $addToCartBtn = $('#form-action-addToCart', $(event.target));
        const originalBtnVal = $addToCartBtn.val();
        const waitMessage = $addToCartBtn.data('waitMessage');

        // Do not do AJAX if browser doesn't support FormData
        if (window.FormData === undefined) {
            return;
        }

        // Prevent default
        event.preventDefault();

        $addToCartBtn
            .val(waitMessage)
            .prop('disabled', true);

        this.$overlay.show();

        // Add item to cart
        utils.api.cart.itemAdd(normalizeFormData(new FormData(form)), (err, response) => {
            if (response !== undefined) {
                currencySelector(response.data.cart_id);
            }
            const errorMessage = err || response.data.error;

            $addToCartBtn
                .val(originalBtnVal)
                .prop('disabled', false);

            this.$overlay.hide();

            // Guard statement
            if (errorMessage) {
                // Strip the HTML from the error message
                const tmp = document.createElement('DIV');
                tmp.innerHTML = errorMessage;

                if (!this.checkIsQuickViewChild($addToCartBtn)) {
                    alertModal().$preModalFocusedEl = $addToCartBtn;
                }

                return showAlertModal(tmp.textContent || tmp.innerText);
            }

            // Open preview modal and update content
            if (this.previewModal) {
                this.previewModal.open();

                if (window.ApplePaySession) {
                    this.previewModal.$modal.addClass('apple-pay-supported');
                }

                if (!this.checkIsQuickViewChild($addToCartBtn)) {
                    this.previewModal.$preModalFocusedEl = $addToCartBtn;
                }

                this.updateCartContent(this.previewModal, response.data.cart_item.id);
            } else {
                // set up data for add to cart toaster
                // get quantity of items added to cart
                let qty = parseInt(document.getElementById('qty[]').value, 10);
                let items = [{name: this.context.productTitle, quantity: qty}];
                // call modal function and pass in item data
                this.addToCartToaster(items);
                let currentCartCount = parseInt($('.navUser-item--cart span.countPill').text(), 10);
                // if there are no items reset value to 0
                if (currentCartCount === NaN) {
                    currentCartCount = 0;
                };
                let totalItems = currentCartCount + qty;
                // update the countpill value
                $('.navUser-item--cart span.countPill').text(totalItems).addClass('countPill--positive');
            }
        });

        this.setLiveRegionAttributes($addToCartBtn.next(), 'status', 'polite');
    }

    /**
     * Get cart contents
     *
     * @param {String} cartItemId
     * @param {Function} onComplete
     */
    getCartContent(cartItemId, onComplete) {
        const options = {
            template: 'cart/preview',
            params: {
                suggest: cartItemId,
            },
            config: {
                cart: {
                    suggestions: {
                        limit: 4,
                    },
                },
            },
        };

        utils.api.cart.getContent(options, onComplete);
    }

    /**
     * Redirect to url
     *
     * @param {String} url
     */
    redirectTo(url) {
        if (this.isRunningInIframe() && !window.iframeSdk) {
            window.top.location = url;
        } else {
            window.location = url;
        }
    }

    /**
     * Update cart content
     *
     * @param {Modal} modal
     * @param {String} cartItemId
     * @param {Function} onComplete
     */
    updateCartContent(modal, cartItemId, onComplete) {
        this.getCartContent(cartItemId, (err, response) => {
            if (err) {
                return;
            }
            // console.log("get cart content response", response)
            modal.updateContent(response);

            // Update cart counter
            const $body = $('body');
            const $cartQuantity = $('[data-cart-quantity]', modal.$content);
            const $cartCounter = $('.navUser-action .cart-count');
            const quantity = $cartQuantity.data('cartQuantity') || 0;
            const $promotionBanner = $('[data-promotion-banner]');
            const $backToShopppingBtn = $('.previewCartCheckout > [data-reveal-close]');
            const $modalCloseBtn = $('#previewModal > .modal-close');
            const bannerUpdateHandler = () => {
                const $productContainer = $('#main-content > .container');

                $productContainer.append('<div class="loadingOverlay pdp-update"></div>');
                $('.loadingOverlay.pdp-update', $productContainer).show();
                window.location.reload();
            };

            $cartCounter.addClass('cart-count--positive');
            $body.trigger('cart-quantity-update', quantity);

            if (onComplete) {
                onComplete(response);
            }

            if ($promotionBanner.length && $backToShopppingBtn.length) {
                $backToShopppingBtn.on('click', bannerUpdateHandler);
                $modalCloseBtn.on('click', bannerUpdateHandler);
            }
        });
    }

    /**
     * Hide or mark as unavailable out of stock attributes if enabled
     * @param  {Object} data Product attribute data
     */


    updateProductAttributes(data) {
        super.updateProductAttributes(data);
        this.showProductImage(data.image);
        if (data.instock){
            $('#stock-label span').text("In Stock")
            $('#stock-label').removeClass("out-stock")
        }else{
            $('#stock-label span').text("Out of Stock")
            $('#stock-label').addClass("out-stock")
        }
    }
}
