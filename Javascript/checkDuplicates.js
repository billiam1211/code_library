// arrays to test for duplicates
const numbers = [3, 2, 1, 5, 3];
const numbers2 = [9, 2, 1, 5, 19];
const numbers3 = [9, 9, 1, 5, 0];
const numbers4 = [1, 3, '1', 4, 6, 7, 5, null, undefined, 'cat', 1];
const numbers5 = ['Zebra', 'Cow', 'Bat', 'Bat', 'Horse', 'Dog', 'Cat'];
// set up function to check for duplicate numbers
const checkDuplicates = (nums) => {
    // set variable for duplicates
    let dups = undefined;
    // iterate over the current array
    for (let index = 0; index < nums.length; index++) {
        const num = nums[index];
        // set up new array 
        const newArray = [... nums];
        // remove the current number from the array
        newArray.splice(index, 1);
        // loop over the new array with the current number removed
        for (let x = 0; x < newArray.length; x++) {
            const num2 = newArray[x];
            // console.log(num, num2);
            // if the numbers match return the duplicate
            if (num === num2) {
                dups = num;
                console.log(`Match: ${dups}`);
                return dups;
            }
        }
        // if the last index is reached in the array and no matches are found return the duplicate variable
        if (index === nums.length - 1) {
            console.log('No Match Found...');
            return dups;
        }
    }
}
// alternative method to check for duplicates
const checkDuplicatesMethod2 = (nums) => {
    let duplicates = undefined;
    // create an empty set
    const set = new Set();
    // iterate over the numbers array
    for (let index = 0; index < nums.length; index++) {
        const num = nums[index];
        // if the set does not have the number, add it
        if (!set.has(num)) {
            // console.log('add number to set')
            set.add(num);
        } else {
            // if the number exists in the set, update the duplicates variable and return the value
            duplicates = num;
            console.log(`Duplicate Found: ${duplicates}`)
            return duplicates;
        }
        if (index === nums.length -1 ) {
            console.log('No duplicate found:', duplicates);
            return duplicates;
        }
    }
}
// run tests method 1
checkDuplicates(numbers);
checkDuplicates(numbers2);
checkDuplicates(numbers3);
checkDuplicates(numbers4);
checkDuplicates(numbers5);
// run tests method 2
checkDuplicatesMethod2(numbers);
checkDuplicatesMethod2(numbers2);
checkDuplicatesMethod2(numbers3);
checkDuplicatesMethod2(numbers4);
checkDuplicatesMethod2(numbers5);