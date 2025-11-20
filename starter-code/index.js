const unitsSelected = document.querySelectorAll('input[type="radio"][name="units"]');
const bmiResultElement = document.getElementById('bmiResult');
const classificationElement = document.getElementById('classification');
const weightRangeElement = document.getElementById('weightRange');
const [mainHeight, subHeight, mainWeight, subWeight] = document.querySelectorAll(".inputBMI");

const BMI_State = {
    height: [0, 0],
    weight: [ 0, 0],
    unit: 'metric',
    idealWeight: [min = 0, max = 0]
}
const units = {
    imperial: {
        height: "ft", 
        weight: "st"
    },
    metric: {
        height: "cm",
        weight: "kg"
    }
}

const BMI = {
    underweight: 18.5,
    healthy: 24.9,
    overweight: 29.9,
    obese: 30
}
changeUnitDisplay(BMI_State.unit);
setDefaultResultScreen(mainHeight, mainWeight);

// change the state between metric and imperial
unitsSelected.forEach(radio => {
    radio.addEventListener('change', function() {
        if(this.checked) {
            const unit = BMI_State.unit = this.value;
            changeUnitDisplay(unit);
        }
            
    })
});

// change the UI display on the unit selected
function changeUnitDisplay(unitOfMeasurement) {
    const isImperial = unitOfMeasurement === 'imperial';
    const imperialElements = document.querySelectorAll('.imperial-state');
    const measurementText = Array.from(document.querySelectorAll('.measurement')).filter((_, index) => index % 2 === 0);

    imperialElements.forEach(element => {
        element.classList.toggle('grid', isImperial);
        element.lastElementChild.style.display = isImperial ? 'block' : 'none'
        element.firstElementChild.classList.toggle('no-grid', isImperial)
    });
  
    const unitNames = Object.values(units[unitOfMeasurement])
    measurementText.forEach((label, index) => {
        if (unitNames[index]) label.textContent = unitNames[index];
    });

    updateBMIInputValue(isImperial)
}

// convert current inputs based on the unit
function updateBMIInputValue(isImperial) {
    if(!isImperial && mainHeight.value) {
        BMI_State.height[0] = (BMI_State.height.join('.')*30.48).toFixed(2);
        mainHeight.value = Number(BMI_State.height[0]);
    } 
    if(!isImperial && mainWeight.value) {
        BMI_State.weight[0] = (BMI_State.weight.join('.')*6.35029).toFixed(2);
        mainWeight.value = Number(BMI_State.weight[0]);
    } 
    if(mainHeight.value && isImperial) {
        const [feet, inches ] = (Number(BMI_State.height[0])/30.48).toFixed(1).split('.');
        BMI_State.height =  [feet, inches];
        mainHeight.value =  feet;
        subHeight.value =  inches;       
    }
    if(mainWeight.value && isImperial) {
        const totalPounds = Number(BMI_State.weight[0]) * 2.20462
        const stone =  Math.floor(totalPounds / 14);
        const pounds = Math.round(totalPounds % 14);
        BMI_State.weight = [stone , pounds]
        mainWeight.value = stone;
        subWeight.value =  pounds;      

    }
}

// show default screen when no value is entered
function setDefaultResultScreen(...filledInputs) {
    const isValid = filledInputs.every(input => input.value)
    document.getElementById('BMI-result-heading').textContent = isValid ? 'Your BMI is...' : ''
    if(!isValid) bmiResultElement.textContent = 'Welcome!'
    document.getElementById('bmi-welcome-text').style.display =  isValid ?  'none' : 'block';
    document.getElementById('bmi-result-text').style.display = isValid ? 'block' : 'none';
}

// input fields BMI
document.querySelectorAll('input[name="weight"], input[name="height"]').forEach(input => {
    input.addEventListener('input', function() {
        const unitType = this.name === 'weight' ? 'weight' : 'height'
        setBMIValues(this, unitType)
        setDefaultResultScreen(mainHeight, mainWeight)
    });
});

// set the BMI value to the BMI object
function setBMIValues(input, bmiInput){
    if(!bmiInput in BMI_State) return 
    const index  = input.id === `imperial-${bmiInput}` ? 1 : 0;
    BMI_State[bmiInput][index] = input.value;
    calculateIdealWeight();
    calculateBMI();
}
// Calculate Ideal Weight 
function calculateIdealWeight(){
    const heightInInches = BMI_State.unit === 'metric' 
            ? Number(BMI_State.height[0]) / 2.54 
            : (Number(BMI_State.height[0]) * 12) + Number(BMI_State.height[1]);
    const minimumWeight = `${(45.5 + 2.2 * (heightInInches - 60)).toFixed(1)}`;
    const maxmiumWeight = `${(48 + 2.7 * (heightInInches - 60)).toFixed(1)}`;
    if(BMI_State.unit === 'imperial'){
        const [minStone, minPound] = ((minimumWeight * 0.157).toFixed(1)).toString().split('.');
        const [maxStone, maxPound] = ((maxmiumWeight * 0.157).toFixed(1)).toString().split('.');
        BMI_State.idealWeight = [`${minStone}st ${minPound}lbs`, `${maxStone}st ${maxPound}lbs`]
    } else BMI_State.idealWeight = [`${minimumWeight}kgs`, `${maxmiumWeight}kgs`];
}
// Calculate BMI result
function calculateBMI() {
    let bmiResult;
    if(BMI_State.unit === 'metric'){
        const weight = Number(BMI_State.weight[0])
        const height = Number(BMI_State.height[0]) / 100 // to meters
        bmiResult = (weight / (height ** 2)).toFixed(1)
    } else if(BMI_State.unit === 'imperial') {
        const weight = (Number(BMI_State.weight[0]) * 14) + Number(BMI_State?.weight[1])
        const height = (Number(BMI_State.height[0]) * 12) + Number(BMI_State?.height[1])
        bmiResult = ((weight / (height ** 2)) * 703).toFixed(1)
    }
    bmiResultElement.textContent = bmiResult;
    switch(true) {
        case bmiResult < BMI.underweight:
            classification = Object.keys(BMI)[0];
            break;
          case bmiResult < BMI.healthy:
            classification = "healthy weight"
            break;
        case bmiResult < BMI.overweight:
            classification = Object.keys(BMI)[2];
            break;
        case bmiResult > BMI.obese:
            classification = Object.keys(BMI)[3];
            break;
    }
    classificationElement.textContent = classification;
    weightRangeElement.textContent = BMI_State.idealWeight.join(' - ')
}
