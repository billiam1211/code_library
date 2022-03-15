var reactINputSet = function (element, value) {
    var valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
    var prototype = Object.getPrototypeOf(element);
    var prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
    if (valueSetter && valueSetter !== prototypeValueSetter) {
        prototypeValueSetter.call(element, value);
    } else {
        valueSetter.call(element, value);
    }
}

// reactINputSet(addressInput, `${address1}`);
reactINputSet(inputElement, value);