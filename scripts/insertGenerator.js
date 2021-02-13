// GLOBALS
let newInsertProject;
let baseFunctionFlow;
let varObjectLastKey;
let varObjectKeys;

const domStrings = {
    instructions: 'instructions__text',
    mainBtn: 'instructions__btn',
    processingBox: 'processing',
    processingTextarea: 'processing__textarea',
    processingContainer: 'processing__container',
    inputFields: 'processing__entry-input',
    clipboardBtn: 'instructions__btn--clip'
};

const instructionsArr = [
    'Enter table name and confirm',
    'Enter column names and confirm',
    'Select which columns are constant and confirm',
    'Enter constant values (getDate(), incident number, etc) and confirm',
    'Enter variable values for the variable column and confirm. Variable column: ',
    'Press Confirm to generate insert statements'
];
// GLOBALS

class InserterHub {
    constructor(tableName, columnsUnsorted, columnsConst, columnsVar, repetitionCount, insertStatements) {
        this.tableName = tableName;
        this.columnsUnsorted = columnsUnsorted;
        this.columnsConst = columnsConst;
        this.columnsVar = columnsVar;
        this.repetitionCount = repetitionCount;
        this.insertStatements = insertStatements;
    }

    setTableName(enteredName) {
        this.tableName = enteredName;
    }

    setColumnsUnsorted(colUnsortedArr) {
        this.columnsUnsorted = colUnsortedArr;
    }

    setColumnsConst(colConstArray) {
        // Input is an array. Information from the DOM will be processed into an array and inserted into this method
        const newConstObject = {};
        colConstArray.forEach((el) => {
            newConstObject[el] = '';
        });

        this.columnsConst = { ...newConstObject };
        this.setColumnsVar();
    }

    setColumnsVar() {
        const colVarArray = [];
        const newVarObject = {};

        this.columnsUnsorted.forEach((el) => {
            if (!(el in this.columnsConst)) {
                colVarArray.push(el);
            };
        });

        colVarArray.forEach((el) => {
            newVarObject[el] = [];
        });

        this.columnsVar = { ...newVarObject };
    };

    setRepetitionCount(varLength) {
        this.repetitionCount = varLength;
    }

    setColumnValue(constOrVar, columnName, input) {
        if (constOrVar === 'const') {
            this.columnsConst[columnName] = input;
        } else {
            this.columnsVar[columnName] = input;

            if (this.repetitionCount === undefined) this.setRepetitionCount(input.length);
        };
    }

    processVarInput(input, stringParam, delimiter = ',') {
        const processedInput = input.split(delimiter);

        // FUTURE Here additional processing can be done on the array - removing whitespace, adjusting format, etc
        if (stringParam) {
            processedInput.forEach((el, index) => {
                processedInput[index] = `'${el}'`
            });
        };
        // FUTURE

        return processedInput;
    }

    generateInserts() {
        const generatedInserts = [];
        const generatedInsertValues = [];
        let repetitionCount;

        if (Object.keys(this.columnsVar).length === 0) {
            repetitionCount = 1;
        } else {
            repetitionCount = this.columnsVar[Object.keys(this.columnsVar)[0]].length;
        };

        for (let i = 0; i < repetitionCount; i++) {
            const newInsertArr = [];

            this.columnsUnsorted.forEach((el) => {
                if (el in this.columnsConst) {
                    newInsertArr.push(this.columnsConst[el]);
                } else {
                    newInsertArr.push(this.columnsVar[el][i]);
                }
            });

            newInsertArr.join(',');
            generatedInsertValues.push(newInsertArr);
        };

        generatedInsertValues.forEach((el) => {
            generatedInserts.push(
                `INSERT INTO ${this.tableName} (${this.columnsUnsorted}) VALUES (${el})`
            );
        });

        this.insertStatements = generatedInserts;
    }

}

const setDOMText = (el, text) => {
    document.querySelector(el).textContent = (text);
};

const deployInserts = (elArr) => {
    elArr.forEach((el) => {
        document.querySelector(`.${domStrings.processingContainer}`).insertAdjacentHTML('beforeend', `<div>${el}</div>`);
    });
};

