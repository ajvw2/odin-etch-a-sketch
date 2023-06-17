function makeGrid() {
    gridSize = gridSizeSlider.value;
    let pixelAmount = gridSize ** 2;
    let widthPercentage = 100 / gridSize;
    let allPixels = document.createDocumentFragment();

    for (let i = 0; i < pixelAmount; i++) {
        let newPixel = document.createElement('div');
        newPixel.classList.add('pixel');

        let onLastColumn = (i % gridSize) === (gridSize - 1);
        if (onLastColumn) newPixel.classList.add('last-column');

        let onLastRow = i > (gridSize * (gridSize - 1) - 1);
        if (onLastRow) newPixel.classList.add('last-row');
        newPixel.setAttribute('id', `pixel${i}`);

        newPixel.style.flex = `1 0 ${widthPercentage}%`;
        allPixels.append(newPixel);
    }

    grid.replaceChildren(allPixels);
    updateGridLines();
}

async function clearGrid() {
    // // Select random shaking animation
    // let shakeNumber = Math.floor(Math.random() * 2) + 1;
    // sketcher.classList.add(`shake${shakeNumber}`);
    // // Prevent appearance of scroll bars during animation
    // body.style.overflow = 'hidden';
    
    let pixelAmount = gridSize ** 2;
    grid.classList.add('erasure');

    for (let i = 0; i < pixelAmount; i++) {
        let selectedPixel = document.querySelector(`#pixel${i}`);

        // Class '.erasure' increases transition time
        selectedPixel.classList.add('erasure');

        // Remove (background) color from pixel
        selectedPixel.style.backgroundColor = 'transparent';
        
        // Create sweeping animation while clearing
        if (i % gridSize === 0) {
            // selectedPixel.innerHTML = "&nbsp;";
            let delayTime = Math.floor(750 / gridSize);
            await delay(delayTime);
            // selectedPixel.innerHTML = "";
        }
    }

    grid.classList.remove('erasure');

    // sketcher.addEventListener('animationiteration', () => {
    //     sketcher.classList.remove(`shake${shakeNumber}`);
    // });
    // await delay(1200);
    // body.style.overflow = 'visible';
}

function addGridLines() {
    grid.classList.add('grid-lines-on');
}

function removeGridLines() {
    grid.classList.remove('grid-lines-on'); 
}

function updateGridLines() {
    gridToggler.checked ? addGridLines() : removeGridLines();
}

function draw() {
    let mouseIsDown = false;
    window.onmousedown = () => { mouseIsDown = true; }
    window.onmouseup = () => { mouseIsDown = false; }

    ['mousedown', 'touchmove'].forEach(function(e) {
        grid.addEventListener(e, function(event) {
            (e === 'touchmove') ? 
                setPixelColor(event.touches[0].clientX, event.touches[0].clientY) : 
                setPixelColor(event.clientX, event.clientY); 
        });
    });

    grid.addEventListener('mouseover', function(e) {
        if (mouseIsDown) setPixelColor(e.clientX, e.clientY);
    });
}

// function drawTouch() {
//     grid.addEventListener('touchmove', function(e) {
//         setPixelColor(e.touches[0].clientX, e.touches[0].clientY);
//     });
// }

function setPixelColor(x, y) {
    let currentPixel = document.elementFromPoint(x, y);
    currentPixel.style.backgroundColor = getColor();
}

function getColor() {
    let r, g, b;
    let color = colorPicker.value;
    
    if (rainbowMode) {
        r = Math.floor(Math.random() * 256);
        g = Math.floor(Math.random() * 256);
        b = Math.floor(Math.random() * 256);
    } else {
        r = parseInt(color.substr(1,2), 16);
        g = parseInt(color.substr(3,2), 16);
        b = parseInt(color.substr(5,2), 16);
    }
    
    return `rgba(${r}, ${g}, ${b}, 0.700)`;
}

function delay(ms) {
    return new Promise((resolution) => {setTimeout(() => resolution('done!'), ms)});
}

// Main elements
const body = document.querySelector('body');
const sketcher = document.querySelector('.sketcher');
const grid = document.querySelector('.pixel-grid');


// Control box 1 elements
const rainbowToggler = document.querySelector('#rainbow-switch-checkbox');
let rainbowMode = false;
const colorPicker = document.querySelector('#colorpicker');

// Control box 4 elements
const gridSizeSlider = document.querySelector('#grid-size-slider');
const gridToggler = document.querySelector('#grid-switch-checkbox');
const clearButton = document.querySelector("#clear");

// Get initial grid size from slider and make the grid
let gridSize;
makeGrid();

// Listen for drawing events
draw();

// Control box 1 event listeners
rainbowToggler.addEventListener('change', () => {
    rainbowMode = !rainbowMode;
})

// Control box 4 event listeners
gridSizeSlider.addEventListener('change', makeGrid);
clearButton.addEventListener('click', clearGrid);
gridToggler.addEventListener('change', updateGridLines);



