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
        pixel.setAttribute('id', `px${i}`);
        pixel.setAttribute('draggable', 'false');
        newPixels.append(pixel);
    }

    grid.replaceChildren(newPixels);
    pixels = document.querySelectorAll('.pixel');
    updateGridLines();
}

async function clearGrid() {
    // // Select random shaking animation
    // let shakeNumber = Math.floor(Math.random() * 2) + 1;
    // sketcher.classList.add(`shake${shakeNumber}`);
    // // Prevent appearance of scroll bars during animation
    // body.style.overflow = 'hidden';
    

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

    // sketcher.addEventListener('animationiteration', () => {
    //     sketcher.classList.remove(`shake${shakeNumber}`);
    // });
    // await delay(1200);
    // body.style.overflow = 'visible';
}

function updateGridLines() {
    let pixelAmount = gridSize ** 2;
    if (gridToggler.checked) {
        for (let i = 0; i < pixelAmount; i++) {
            pixels[i].classList.add('borders-on');
            if (i % gridSize === gridSize - 1) {
                pixels[i].classList.add('on-right');
            }
            if (i > (gridSize * (gridSize - 1)) - 1)
            {
                pixels[i].classList.add('on-bottom');
            }
        }
    } else {
        for (let i = 0; i < pixelAmount; i++) {
            pixels[i].classList.remove('borders-on');
        } 
    }
    
}

function editPixels() {
    let mouseIsDown = false;
    window.onmousedown = () => { mouseIsDown = true; }
    window.onmouseup = () => { mouseIsDown = false; }

    ['mousedown', 'touchmove'].forEach(function(e) {
        grid.addEventListener(e, function(event) {
            const currentPixel = (e === 'touchmove') ?
                                document.elementFromPoint(event.touches[0].clientX, event.touches[0].clientY) :
                                document.elementFromPoint(event.clientX, event.clientY);
            const pixelNumber = currentPixel.id.match(/\d/g).join('');
            
            if (filling) {
                const pixelColor = currentPixel.style.backgroundColor;
                floodFill(pixelNumber, pixelColor);
            } else if (lighten || darken) {
                setPixelBrightness(currentPixel);
            } else {
                (e === 'touchmove') ? 
                setPixelColor(event.touches[0].clientX, event.touches[0].clientY) : 
                setPixelColor(event.clientX, event.clientY); 
            }
        });
    });

    grid.addEventListener('mouseover', function(e) {
        if (mouseIsDown && !filling) {
            if (!(lighten || darken)) {
                setPixelColor(e.clientX, e.clientY);
            } else {
                setPixelBrightness(document.elementFromPoint(e.clientX, e.clientY));
            }
            
        } 
    });
}

function setPixelColor(x, y) {
    let currentPixel = document.elementFromPoint(x, y);
    if (currentPixel.classList.contains('pixel')) {
        currentPixel.style.backgroundColor = getColor();
        // Animate colored pixel
        if (!erasing) {
            currentPixel.classList.add('got-colored');
            currentPixel.addEventListener('animationend', () => {
                currentPixel.classList.remove('got-colored');
            });
        }
    }
}

function getColor() {
    let r, g, b;
    let color = colorPicker.value;
    
    if (erasing) {
        return 'transparent';
    } else if (rainbowMode) {
        r = Math.floor(Math.random() * 256);
        g = Math.floor(Math.random() * 256);
        b = Math.floor(Math.random() * 256)
    } else {
        r = parseInt(color.substr(1,2), 16);
        g = parseInt(color.substr(3,2), 16);
        b = parseInt(color.substr(5,2), 16);
    }
    
    return `rgb(${r}, ${g}, ${b})`;
}

function floodFill(pixelID, currentColor) {
    pixelID = parseInt(pixelID, 10);

    const pixel = document.querySelector(`#px${pixelID}`);
    
    // Base case: pixel = null (i.e. out of bounds)
    if (!pixel) {
        return;
    }

    // Base case 2: pixel is already filled with color of initial pixel
    if (currentColor === '' || currentColor === 'transparent') {
        if (
            (pixel.style.backgroundColor !== '') && 
            (pixel.style.backgroundColor !== 'transparent')
            ) {
            return;
        }
    } else {
        if ((pixel.style.backgroundColor !== currentColor)) {
            return;
        }
    }
    
    // Set new color
    pixel.style.backgroundColor = getColor();
    
    // FILL NEIGHBORS
    // Top
    const northPixelID = pixelID - gridSize;
    floodFill(northPixelID, currentColor);
    // Bottom
    const southPixelID = pixelID + +gridSize;
    floodFill(southPixelID, currentColor);
    // Left
    const westPixelID = pixelID - 1;
    if (!(pixelID % gridSize === 0)) {
        floodFill(westPixelID, currentColor);
    }
    // Right
    const eastPixelID = pixelID + 1;
    if (!(eastPixelID % gridSize === 0)) {
        floodFill(eastPixelID, currentColor);
    }
    return;
}

