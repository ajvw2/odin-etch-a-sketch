async function makeGrid() {
    gridSize = gridSizeSlider.value;
    let pixelAmount = gridSize ** 2;
    let widthPercentage = 100 / gridSize;
    let newPixels = document.createDocumentFragment();

    grid.style.gridTemplateColumns = `repeat(${gridSize}, ${widthPercentage}%)`;
    grid.style.gridTemplateRows = `repeat(${gridSize}, ${widthPercentage}%)`;
    
    for (let i = 0; i < pixelAmount; i++) {
        let pixel = document.createElement('div');
        pixel.classList.add('pixel');
        pixel.setAttribute('draggable', 'false');
        newPixels.append(pixel);
    }

    grid.replaceChildren(newPixels);
    pixels = document.querySelectorAll('.pixel');
    updateGridLines();
}

async function clearGrid() {
    // Select random shaking animation
    let shakeNumber = Math.floor(Math.random() * 2) + 1;
    sketcher.classList.add(`shake${shakeNumber}`);
    // Prevent appearance of scroll bars during animation
    body.style.overflow = 'hidden';
    

    grid.classList.add('clearing');
    let pixelAmount = pixels.length;

    for (let i = 0; i < pixelAmount; i++) {
        pixels[i].style.backgroundColor = 'transparent';
        
        // Create sweeping animation while clearing
        if (i % gridSize / 4 === 0) {
            let delayTime = Math.max(Math.floor(1000 / gridSize), 25);
            await delay(delayTime);
        }
    }
    await delay(1000);
    grid.classList.remove('clearing');

    sketcher.addEventListener('animationiteration', () => {
        sketcher.classList.remove(`shake${shakeNumber}`);
    });
    await delay(1200);
    body.style.overflow = 'visible';
}

async function changeGrid() {
    clearGrid();
    setTimeout(makeGrid, 50 * gridSize);
}

function updateGridLines() {
    let pixelAmount = gridSize ** 2;
    if (gridToggler.checked) {
        for (let i = 0; i < pixelAmount; i++) {
            pixels[i].classList.add('borders-on');
        }
    } else {
        for (let i = 0; i < pixelAmount; i++) {
            pixels[i].classList.remove('borders-on');
        } 
    }
    
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

function setPixelColor(x, y) {
    let currentPixel = document.elementFromPoint(x, y);
    if (currentPixel.classList.contains('pixel')) {
        currentPixel.style.backgroundColor = getColor();
        // Animate colored pixel
        currentPixel.classList.add('got-colored');
        currentPixel.addEventListener('animationend', () => {
            currentPixel.classList.remove('got-colored');
        });
    }
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
    
    return `rgb(${r}, ${g}, ${b})`;
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
let pixels;
makeGrid();

// Listen for drawing events
draw();

// Control box 1 event listeners
rainbowToggler.addEventListener('change', () => {
    rainbowMode = !rainbowMode;
})

// Control box 4 event listeners
gridSizeSlider.addEventListener('change', changeGrid);
clearButton.addEventListener('click', clearGrid);
gridToggler.addEventListener('change', updateGridLines);



