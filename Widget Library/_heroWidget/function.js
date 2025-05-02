export function oliveSlider() {
	const olives = document.querySelectorAll('[data-olive-slider]');
    
	olives.forEach((olive) => {
		let timer;
		let currentIndex = 0;
		let minIndex = 0;
		let maxIndex = olive.children.length - 1;
		let playInterval = null;
		let isPlaying = false;

		// get parent element
		const oliveParent = olive.parentElement;
	
		// make wrapper element
		const oliveWrapper = document.createElement('div');
		oliveWrapper?.classList.add('oliveSlider-wrapper');
	
		// add wrapper to parent and move the target element inside
		oliveParent.append(oliveWrapper);
		oliveWrapper.append(olive);
	
		// make the first child active
		olive.children[0]?.classList.add('is-active');
	
		// check for children nodes, only run slider functionality IF there are more than 1 child
		if (olive.children.length > 1) {
	
			// create actions wrapper
			const oliveActions = document.createElement('div');
			oliveActions?.classList.add('oliveSlider-actions');
	
			// create play button
			const playButton = document.createElement('button');
			playButton.setAttribute('data-play', '');
			playButton?.classList.add('oliveSlider-action', 'oliveSlider-action--play');
			playButton.innerHTML =
				'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"> <mask id="mask0_454_789" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24"> <rect width="24" height="24" fill="#D9D9D9"/> </mask> <g mask="url(#mask0_454_789)"> <path d="M8.5 16.4443V7.55575C8.5 7.29175 8.59042 7.07508 8.77125 6.90575C8.95192 6.73658 9.16283 6.652 9.404 6.652C9.48083 6.652 9.56025 6.66292 9.64225 6.68475C9.72442 6.70642 9.80392 6.73908 9.88075 6.78275L16.8767 11.2365C17.0141 11.3302 17.117 11.4423 17.1855 11.573C17.2542 11.7038 17.2885 11.8462 17.2885 12C17.2885 12.1538 17.2542 12.2962 17.1855 12.427C17.117 12.5577 17.0141 12.6698 16.8767 12.7635L9.88075 17.2172C9.80392 17.2609 9.72442 17.2936 9.64225 17.3152C9.56025 17.3371 9.48083 17.348 9.404 17.348C9.16283 17.348 8.95192 17.2634 8.77125 17.0942C8.59042 16.9249 8.5 16.7083 8.5 16.4443ZM10 15.35L15.2693 12L10 8.65V15.35Z" fill="white"/> </g> </svg>';
	
			// create prev button
			const prevButton = document.createElement('button');
			prevButton.setAttribute('olive-prev', '');
			prevButton?.classList.add('oliveSlider-action', 'oliveSlider-action--prev');
			prevButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/></svg>';
	
			// create the next button
			const nextButton = document.createElement('button');
			nextButton.setAttribute('olive-next', '');
			nextButton?.classList.add('oliveSlider-action', 'oliveSlider-action--next');
			nextButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12l-4.58-4.59L10 6l6 6-6 6z"/></svg>';
	
			// check for dots visibility
			if (olive.getAttribute('data-dots') === 'true') {
	
				// create the dots wrapper
				const oliveSliderDots = document.createElement('ul');
				oliveSliderDots?.classList.add('oliveSlider-dots');
	
				// iterate over slides and create 1 dot for each slide
				for (let x = 0; x < olive.children.length; x++) {
					const dot = document.createElement('li');					
					dot?.classList.add('oliveSlider-dot');
					
					// set the index to correspond to the slide index
					dot.setAttribute('data-index', x);
					const dotBtn = document.createElement('button');
					dotBtn.innerHTML += `<span style="opacity: 0; height: 0; width: 0; position: absolute;">Click to view slide #${x + 1}.</span>`
					dot.append(dotBtn);
					oliveSliderDots.append(dot);
	
					// add is-active class to the first child
					if (x == 0) {
						dot?.classList.add('is-active');
					}
					
					// set up event listener for each dot
					dot.querySelector('button').addEventListener('click', (e) => {
	
						// set up index for current and new index
						const prevIndex = currentIndex;
						const newIndex = dot.getAttribute('data-index');
	
						// only run if there is a change in index
						if (prevIndex == newIndex) {
							return;
						}
	
						// update current index
						currentIndex = newIndex ? newIndex : 0;
	
						// add animation class
						oliveWrapper?.classList.add('is-animating');
	
						// add animation for change in index based on forward or backward slide progression
						if (newIndex > prevIndex) {
							// next animation
							olive.children[prevIndex]?.classList.add('exit-next');
						} else {
							olive.children[prevIndex]?.classList.add('exit-prev');
							// prev animation
						}
						setTimeout(() => {
							olive.children[prevIndex]?.classList.remove('exit-next', 'exit-prev');
							oliveWrapper?.classList.remove('is-animating');
						}, 950);
	
						// manage is-active class for slides and dots
						olive.children[prevIndex]?.classList.remove('is-active');
						oliveWrapper.querySelector('ul.oliveSlider-dots').children[prevIndex]?.classList.remove('is-active');																				
						olive.children[currentIndex]?.classList.add('is-active');						
						oliveWrapper.querySelector('ul.oliveSlider-dots').children[newIndex]?.classList.add('is-active');																									
						checkError();
					});
				}
				const autoplayDot = document.createElement('li');
				autoplayDot?.classList.add('oliveSlider-dot', 'auto-play');
				autoplayDot.setAttribute('data-play', '');
				const autoplayDotBtn = document.createElement('BUTTON');
				autoplayDotBtn.setAttribute('data-play', '');
				autoplayDot.append(autoplayDotBtn);
				oliveSliderDots.append(autoplayDot);
				oliveWrapper.append(oliveSliderDots);
			}
	
			// check for slider controls visibility
			if (olive.getAttribute('data-controls') == 'false') {
				oliveActions.style.display = 'none';
			}
	
			// check for slider arrows visibility
			if (olive.getAttribute('data-arrows') !== 'false') {
				const prevArrow = document.createElement('button');
				prevArrow?.classList.add('oliveSlider-arrow', 'oliveSlider-arrow--prev');
				prevArrow.setAttribute('olive-prev', '');
				prevArrow.innerHTML = '<span style="font-size: 0px; position: absolute; height: 0px; width: 0px; opacity: 0;">Click to view previous slide.</span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/></svg>';
				oliveWrapper.append(prevArrow);
				const nextArrow = document.createElement('button');
				nextArrow?.classList.add('oliveSlider-arrow', 'oliveSlider-arrow--next');
				nextArrow.innerHTML = '<span style="font-size: 0px; position: absolute; height: 0px; width: 0px; opacity: 0;">Click to view next slide.</span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12l-4.58-4.59L10 6l6 6-6 6z"/></svg>';
				nextArrow.setAttribute('olive-next', '');
				oliveWrapper.append(nextArrow);
			}
	
			// add all actions to the wrapper
			oliveActions.append(prevButton);
			oliveActions.append(nextButton);
			oliveActions.prepend(playButton);
	
			// add the actions wrapper to the slider wrapper
			oliveWrapper.append(oliveActions);

			oliveActions?.addEventListener('click', e => {
				// stop propogation so that slider events do not interfere with navigation
				if (e.target.classList.contains('is-open')) {
					e.target.classList.remove('is-open');
				} else {
					oliveActions?.classList.add('is-open');
				}
			});
	
			//////////////////
			// HANDLE NEXT
			//////////////////
			oliveWrapper.querySelectorAll('[olive-next]').forEach((next) => {
				next.addEventListener('click', e => {
					// stop propogation so that slider events do not interfere with navigation
					e.stopPropagation();
					oliveWrapper?.classList.add('is-animating');
					const slideExitNext = olive.children[currentIndex];				
					slideExitNext?.classList.remove('is-active');					
					slideExitNext?.classList.add('exit-next');
					oliveWrapper.querySelector('ul.oliveSlider-dots')?.children[currentIndex]?.classList.remove('is-active');
					if (currentIndex === maxIndex) {
						currentIndex = minIndex;
					} else {
						currentIndex++;
						if (currentIndex > olive.children.length - 1) {
							currentIndex = minIndex;
						}
					}
					olive.children[currentIndex]?.classList.add('is-active');
					oliveWrapper.querySelector('ul.oliveSlider-dots')?.children[currentIndex]?.classList.add('is-active');
					setTimeout(() => {
						slideExitNext?.classList.remove('exit-next');
						oliveWrapper?.classList.remove('is-animating');
					}, 950);
					checkError();
				});
			});
	
	
			//////////////////
			// HANDLE PREV
			//////////////////
			oliveWrapper.querySelectorAll('[olive-prev]').forEach((prev) => {
	
				// previous button click handler
				prev.addEventListener('click', e => {
	
					// stop propogation so that slider events do not interfere with navigation
					e.stopPropagation();
					oliveWrapper?.classList.add('is-animating');
					const slideExitPrev = olive.children[currentIndex];
					slideExitPrev?.classList.remove('is-active');
					slideExitPrev?.classList.add('exit-prev');
					oliveWrapper.querySelector('ul.oliveSlider-dots')?.children[currentIndex]?.classList.remove('is-active');
					if (currentIndex === minIndex) {
						currentIndex = maxIndex;
					} else {
						currentIndex--;
						if (currentIndex < 0) {
							currentIndex = maxIndex;
						}
					}
					olive.children[currentIndex]?.classList.add('is-active');
					oliveWrapper.querySelector('ul.oliveSlider-dots')?.children[currentIndex]?.classList.add('is-active');
					setTimeout(() => {
						slideExitPrev?.classList.remove('exit-prev');
						oliveWrapper?.classList.remove('is-animating');
					}, 950);
				});
			});
	
	
			////////////////
			// AUTOPLAY
			////////////////
			let autoPlaySpeed;
	
			// check for autoplay speed and set variable
			olive.getAttribute('data-autoplay-speed') ? (autoPlaySpeed = parseInt(olive.getAttribute('data-autoplay-speed'))) : (autoPlaySpeed = 5000);
	
			// autoplay click handler
			oliveWrapper.querySelectorAll('[data-play]').forEach((autoplay) => {
				autoplay?.addEventListener('click', e => {
	
					// stop propogation so that slider events do not interfere with navigation
					e.stopPropagation();
					isPlaying = !isPlaying;
					if (isPlaying) {
						oliveWrapper.querySelectorAll('[data-play]').forEach(btn => btn?.classList.add('is-active'));
						oliveActions?.classList.add('has-autoplay');
						playInterval = setInterval(() => {
							nextButton.click();
						}, autoPlaySpeed);
					} else {
						oliveWrapper.querySelectorAll('[data-play]').forEach(btn => btn?.classList.remove('is-active'));
						oliveActions?.classList.remove('has-autoplay');
						clearInterval(playInterval);
					}
				});
			})
	
			// check for autoplay
			if (olive.getAttribute('data-autoplay') === 'true') {
				oliveWrapper.querySelector('[data-play]').click();
			}
		}
	
		////////////////////
		// TOUCH EVENTS
		////////////////////
		for (let index = 0; index < olive.children.length; index++) {
			const slide = olive.children[index];
			let isDragging = false;
			let startX = 0;
			let currentX = 0;
			let offsetX = 0; // Track the offset
			const swipeOffset = 50; // Minimum swipe distance to trigger an action
			const element = oliveWrapper;
		
			// Touch start event
			slide.addEventListener('touchstart', (e) => {
				isDragging = true;
				startX = e.touches[0].clientX; // Record the starting touch position
			});
		
			// Touch move event
			slide.addEventListener('touchmove', (e) => {
				if (!isDragging) return;
				currentX = e.touches[0].clientX; // Update the current touch position
				offsetX = currentX - startX; // Calculate the offset
			});
		
			// Touch end event
			slide.addEventListener('touchend', () => {
				if (!isDragging) return;
				isDragging = false;
		
				// Determine swipe direction
				if (offsetX > swipeOffset) {
					oliveWrapper.querySelector('[olive-next]')?.click();
				} else if (offsetX < -swipeOffset) {					
					oliveWrapper.querySelector('[olive-prev]')?.click();
				}
		
				// Reset positions
				offsetX = 0;
				startX = 0;
				currentX = 0;
			});
		}


		////////////////////
		// MOUSE EVENTS
		////////////////////
		for (let index = 0; index < olive.children.length; index++) {
			const slide = olive.children[index];
			let isDragging = false;
			let startX = 0;
			let currentX = 0;
			let offsetX = 0; // Track the offset
			const swipeOffset = 50;
			const element = oliveWrapper;
		
			slide.addEventListener('mousedown', (e) => {
				isDragging = true;
				startX = e.clientX - offsetX; // Adjust startX to account for the current offset
				slide.style.transition = 'none'; // Disable transition during dragging
			});
		
			document.addEventListener('mousemove', (e) => {
				if (!isDragging) return;
				currentX = e.clientX;
				offsetX = currentX - startX; // Calculate the offset
			});
		
			document.addEventListener('mouseup', () => {
				if (!isDragging) return;	
				isDragging = false;						
	
				// Determine drag direction
				if (offsetX > 0) {
					if (offsetX > swipeOffset) {
						oliveWrapper.querySelector('[olive-next]').click();
					} 
				} else if (offsetX < 0) {
					if (offsetX < -swipeOffset) {
						oliveWrapper.querySelector('[olive-prev]').click();
					}
				}
				
				// Reset positions
				offsetX = 0;
				startX = 0;
				currentX = 0;
			});
		}
	
		const checkError = () => {
			let hasActive = false;
			
			clearInterval(timer);
			timer = setInterval(() => {
				for (let index = 0; index < olive.children.length; index++) {
					const slide = olive.children[index];
					slide?.classList.contains('is-active') ? hasActive = true : '';
				}
				if (hasActive) {
					clearInterval(timer);
				} else {
					olive.children[0]?.classList.add('is-active');			
					oliveWrapper.querySelector('ul.oliveSlider-dots li.oliveSlider-dot.is-active').classList.remove('is-active');
					oliveWrapper.querySelector('ul.oliveSlider-dots').children[0]?.classList.add('is-active');			
					clearInterval(timer);
				}
			}, 250);
		}
	});
}