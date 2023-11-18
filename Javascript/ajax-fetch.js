
const graphQLQuery = `query SingleProduct {
                site {
                    products(entityIds: [2452, 2434]) {
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
	method: 'POST',
	credentials: 'include',
	mode: 'cors',
	headers: {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${this.context.storefrontToken}`,
	},
	body: JSON.stringify({
		query: graphQLQuery,
	}),
}).then(res => {
	// Here is our data
	console.log(res.data);
});