function setPixelBrightness(pixel) {
    if (!pixel.style.filter) {
        pixel.style.filter = lighten ? 'brightness(110%)' : 'brightness(90%)';
    } else {
        const currentBrightness = pixel.style.filter.match(/\d/g).join('');
        let newBrightness = lighten ? (+currentBrightness + 10) : (currentBrightness - 10);
        // Allow for a max 100% increase and 100% decrease
        if (newBrightness <= 200 || newBrightness >= 0) {
            pixel.style.filter = `brightness(${newBrightness}%)`;
        }
    }

    pixel.classList.add('got-colored');
    pixel.addEventListener('animationend', () => {
        pixel.classList.remove('got-colored');
    });
}

function turnOffOtherTools(currentTool) {
    if (currentTool != 'fill') {
        filling = false;
        fillToggler.checked = false;
    }
    if (currentTool != 'eraser') {
        erasing = false;
        eraserToggler.checked = false;
    }
    if (currentTool != 'lighten') {
        lighten = false;
        lightenToggler.checked = false;
    }
    if (currentTool != 'darken') {
        darken = false;
        darkenToggler.checked = false;
    }
}

function delay(ms) {
    return new Promise((resolution) => {setTimeout(() => resolution('done!'), ms)});
}

function download() {
    const pixelAmount = gridSize ** 2;
    const image = document.createElement('canvas');
    image.height = gridSize;
    image.width = gridSize;
    const imageContext = image.getContext('2d');
    imageContext.clearRect(0, 0, image.width, image.height);

    for (let i = 0; i < pixelAmount; i++) {
        if (pixels[i].style.backgroundColor) {
            if (!pixels[i].style.filter) {
                imageContext.fillStyle = pixels[i].style.backgroundColor;
            }
            else {
                let rgbSplit = pixels[i].style.backgroundColor.split(',');
                let rgb = new Array();
                rgbSplit.forEach((value) => {
                    rgb.push(value.match(/\d/g).join(''));
                });

                const currentBrightness = pixels[i].style.filter.match(/\d/g).join('');
                rgb = rgb.map(x => x * currentBrightness / 100);
                
                imageContext.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
            }
            
            imageContext.fillRect(i % gridSize, Math.floor(i / gridSize), 1, 1);
        }
    }

    const imageDataURL = image.toDataURL("image/png");

    const link = document.createElement('a');
    link.href = imageDataURL;
    link.download = 'sketch.png';
    link.click();
}

function setGridSizeDisplay() {
    let selectedGridSize = gridSizeSlider.value;
    let sliderWidth = gridSizeSlider.offsetWidth - 38;
    let widthPercentage = sliderWidth / 60;

    gridSizeDisplay.style.left = (`${selectedGridSize * widthPercentage + 4}px`);
    gridSizeDisplay.textContent = selectedGridSize;
}

// Main elements
const body = document.querySelector('body');
const sketcher = document.querySelector('.sketcher');
const grid = document.querySelector('.pixel-grid');


// Control box 1 elements
const rainbowToggler = document.querySelector('#rainbow-switch-checkbox');
let rainbowMode = false;
const colorPicker = document.querySelector('#colorpicker');
const colorPickerDisabler = document.querySelector('.colorpicker-disabler');

// Control box 2 elements
const fillToggler = document.querySelector('#fill-switch-checkbox');
let filling = false;
const eraserToggler = document.querySelector('#eraser-switch-checkbox');
let erasing = false;
const lightenToggler = document.querySelector('#lighten-switch-checkbox');
let lighten = false;
const darkenToggler = document.querySelector('#darken-switch-checkbox');
let darken = false;


// Control box 3 elements
const gridSizeSlider = document.querySelector('#grid-size-slider');
const gridSizeDisplay = document.querySelector('.grid-size-value');
setGridSizeDisplay();
const gridToggler = document.querySelector('#grid-switch-checkbox');
const clearButton = document.querySelector("#clear");

// Control box 4 elements
const downloadButton = document.querySelector('#download');

// Get initial grid size from slider and make the grid
let gridSize;
let pixels;
makeGrid();

// Listen for drawing events
editPixels();

// Control box 1 event listeners
rainbowToggler.addEventListener('change', () => {
    rainbowMode = !rainbowMode;
    if (rainbowMode) {
        colorPickerDisabler.style.display = 'block';
    } else {
        colorPickerDisabler.style.display = 'none';
    }
});

// Control box 2 event listeners
fillToggler.addEventListener('change', () => {
    filling = !filling;
    if (filling) turnOffOtherTools('fill');

});

eraserToggler.addEventListener('change', () => {
    erasing = !erasing;
    if (erasing) turnOffOtherTools('eraser');
});

lightenToggler.addEventListener('change', () => {
    lighten = !lighten;
    if (lighten) turnOffOtherTools('lighten');
})

darkenToggler.addEventListener('change', () => {
    darken = !darken;
    if (darken) turnOffOtherTools('darken');
})

// Control box 3 event listeners
gridSizeSlider.addEventListener('change', () => {
    console.log('Changed!');
    makeGrid();
});
gridSizeSlider.addEventListener('input', setGridSizeDisplay);
gridToggler.addEventListener('change', updateGridLines);
clearButton.addEventListener('click', clearGrid);

// Control box 4 event listeners
downloadButton.addEventListener('click', download);






