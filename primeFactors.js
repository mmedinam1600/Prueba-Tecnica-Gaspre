

const primeFactors = (number) => {
    const factors = [];

    // While number is pair, then have a factor of 2
    while (number % 2 === 0) {
        factors.push(2);
        number = number / 2;
    }

    // When number isn't odd then start at 3 to ...
    let divider = 3;
    while (divider <= Math.sqrt(number)) {
        while(number % divider === 0) {
            factors.push(divider);
            number /= divider;
        }
        divider += 2;
    }

    // Then the final value of number is a prime number
    // If the number is greater than 2 add the factor
    if (number > 2) {
        factors.push(number);
    }

    return factors;
}


console.log(primeFactors(20)); // [2, 2 ,5] es decir, 2*2*5 = 20
console.log(primeFactors(330)); // [2, 3, 5, 11] es decir, 2*3*5*11 = 330
