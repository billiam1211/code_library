testGraphQl() {
    const productsArray = [421, 463, 462, 465];
    productsArray.toString();
    const graphQLQuery = `query SingleProduct {
                site {
                    products(entityIds: [421, 463, 462, 465]) {
                        edges {
                            node {
                                id
                                entityId
                                sku
                                name
                                prices {
                                    price {
                                        value
                                        currencyCode
                                    }
                                }
                            }
                        }
                    }
                }
            }
            `;

            fetch('/graphql', {
                'method': 'POST',
                'credentials': 'include',
                'mode': 'cors',
                'headers': {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.context.storefrontToken}`
                },
                body: JSON.stringify({
                    query: graphQLQuery
                }),
            })
            .then(res => {
                // Here is our data
                console.log(res.data);
    
            });

    // sample template of a graphQL api call
    $.ajax({
        type: 'POST',
        url: '/graphql',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${this.context.storefrontToken}`,
        },
        data: JSON.stringify({
            query: `
                query SingleProduct {
                    site {
                      products (entityIds: [421, 463, 462, 465]) {
                        edges {
                          node {
                            id
                            entityId
                            sku
                            name
                            prices {
                              price {
                                value
                                currencyCode
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                `,
        }),
        success: response => {
            console.log('success');
        },
        error: () => {
            console.log('error');
        },
    }).done((response) => {
        console.log('Response ==>', response.data);

        console.log(response.data.site.products.edges);

        const productsArray = response.data.site.products.edges;

        for (let index = 0; index < productsArray.length; index++) {
            const element = productsArray[index];

            console.log(`Name: ${element.node.name}`);
            const cardTemplate = `<article class="card"><h2 class="card-title">${element.node.name}</h2><span>$${element.node.prices.price.value}</span></article>`;

            $('.banner-content').append(cardTemplate);
        }
        // store products array in a variable
    });
}

fetch('/graphql', {
    'method': 'POST',
    'credentials': 'include',
    'mode': 'cors',
    'headers': {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.context.storefrontToken}`
    },
    body: JSON.stringify({
        query: graphQLQuery
    }),
})
.then(res => {
    // Here is our data
    console.log(res.data);

});