const insertDOMelement = (classCSS, elHTML) => {
    document.querySelector(`.${domStrings.processingBox}`).insertAdjacentHTML('beforeend', `<${elHTML} class=${classCSS}></${elHTML}>`);
};

const wipeDOMProcessing = () => {
    const myNode = document.querySelector(`.${domStrings.processingBox}`);

    while (myNode.firstChild) {
        myNode.removeChild(myNode.lastChild);
    };
};

const clearDOMtextarea = () => {
    document.querySelector(`.${domStrings.processingTextarea}`).value = '';
}

const retrieveDOMInput = () => {
    return document.querySelector(`.${domStrings.processingTextarea}`).value;
};

const generateInputFields = (inputType, sourceArr) => {
    const columnArr = [...sourceArr];
    const processingContainer = document.querySelector(`.${domStrings.processingContainer}`)

    columnArr.forEach((el, index) => {
        processingContainer.insertAdjacentHTML('beforeend',
            `
            <div class='processing__input-box'>
                <label class='processing__entry-label' for=${index}>${el}</label><input class='processing__entry-${inputType}' id=${index} type=${inputType}>
            </div>
            `
        );
    });
};

// HELPERS ->
const checkDuplicate = (testedArr) => {
    let result = false;
    const testedSet = new Set(testedArr);

    if (testedArr.length !== testedSet.size) result = true;
    return result;
};

const checkEmpty = (testedArea, multiple = false) => {
    let isEmpty = false;
    if (multiple) {
        Array.from(document.querySelectorAll(testedArea)).forEach((el) => { if (el.value === '') isEmpty = true });
    } else {
        isEmpty = document.querySelector(testedArea).value === '';
    };

    return isEmpty;
};

const convertStrToArr = (string, delimiter) => {
    const convertedArr = string.split(`${delimiter}`);

    return convertedArr;
};

const copyRangeToClipboard = (copiedArea) => {
    const range = document.createRange();
    range.selectNode(document.querySelector(copiedArea));
    window.getSelection().removeAllRanges(); // clear current selection
    window.getSelection().addRange(range); // to select text
    document.execCommand("copy");
    window.getSelection().removeAllRanges();// to deselect
};
// HELPERS <-

retrieveConstColumns = () => {
    const columnArr = [...newInsertProject.columnsUnsorted];
    const constColumnArr = [];

    columnArr.forEach((el, index) => {
        if (document.getElementById(index).checked) constColumnArr.push(el);
    })

    newInsertProject.setColumnsConst(constColumnArr);
};

retrieveColValues = (constOrVar) => {
    if (constOrVar === 'const') {
        for (el in newInsertProject.columnsConst) {
            const newValue = document.getElementById(Object.keys(newInsertProject.columnsConst).indexOf(el)).value;
            newInsertProject.setColumnValue(constOrVar, el, newValue);
        };
    } else if (constOrVar === 'var') {
        retrieveVarColValues();
    };
};


retrieveVarColValues = () => {
    for (el in newInsertProject.columnsVar) {

        if (newInsertProject.columnsVar[el].length === 0) {
            const newValue = retrieveDOMInput();
            const processedValueArr = newInsertProject.processVarInput(newValue, false);

            if (newInsertProject.repetitionCount === undefined || newInsertProject.repetitionCount === processedValueArr.length) {
                newInsertProject.setColumnValue('var', el, processedValueArr);
                setDOMText(`.${domStrings.instructions}`, `${instructionsArr[4]} ${varObjectKeys.shift()}`);
                clearDOMtextarea();
            } else {
                alert(`You inserted: ${processedValueArr.length} values. Required number: ${newInsertProject.repetitionCount} values`);
                break;
            }

            if (el === varObjectLastKey) {
                baseFunctionFlow = 5;
                wipeDOMProcessing();
                insertDOMelement(domStrings.processingContainer, 'div');
                setDOMText(`.${domStrings.instructions}`, instructionsArr[5]);
            };
            break;
        };
    };
};

