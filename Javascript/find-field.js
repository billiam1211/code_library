// helper function that finds an element using an interval. Once elemet is found, the action that is passed in will be executed and the interval cleared. If the escape element is not found, the interval is also cleared.
const findField = (targetSelector, escapeValue, action) => {
	let escapeCounter = 0;
	// pass in a selector for the target element and escape element. action is a function that is passed in to execute once the target element is found
	const findFieldInterval = setInterval(() => {
		let escapeType = 'string';
		// check escape type for string or integer
		if (typeof(escapeValue) == 'string') {
			// if string create an escape element to check against
			const escape = document.querySelector(`${escapeValue}`);
		} else {
			escapeType = 'integer';
			// else assume integer and clear interval once value is reached
			const escape = escapeValue;
		}
		const targetElement = document.querySelector(`${targetSelector}`);
		// check if target element is written to the page
		if (targetElement !== null) {
			// clear the interval
			clearInterval(findFieldInterval);
			if (action) {
				// action is a function that is passed in to handle what happens once the target element is found.
				action();
			}
		}
		if (escapeType == 'string') {
			if (escape == null) {
				clearInterval(findFieldInterval);
			}
		} else {
			// check the counter against the specified escape value
			if (escapeCounter == escapeValue) {
				clearInterval(findFieldInterval);
			}
			// increase the escape counter
			escapeCounter++;
		}
	}, 500);
};