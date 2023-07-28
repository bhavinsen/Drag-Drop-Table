const boxes = document.querySelectorAll('.box');
let currentBox = null;
let sourceCell = null;
let originalParent = null;
const uniqueColors = ['#ff0000', '#008000', '#8080e5', '#ffff00', '#ffa500', '#800080', '#ffc0cb', '#a52a2a', '#808080'];

const undoStack = [];

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

            // Save the previous state before moving the box
            const previousState = document.getElementById('table').outerHTML;
            undoStack.push(previousState);

            targetCell.appendChild(currentBox);
            currentBox.classList.remove('dragging');
            targetCell.classList.remove('over');
            sourceCell.appendChild(e.target);
        }
    }
}

function undo() {
    if (undoStack.length > 0) {
        // Restore the previous state by replacing the current table content
        const previousState = undoStack.pop();
        const table = document.getElementById('table');
        table.outerHTML = previousState;
    }

    // Disable the "Undo" button if there are no more moves to revert
    document.getElementById('undoButton').disabled = undoStack.length === 0;
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

document.getElementById('undoButton').addEventListener('click', undo);
