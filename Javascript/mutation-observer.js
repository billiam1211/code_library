// jQuery import 
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>

// set up variable for the element that will have the mutations to listen for
const targetNodes = $('div.targetNode');

// set up the method
const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
 
// init new observer constructor and pass in the callback
const myObserver = new MutationObserver(mutationHandler);

// set up options
const obsConfig = {
    childList: true,
    characterData: true,
    attributes: true,
    subtree: true,
    attributeOldValue: true,
    characterDataOldValue: true
};

// add target node to the oberver
targetNodes.each(function () {
    myObserver.observe(this, obsConfig);
});

// set up mutation handler function to be passed in as a callback
function mutationHandler(mutationRecords) {
    // iterate over each mutation on the aside
    mutationRecords.forEach((mutation) => {

        console.log('Mutation: ', mutation);
        
        // check the mautation record target for the class of the cards list
        if ($(mutation.target).hasClass('.targetClass')) {
            // execute some code here 
        }

        // check the mutation for elements that have been added
        if (mutation.addedNodes.length) {
            // iterated over the nodes list to find a specific element that has been added
        }

        // check the mutation for elements that have been removed  
        if (mutation.removedNodes.length) {
            // iterated over the nodes list to find a specific element that has been removed
        }

        // check for an element that has both addedNodes and a specific class
        if (mutation.addedNodes.length && $(mutation.target).hasClass('targetClass')) {
            // execute some code here 
        }

        // other available methods to use: 
            // .disconnect() top the observer until .observe() is called again
            // .observe()  configure the observe to begin watching for DOM Tree changes 
            // .takeRecords() Removes all pending notifications from the MutationObserver's notification queue and returns them in a new Array of MutationRecord objects.
    });
}

/////////////////////////////
/// Helpful Documentation ///
/////////////////////////////

// https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
// https://caniuse.com/mutationobserver
// https://www.smashingmagazine.com/2019/04/mutationobserver-api-guide/


//////////////////
/// REFERENCES ///
//////////////////

// Websites we can use for reference (check TFS): 
// Razny, Albanese, Heska
