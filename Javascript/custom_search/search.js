import 'focus-within-polyfill';
import './global/jquery-migrate';
import './common/select-option-plugin';
import PageManager from './page-manager';
import quickSearch from './global/quick-search';
import currencySelector from './global/currency-selector';
import mobileMenuToggle from './global/mobile-menu-toggle';
import menu from './global/menu';
import foundation from './global/foundation';
import quickView from './global/quick-view';
import cartPreview from './global/cart-preview';
import carousel from './common/carousel';
import svgInjector from './global/svg-injector';
import globalEvents from './custom/global-events';
import { invert } from 'lodash';

export default class Global extends PageManager {
	onReady() {
		const { cartId, secureBaseUrl } = this.context;
		cartPreview(secureBaseUrl, cartId);
		quickSearch();
		currencySelector(cartId);
		foundation($(document));
		quickView(this.context);
		carousel(this.context);
		menu();
		mobileMenuToggle();
		svgInjector();
		globalEvents(this.context);
		this.documentHandler();
	}

	documentHandler() {
		if (document.querySelector('main.page.page--documents')) {
			let type = document.querySelector('main.page.page--documents').getAttribute('data-page');
			if (type == 'brochures') {
				type = 'brochure';
			}
			const cards = [];
			// set up query for metafield data
			const query = `
                query documents {
                    site {
                        brands {
                            edges {
                                node {
                                    metafields(namespace: "brand_data", keys: ["sds", "instructions", "brochure"]) {
                                        edges {
                                            node {
                                                key
                                                value
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            `;
			// get data from metafields
			fetch('/graphql', {
				method: 'POST',
				credentials: 'include',
				mode: 'cors',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${this.context.storefrontToken}`,
				},
				body: JSON.stringify({
					query: query,
				}),
			})
				.then(res => {
					return res.json();
				})
				.then(data => {
					if (data.data.site.brands.edges) {
						// iterate over metafield data edges
						for (let i = 0; i < data.data.site.brands.edges.length; i++) {
							const node = data.data.site.brands.edges[i];
							// check each node
							for (let x = 0; x < node.node.metafields.edges.length; x++) {
								const edge = node.node.metafields.edges[x];
								if (type == edge.node.key) {
									// convert to JSON
									const json = JSON.parse(edge.node.value);
									// iterate over JSON and create obj with all required card data
									json.forEach(el => {
										const obj = {
											type: edge.node.key,
											id: el.__id ? el.__id : '',
											name: el.name ? el.name.replaceAll('_', ' ') : '',
											url: el.file_url ? el.file_url : '',
											revision: el.revision_date ? el.revision_date : '',
											lang: el.language ? el.language : '',
											archived: el.archived ? el.archived : '',
											image: el.image_url ? el.image_url : '',
										};
										// check for url value, if no value omit since there will be no download available
										if (el.file_url) {
											// push obj into array
											cards.push(obj);
											cards.push(obj);
											cards.push(obj);
											cards.push(obj);
											cards.push(obj);
											cards.push(obj);
											cards.push(obj);
											cards.push(obj);
											cards.push(obj);
											cards.push(obj);
											cards.push(obj);
											cards.push(obj);
											cards.push(obj);
										}
									});
								}
							}
						}
						this.refreshCards(cards, type);
						this.documentSearchHandler(cards, type);
                        document.querySelector('div.documentBlock').classList.remove('processing');
					}
				});
		}
	}

	refreshCards(cards, type) {
        const documentBlock = document.querySelector('div.documentBlock');
        const documentList = document.querySelector('ul.documentList');
        documentBlock.classList.contains('processing') ? "" : documentBlock.classList.add('processing');
		documentList.innerHTML = '';
        documentList.parentElement.classList.remove('has-search');
		// iterate over array created from GQL response
		cards
			.sort((a, b) => a.name.localeCompare(b.name))
			.forEach((card, index) => {
				let template;
				// set up template based on 1 of 3 types, ie: instructions, brochures, or SDS and inject data
				if (type == 'instructions') {
					template = `<li class="documentItem instructions" data-index="${index}">
                            <div class="documentCard">
                                <a class="documentAction" href="${card.url}"> 
                                    <div class="headerBlock">
                                        <div class="icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                            <mask id="mask0_3003_35476" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                                                <rect width="24" height="24" fill="#D9D9D9"/>
                                                </mask>
                                                <g mask="url(#mask0_3003_35476)">
                                                    <path d="M12 15.7885L7.73075 11.5192L8.78475 10.4348L11.25 12.9V4.5H12.75V12.9L15.2153 10.4348L16.2693 11.5192L12 15.7885ZM4.5 19.5V14.9808H6V18H18V14.9808H19.5V19.5H4.5Z" fill="#0079C1"/>
                                                </g>
                                            </svg>
                                        </div>
                                        <div class="title">
                                            <h3 data-search>${card.name}</h3>
                                            <span class="revision" data-search>${card.revision}</span>
                                        </div>
                                    </div>
                                    <div class="footerBlock">
                                        <button>PDF</button>
                                        <button>Archive</button>
                                    </div>
                                </a>
                            </div>
                        </li>`;
				}
				if (type == 'sds') {
					template = `<li class="documentItem sds" data-index="${index}">
                            <div class="documentCard">
                                <a class="documentAction" href="${card.url}"> 
                                    <div class="headerBlock">
                                        <div class="icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                            <mask id="mask0_3003_35476" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                                                <rect width="24" height="24" fill="#D9D9D9"/>
                                                </mask>
                                                <g mask="url(#mask0_3003_35476)">
                                                    <path d="M12 15.7885L7.73075 11.5192L8.78475 10.4348L11.25 12.9V4.5H12.75V12.9L15.2153 10.4348L16.2693 11.5192L12 15.7885ZM4.5 19.5V14.9808H6V18H18V14.9808H19.5V19.5H4.5Z" fill="#0079C1"/>
                                                </g>
                                            </svg>
                                        </div>
                                        <div class="title">
                                            <h3 data-search>${card.name}</h3>
                                            <span class="revision" data-search>${card.lang}</span>
                                        </div>
                                    </div>
                                    <div class="footerBlock">
                                        <button>PDF</button>
                                    </div>
                                </a>
                            </div>
                        </li>`;
				}
				if (type == 'brochure') {
					template = `
                            <li class="documentItem brochure" data-index="${index}">
                                <a class="brochure-action" href="${card.url}">
                                    <div class="brochure-card">
                                        <div class="brochure-container">
                                            <div class="brochure-image${card.image ? '' : ' loading'}">
                                                <img src="${card.image ? card.image : '/assets/img/loading.svg'}" alt="${card.name}">
                                            </div>
                                            <div class="brochure-content">
                                                <div class="brochure-header">
                                                    <div class="title">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                            <mask id="mask0_3003_35476" style="mask-type: alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                                                                <rect width="24" height="24" fill="#D9D9D9" />
                                                            </mask>
                                                            <g mask="url(#mask0_3003_35476)">
                                                                <path d="M12 15.7885L7.73075 11.5192L8.78475 10.4348L11.25 12.9V4.5H12.75V12.9L15.2153 10.4348L16.2693 11.5192L12 15.7885ZM4.5 19.5V14.9808H6V18H18V14.9808H19.5V19.5H4.5Z" fill="#0079C1" />
                                                            </g>
                                                        </svg>
                                                        <span data-search>
                                                            ${card.name}
                                                        </span>
                                                    </div>
                                                    <p class="label">Brochure</p>
                                                </div>
                                                <div class="brochure-footer">
                                                    <button>PDF</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            </li>
                        `;
				}
				// write card to page
				document.querySelector('ul.documentList').innerHTML += template;
			});
		this.documentPagination();
        setTimeout(() => {
            documentBlock.classList.contains('processing') ? documentBlock.classList.remove('processing') : '';
        }, 1000);
	}

	documentPagination() {
        const pagination = document.querySelector('div.document-pagination');
		pagination.innerHTML = '';
		pagination.innerHTML = `
            <button class="previous">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <mask id="mask0_3159_15348" style="mask-type: alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                        <rect width="24" height="24" fill="#D9D9D9" />
                    </mask>
                    <g mask="url(#mask0_3159_15348)">
                        <path d="M12.9457 11.9995L8.3457 7.39945L9.39945 6.3457L15.0532 11.9995L9.39945 17.6532L8.3457 16.5995L12.9457 11.9995Z" fill="#231F20" />
                    </g>
                </svg>
            </button>
            <ul class="pagination-list"></ul>
            <button class="next">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <mask id="mask0_3159_15348" style="mask-type: alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                        <rect width="24" height="24" fill="#D9D9D9" />
                    </mask>
                    <g mask="url(#mask0_3159_15348)">
                        <path d="M12.9457 11.9995L8.3457 7.39945L9.39945 6.3457L15.0532 11.9995L9.39945 17.6532L8.3457 16.5995L12.9457 11.9995Z" fill="#231F20" />
                    </g>
                </svg>
            </button>
        `;
		// set up re-usable vars
		const next = document.querySelector('div.document-pagination button.next');
		const prev = document.querySelector('div.document-pagination button.previous');
		// min and max or set initially at page load and then updated
		let min = JSON.parse(document.querySelector('div.documentBlock').getAttribute('data-pagination'))[0];
		let max = JSON.parse(document.querySelector('div.documentBlock').getAttribute('data-pagination'))[1];
		// card elements
		let cards = document.querySelectorAll('ul.documentList li');
		// max number of actual cards written to the DOM
		const limit = cards.length - 1;
		// # of cards shown per page
		const interval = 28;
		// total # of possible pages, rounding up as there are no partial pages
		let pageCount = Math.ceil(limit / interval);
		const paginationList = document.querySelector('ul.pagination-list');
		// set up pagination items based on the total number of pages
		paginationList.innerHTML = '';
		let index = 1;
		while (paginationList.children.length < pageCount) {
			paginationList.innerHTML += `
                <li class="pagination-item${index === 1 ? ' active' : ''}">
                    <button data-index="${paginationList.children.length + 1}">
                        ${paginationList.children.length ? paginationList.children.length + 1 : 1}
                    </button>
                </li>`;
			index++;
		}
		if (pageCount > 5) {
			// truncate class shows the first 3 pages and last page with ". . ." in between
			paginationList.classList.add('truncate');
		}
		// handler to manage visibility of cards based on min and max values
		const cardVisibilityHandler = () => {
			cards.forEach(card => {
				let cardIndex = card.getAttribute('data-index');
				if (cardIndex >= min && cardIndex <= max) {
					card.classList.add('active');
				} else {
					card.classList.remove('active');
				}
			});
		};
		// init card visibility on page load
		cardVisibilityHandler();
		// next click handler
		const nextClickHandler = () => {
			min = min + interval;
			max = max + interval > limit ? limit : max + interval;
			// disable next button if there are no subsequent pages
			if (max == limit) {
				next.classList.add('disabled');
			}
			// enable the prev button
			prev.classList.remove('disabled');
			let target = document.querySelector('li.pagination-item.active');
			// remove active class from the active pagination item
			target?.classList.remove('active');
			// move active class to the next pagination item
			target?.nextElementSibling.classList.add('active');
			// manage the ellipses class which shows/hides the "..." from the .truncate class. When there are only 5 pagination items remaining, the "..." should be hidden
			if (pageCount > 5 && target.nextElementSibling.querySelector('button').getAttribute('data-index') > pageCount - 5) {
				paginationList.classList.add('ellipses');
			} else {
				paginationList.classList.remove('ellipses');
			}
			cardVisibilityHandler();
		};
		const prevClickHandler = () => {
			min = min - interval < 0 ? 0 : min - interval;
			max = max - interval;
			if (min == 0) {
				prev.classList.add('disabled');
			}
			next.classList.remove('disabled');
			let target = document.querySelector('li.pagination-item.active');
			target?.classList.remove('active');
			target?.previousElementSibling.classList.add('active');
			if (pageCount > 5 && target?.previousElementSibling.querySelector('button').getAttribute('data-index') > pageCount - 5) {
				paginationList.classList.add('ellipses');
			} else {
				paginationList.classList.remove('ellipses');
			}
			cardVisibilityHandler();
		};
		next.removeEventListener('click', nextClickHandler);
		next.addEventListener('click', nextClickHandler);
		// previous click handler
		prev.removeEventListener('click', prevClickHandler);
		prev.addEventListener('click', prevClickHandler);
		// only show prev / next buttons if there is more than 1 page of results
		if (document.querySelectorAll('ul.pagination-list li button').length > 1) {
			next.classList.add('visible');
			prev.classList.add('visible');
		}
		// set up click listeners for each pagination item
		document.querySelectorAll('ul.pagination-list li button').forEach(action => {
			const paginationClickHandler = (e) => {
				// manage active class
				document.querySelector('ul.pagination-list li.active')?.classList.remove('active');
				e.currentTarget.parentElement.classList.add('active');
				if (pageCount > 5 && e.currentTarget.getAttribute('data-index') > pageCount - 5) {
					paginationList.classList.add('ellipses');
				} else {
					paginationList.classList.remove('ellipses');
				}
				// determine multiple factor
				const factor = parseInt(action.getAttribute('data-index'));
				// determine max value based on page multiple
				if (interval * factor - 1 > limit) {
					max = limit;
					next.classList.add('disabled');
				} else {
					max = interval * factor - 1;
					next.classList.remove('disabled');
				}
				// determine min value based on page multiple
				if (interval * factor == interval) {
					min = 0;
					prev.classList.add('disabled');
				} else {
					min = interval * (factor - 1);
					prev.classList.remove('disabled');
				}
				// call to update card visibility
				cardVisibilityHandler();
			};
			action.removeEventListener('click', paginationClickHandler);
			action.addEventListener('click', paginationClickHandler);
		});
	}

	documentSearchHandler(cards, pageType) {
		let timer;
        let hasResults = false;
		const documentList = document.querySelector('ul.documentList');
		const documentItems = Array.from(document.querySelectorAll('li.documentItem'));
		const documentBlock = document.querySelector('div.documentBlock');

		const sortSearchResults = () => {
			const sortedItems = documentItems.sort((a, b) => {
				return +b.dataset.relevance - +a.dataset.relevance;
			});
			documentList.innerHTML = '';
			sortedItems.forEach(item => {
				documentList.append(item);
			});
		};
		const queryCompareHandler = (query, item) => {
			// set array for the user query to be split up into normalized words
			const queryWords = [];
			// normalize query and split into elements by spaces
			query
				.toLowerCase()
				.replaceAll(/[&\/\\#\_\,\-+()$~%.'":*?<>{}]/g, '')
				.split(' ')
				.forEach(word => {
					queryWords.push(word);
				});
			// set array of searchable terms for each item
			const terms = [];
			// get all searchable fields from item
			item.querySelectorAll('[data-search]').forEach(term => {
				// normalize text and split into elements
				term.innerText
					.toLowerCase()
					.replaceAll(/[&\/\\#\_\,\-+()$~%.'":*?<>{}]/g, '')
					.split(' ')
					.forEach(str => {
						terms.push(str);
					});
			});
			let match = false;
			let relevance = 0;
			queryWords.forEach(word => {
				terms.forEach(term => {
					if (term.includes(word)) {
						match = true;
						relevance++;
					}
				});
			});
			if (match) {
                hasResults = true;
				item.classList.add('match');
				item.setAttribute('data-relevance', relevance);
			} else {
				item.classList.remove('match');
				item.removeAttribute('data-relevance');
			}
		};
		const inputSearchHandler = () => {
			const query = document.querySelector('input.documentSearch-input').value.trim();
			if (!query.length) {
				document.querySelector('input.documentSearch-input').classList.add('has-error');
			} else {
				document.querySelector('input.documentSearch-input').classList.remove('has-error');
			}
			documentItems.forEach(item => {
				queryCompareHandler(query, item);
			});
            sortSearchResults();
            if (!hasResults) {
                documentList.innerHTML = `<li class="no-results">No results found for "${query}". <button class="clear-search">Try Again</button></li>`;
                document.querySelector('button.clear-search').addEventListener('click', () => {
                    document.querySelector('input.documentSearch-input').value = "";
                    this.refreshCards(cards, pageType);
                });
            }
		};
		// execute search query when there are at least 3 characters in the input
		document.querySelector('input.documentSearch-input').addEventListener('input', e => {
			documentBlock.classList.add('processing');
			documentBlock.style.height = `${window.innerHeight - documentList.getBoundingClientRect().top}px`;
			clearTimeout(timer);
			timer = setTimeout(() => {
				if (e.target.value.length >= 3) {
					inputSearchHandler();
					documentBlock.classList.add('has-search');
				} else {
					documentBlock.classList.remove('has-search');
					this.refreshCards(cards, pageType);
				}
				documentBlock.classList.remove('processing');
                documentBlock.style.height = `${documentList.offsetHeight}px`;
				setTimeout(() => {
					documentBlock.removeAttribute('style');
				}, 1000);
			}, 1000);
		});
		document.querySelector('button.documentSearch-submit').addEventListener('click', e => {
			inputSearchHandler();
		});
	}
}
