const data = {
    type: 'POST',
    url: '/graphql',
    contentType: 'application/json; charset=utf-8',
    dataType: 'json',
    headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${this.context.token}`,
    },
    data: JSON.stringify({
        query: `query getProductId {
            site {
                product(sku:"${itemSku}"){
                    name
                    entityId
                }
            }
        }`
    }),
};
// make call to graphQL to get the product entity ID from the SKU
$.ajax(data).done((response) => {
    console.log('response ======> ', response);
}).fail((error) => {
    console.log(`Error `, error); 
});