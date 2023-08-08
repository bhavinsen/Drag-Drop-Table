const boxes = document.querySelectorAll('.box');
let currentBox = null;
let sourceCell = null;
let originalParent = null;
const uniqueColors = ['#ff0000', '#008000', '#8080e5', '#ffff00', '#ffa500', '#800080', '#ffc0cb', '#a52a2a', '#808080'];

const undoStack = [];
const usedColors = new Set(); // To keep track of used colors

function generateRandomColor() {
    const randomColor = `rgb(${getRandomInt(0, 256)}, ${getRandomInt(0, 256)}, ${getRandomInt(0, 256)})`;
    return randomColor;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function getNextAvailableColor() {
    let color = generateRandomColor();
    if (usedColors.has(color)) {
        color = generateRandomColor();
    }
    usedColors.add(color);
    return color;
}

function releaseColor(color) {
    usedColors.delete(color);
}

function handleDragStart(e) {
    currentBox = e.target;
    sourceCell = currentBox.parentElement;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', currentBox.innerHTML);
    e.dataTransfer.setDragImage(currentBox, 50, 50);
    currentBox.classList.add('dragging');

    // Enable the "Undo" button when a box is dragged
    document.getElementById('undoButton').disabled = false;
}

function handleDragEnter(e) {
    e.preventDefault();
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDragLeave(e) {
    e.target.classList.remove('over');
}

function handleDragEnd(e) {
    boxes.forEach((box) => box.classList.remove('dragging'));
}

function handleDrop(e) {
    e.preventDefault();
    const targetCell = e.target.parentElement;
    if (targetCell.tagName === 'TD') {
        if (targetCell !== sourceCell) {
            // Store the original parent of the moved box
            originalParent = sourceCell;

            // Save the previous state and action before moving the box
            const previousState = document.getElementById('table').outerHTML;
            const previousAction = 'changeCell'; // Record the action type
            undoStack.push({ action: previousAction, state: previousState });

            const targetBox = targetCell.querySelector('.box');
            const sourceRect = currentBox.getBoundingClientRect();
            const targetRect = targetBox.getBoundingClientRect();

            // Calculate the offset for animation
            const xOffset = targetRect.left - sourceRect.left;
            const yOffset = targetRect.top - sourceRect.top;
            const xScale = targetRect.width / sourceRect.width;
            const yScale = targetRect.height / sourceRect.height;

            // Apply animation to the moving boxes
            currentBox.style.transition = 'transform 0.4s';
            targetBox.style.transition = 'transform 0.4s';

            currentBox.style.transformOrigin = 'top left';
            currentBox.style.transform = `translate(${xOffset}px, ${yOffset}px) scale(${xScale}, ${yScale})`;

            targetBox.style.transformOrigin = 'top left';
            targetBox.style.transform = `translate(-${xOffset}px, -${yOffset}px) scale(${1 / xScale}, ${1 / yScale})`;

            setTimeout(() => {
                // Swap the boxes and remove animation
                targetCell.appendChild(currentBox);
                sourceCell.appendChild(targetBox);
                currentBox.style.transition = '';
                targetBox.style.transition = '';
                currentBox.style.transform = '';
                targetBox.style.transform = '';

                targetCell.classList.remove('over');
                document.getElementById('undoButton').disabled = false;
            }, 300); // Adjust the delay if needed
        }
    }
}

function undo() {
    if (undoStack.length > 0) {
        const previousAction = undoStack.pop();
        const table = document.getElementById('table');

        if (previousAction.action === 'changeCell') {
            // Restore the previous state by updating table content
            const previousState = previousAction.state;
            table.innerHTML = previousState;

            // Reattach event listeners to the boxes
            const newBoxes = table.querySelectorAll('.box');
            newBoxes.forEach(box => {
                box.addEventListener('dragstart', handleDragStart);
                box.addEventListener('dragenter', handleDragEnter);
                box.addEventListener('dragover', handleDragOver);
                box.addEventListener('dragleave', handleDragLeave);
                box.addEventListener('drop', handleDrop);
                box.addEventListener('dragend', handleDragEnd);
            });
        } else if (previousAction.action === 'addRow') {
            // Remove the last row added
            table.deleteRow(table.rows.length - 1);
        }

        // Disable the "Undo" button if there are no more moves to revert
        document.getElementById('undoButton').disabled = undoStack.length === 0;
    }
}

boxes.forEach((box, index) => {
    const colorIndex = index % uniqueColors.length;
    box.style.backgroundColor = uniqueColors[colorIndex];

    box.addEventListener('dragstart', handleDragStart);
    box.addEventListener('dragenter', handleDragEnter);
    box.addEventListener('dragover', handleDragOver);
    box.addEventListener('dragleave', handleDragLeave);
    box.addEventListener('drop', handleDrop);
    box.addEventListener('dragend', handleDragEnd);
});

let currentValue = 1000;
// to get highest valye from
function getHighestValue() {
    let highestValue = -Infinity;

    const table = document.getElementById('table');
    const cells = table.querySelectorAll('.box');

    cells.forEach((cell) => {
        const cellValue = parseInt(cell.textContent);
        if (!isNaN(cellValue) && cellValue > highestValue) {
            highestValue = cellValue;
        }
    });

    return highestValue;
}

function addRow() {
    const table = document.getElementById('table');
    const newRow = document.createElement('tr');
    let highestValue = getHighestValue() + 100;

    for (let i = 0; i < 3; i++) {
        const newCell = document.createElement('td');
        const newBox = document.createElement('div');
        const colorIndex = (table.rows.length + i) % uniqueColors.length;

        const nextColor = getNextAvailableColor();
        newBox.className = 'box';
        newBox.draggable = true;
        newBox.style.backgroundColor = nextColor;
        newBox.textContent = highestValue;
        highestValue += 100; // Increment the value for the next cell

        newBox.addEventListener('dragstart', handleDragStart);
        newBox.addEventListener('dragenter', handleDragEnter);
        newBox.addEventListener('dragover', handleDragOver);
        newBox.addEventListener('dragleave', handleDragLeave);
        newBox.addEventListener('drop', handleDrop);
        newBox.addEventListener('dragend', handleDragEnd);

        newCell.appendChild(newBox);
        newRow.appendChild(newCell);
    }
    // Save the previous state and action before adding the row
    const previousState = document.getElementById('table').outerHTML;
    const previousAction = 'addRow'; // Record the action type
    undoStack.push({ action: previousAction, state: previousState });

    table.appendChild(newRow);
    document.getElementById('undoButton').disabled = false;
}

document.getElementById('addRowButton').addEventListener('click', addRow);
document.getElementById('undoButton').addEventListener('click', undo);