const prepareForVarInput = () => {
    wipeDOMProcessing();
    insertDOMelement(domStrings.processingTextarea, 'textarea');
    varObjectLastKey = Object.keys(newInsertProject.columnsVar)[Object.keys(newInsertProject.columnsVar).length - 1];
    varObjectKeys = Object.keys(newInsertProject.columnsVar);
    setDOMText(`.${domStrings.instructions}`, `${instructionsArr[4]} ${varObjectKeys.shift()}`);
};


// Initiliase DOM for table name entry, set baseFunctionFlow to 0
const functionFlow = () => {
    switch (baseFunctionFlow) {
        case 0:
            if (checkEmpty(`.${domStrings.processingTextarea}`)) {
                alert('Input cannot be empty');
            } else {
                // Retrieve table name from input and set it in newInsertProject
                newInsertProject.setTableName(retrieveDOMInput());
                // Set baseFunctionFlow to 1
                baseFunctionFlow = 1;
                // Initiliase DOM for column name entry in phase 1
                clearDOMtextarea();
                setDOMText(`.${domStrings.instructions}`, instructionsArr[1])
                document.querySelector(`.${domStrings.processingTextarea}`).value = 'testCol1,testCol2,testCol3,testCol4';
            }
            break;
        case 1:
            // Set unsorted column names from entry
            const newColumnsArr = convertStrToArr(retrieveDOMInput(), ',');
            if (checkEmpty(`.${domStrings.processingTextarea}`)) {
                alert('Input cannot be empty');
            } else if (checkDuplicate(newColumnsArr)) {
                alert('No duplicate column names allowed');
            } else {
                newInsertProject.setColumnsUnsorted(newColumnsArr);
                // Set baseFunctionFlow to 2
                baseFunctionFlow = 2;
                // Initiliase DOM for constant definition in phase 2
                wipeDOMProcessing();
                insertDOMelement(domStrings.processingContainer, 'div');
                generateInputFields('checkbox', newInsertProject.columnsUnsorted);
                setDOMText(`.${domStrings.instructions}`, instructionsArr[2])
            };

            break;
        case 2:
            // Set constant column names from entry and generate var column names
            retrieveConstColumns();
            newInsertProject.setColumnsVar();
            // Set baseFunctionFlow to 3
            if (Object.keys(newInsertProject.columnsConst).length === 0) {
                baseFunctionFlow = 4;
                prepareForVarInput();
            } else {
                baseFunctionFlow = 3;
                // Initiliase DOM for constant value entry in phase 3
                wipeDOMProcessing();
                insertDOMelement(domStrings.processingContainer, 'div');
                generateInputFields('input', Object.keys(newInsertProject.columnsConst));
                setDOMText(`.${domStrings.instructions}`, instructionsArr[3])
            }
            break;
        case 3:
            if (checkEmpty(`.${domStrings.inputFields}`, true)) {
                alert('Input cannot be empty');
            } else {
                // Set constant column values from entry
                retrieveColValues('const');
                if (Object.keys(newInsertProject.columnsVar).length === 0) {
                    baseFunctionFlow = 5;
                    wipeDOMProcessing();
                    insertDOMelement(domStrings.processingContainer, 'div');
                    setDOMText(`.${domStrings.instructions}`, instructionsArr[5]);
                } else {
                    baseFunctionFlow = 4;
                    prepareForVarInput();
                };
            };
            break;
        case 4:
            if (checkEmpty(`.${domStrings.processingTextarea}`)) {
                alert('Input cannot be empty');
            } else {
                retrieveColValues('var');
            };
            break;
        case 5:
            newInsertProject.generateInserts();
            deployInserts(newInsertProject.insertStatements);
            document.querySelector(`.${domStrings.clipboardBtn}`).style = ('display: block');
            break;
        case 6:
        // If chosen, restart the flow
        // Set baseFunctionFlow to 0
        // Initiliase DOM for table name entry
    }
}


// INITIALISE
const initFlow = () => {
    baseFunctionFlow = 0;
    newInsertProject = new InserterHub;
    setDOMText(`.${domStrings.instructions}`, instructionsArr[0]);
    clearDOMtextarea();
};

initFlow();

document.querySelector(`.${domStrings.mainBtn}`).onclick = () => {
    functionFlow();
};