getUserCart(addToCartClick, form = null) {
    // console.log('Get user cart is firing');
    // setting empty array for products in user shopping cart
    const productIdList = [];
    // api call to get the cart items
    $.ajax({
        method: 'GET',
        url: '/api/storefront/carts',
        dataType: 'json',
        success: (response) => {
            // console.log('success', response);
        },
        error: (error) => {
            // console.log('error', error);
        },
    }).done((response) => {
        // console.log('Done response...', response);
        // check to see if the cart response has products init
        if (response.length > 0) {
            // check to see if there are products in the cart object
            if (response[0].lineItems.physicalItems.length > 0) {
                const products = response[0].lineItems.physicalItems;
                // iterate over the products
                for (let i = 0; i < products.length; i++) {
                    // add the product ID to the productIdList array
                    productIdList.push(products[i].productId);
                }
                // console.log('productIdList', productIdList);
                this.fflCartItems(productIdList, addToCartClick, form);
            } else {
                // console.log('No items in cart... but cart exists');
                // $('#add-to-cart-wrapper').removeClass('disabled');
                this.productType(false, true, addToCartClick, form);
            }
        } else {
            // console.log('Cart is empty, skip to next step');
            // if there are no products in the cart, set cart empty to true and product type to non-ffl
            this.productType(false, true, addToCartClick, form);
        }
    });
}