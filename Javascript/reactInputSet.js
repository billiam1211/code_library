function reactSelect(field,value) {	
	input = jQuery2(field)[0];
	input.value =value;
	event = new Event('change', { bubbles: true });
	input.dispatchEvent(event);
}
​
function reactSelect2(field) {	
	input = jQuery2(field)[0];
	event = new Event('change', { bubbles: true });
	input.dispatchEvent(event);
}
​
function setReactInputValue(input, value) {
	const previousValue = input.value;
	input.value = value;
	const tracker = input._valueTracker;
	if (tracker) {
	  tracker.setValue(previousValue);
	}
	input.dispatchEvent(new Event('change', { bubbles: true }));
};