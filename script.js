function makeGrid() {
    let pixelAmount = gridSize ** 2;
    let widthPercentage = 100 / gridSize;
    
    for (let i = 0; i < pixelAmount; i++) {
        let newPixel = document.createElement('div');
        newPixel.classList.add('pixel');

        let onLastColumn = (i % gridSize) === (gridSize - 1);
        let onLastRow = i > (gridSize * (gridSize - 1) - 1);
        if (onLastColumn) { newPixel.classList.add('last-column'); }
        if (onLastRow) { newPixel.classList.add('last-row'); }

        newPixel.setAttribute('id', `pixel${i}`);
        newPixel.style.flex = `1 0 ${widthPercentage}%`;
        grid.appendChild(newPixel);
    }
}

async function clearGrid() {
    // Select random shaking animation
    let shakeNumber = Math.floor(Math.random() * 2) + 1;
    sketcher.classList.add(`shake${shakeNumber}`);
    // Prevent appearance of scroll bars during animation
    body.style.overflow = 'hidden';
    
    let pixelAmount = gridSize ** 2;

    for (let i = 0; i < pixelAmount; i++) {
        let selectedPixel = document.querySelector(`#pixel${i}`);

        // Class '.erasure' increases transition time
        selectedPixel.classList.add('erasure');

        // Remove (background) color from pixel
        selectedPixel.style.backgroundColor = 'transparent';
        
        // Create sweeping animation while clearing
        if (i % gridSize === 0) {
            // selectedPixel.innerHTML = "&nbsp;";
            let delayTime = Math.max((750 / gridSize), 15);
            await delay(delayTime);
            // selectedPixel.innerHTML = "";
        }
    }

    pixels.forEach((pixel) => {
        pixel.classList.remove('erasure');
    })

    sketcher.addEventListener('animationiteration', () => {
        sketcher.classList.remove(`shake${shakeNumber}`);
    });
    await delay(1200);
    body.style.overflow = 'visible';
}

function freeGrid() {
    pixels.forEach((pixel) => {
        grid.removeChild(pixel);
    })
}

function updateGrid() {
    freeGrid();
    gridSize = gridSizeSlider.value;
    makeGrid();
    pixels = document.querySelectorAll('.pixel');
    updateGridLines();
    drawMouse();
}

function addGridLines() {
    pixels.forEach((pixel) => {
        pixel.classList.add('grid-lines-on');
    });
}

function removeGridLines() {
    pixels.forEach((pixel) => {
        pixel.classList.remove('grid-lines-on');
    });  
}

function updateGridLines() {
    gridToggler.checked ? addGridLines() : removeGridLines();
}

function drawMouse() {
    let mouseIsDown = false;
    window.onmousedown = () => { mouseIsDown = true; }
    window.onmouseup = () => { mouseIsDown = false; }

    pixels.forEach((pixel) => {
        pixel.addEventListener('mouseover', () => {
            // Color on mouseover if mouse is down, else only 
            // color on mousedown
            if (mouseIsDown) {
                pixel.style.backgroundColor = rainbowMode? getColor() : selectedColor;
            } else {
                pixel.addEventListener('mousedown', () => {
                    pixel.style.backgroundColor = rainbowMode? getColor() : selectedColor;
                });
            }
        });
    });
}

function drawTouch() {
    grid.addEventListener('touchmove', function(e) {
        // Credit to: https://gist.github.com/VehpuS/6fd5dca2ea8cd0eb0471
        let touch = e.touches[0];
        let pixel = document.elementFromPoint(touch.clientX, touch.clientY);
        pixel.style.backgroundColor = rainbowMode ? getColor() : selectedColor;
    });
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
let selectedColor = getColor();

// Control box 4 elements
const gridSizeSlider = document.querySelector('#grid-size-slider');
const gridToggler = document.querySelector('#grid-switch-checkbox');
const clearButton = document.querySelector("#clear");

// Get initial grid size from slider and make the grid
let gridSize = gridSizeSlider.value;
makeGrid();
// Select pixels created by makeGrid()
let pixels = document.querySelectorAll('.pixel');
updateGridLines();

// Listen for drawing events
drawMouse();
drawTouch();

// Control box 1 event listeners
colorPicker.addEventListener('change', () => {
    selectedColor = getColor();
})
rainbowToggler.addEventListener('change', () => {
    rainbowMode = !rainbowMode;
    if (!rainbowMode) {
        selectedColor = getColor();
    }
})

// Control box 4 event listeners
gridSizeSlider.addEventListener('change', updateGrid);
clearButton.addEventListener('click', clearGrid);
gridToggler.addEventListener('change', updateGridLines);



