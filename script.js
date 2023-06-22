function delay(ms) {
    return new Promise((resolution) => {setTimeout(() => resolution('done!'), ms)});
}

async function makeGrid() {
    if (pixels) await clearGrid();
    toggleInputs();
    setWaitCursor(true);

    gridSize = gridSizeSlider.value;
    let pixelAmount = gridSize ** 2;
    let widthPercentage = 100 / gridSize;

    grid.style.gridTemplateColumns = `repeat(${gridSize}, ${widthPercentage}%)`;
    grid.style.gridTemplateRows = `repeat(${gridSize}, ${widthPercentage}%)`;

    let newPixels = document.createDocumentFragment();
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

    toggleInputs();
    setWaitCursor(false);
}

async function clearGrid() {
    clearing = true;
    toggleInputs();
    setWaitCursor(true);
    grid.classList.add('clearing');
    

    let pixelAmount = gridSize ** 2;
    for (let i = 0; i < pixelAmount; i++) {
        pixels[i].style.backgroundColor = 'transparent';
        pixels[i].style.filter = '';
        
        // Create sweeping animation while clearing
        if (i % gridSize / 4 === 0) {
            let delayTime = Math.max(Math.floor(1000 / gridSize), 25);
            await delay(delayTime);
        }
    }
    
    toggleInputs();
    setWaitCursor(false);
    grid.classList.remove('clearing');
    clearing = false;
}

function setWaitCursor(on) {
    sketcher.style.cursor = (on) ? 'wait' : 'default';
    clearButton.style.cursor = (on) ? 'wait' : 'pointer';
    downloadButton.style.cursor = (on) ? 'wait' : 'pointer';
    togglers = document.querySelectorAll('.toggler');
    togglers.forEach((toggler) => {
        toggler.style.cursor = (on) ? 'wait' : 'pointer';
    })
    gridSizeSlider.style.cursor = (on) ? 'wait' : 'default';
}

function toggleInputs() {
    if (!rainbowMode) colorPicker.disabled = !colorPicker.disabled;
    rainbowToggler.disabled = !rainbowToggler.disabled;
    fillToggler.disabled = !fillToggler.disabled;
    eraserToggler.disabled = !eraserToggler.disabled;
    lightenToggler.disabled = !lightenToggler.disabled;
    darkenToggler.disabled = !darkenToggler.disabled;
    gridSizeSlider.disabled = !gridSizeSlider.disabled;
    gridToggler.disabled = !gridToggler.disabled;
    clearButton.disabled = !clearButton.disabled;
    downloadButton.disabled = !downloadButton.disabled;
}

function updateGridLines() {
    let pixelAmount =  gridSize ** 2;
    if (gridToggler.checked) {
        for (let i = 0; i < pixelAmount; i++) {
            pixels[i].classList.add('borders-on');
            // Last column border style
            if (i % gridSize === gridSize - 1) {
                pixels[i].classList.add('on-right');
            }
            // Last row border style
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

    ['mousedown', 'touchmove'].forEach(function(event) {
        grid.addEventListener(event, function(e) {
            if (!clearing) {
                const pixel = (event === 'touchmove') ?
                document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY) :
                document.elementFromPoint(e.clientX, e.clientY);
                if (filling) {
                    // Select {number} from id = 'px{number}'
                    const pixelNumber = pixel.id.match(/\d/g).join('');
                    const pixelColor = pixel.style.backgroundColor;
                    floodFill(pixelNumber, pixelColor);
                } else if (lighten || darken) {
                    setPixelBrightness(pixel);
                } else {
                    setPixelColor(pixel); 
                }
            }   
        });
    });

    grid.addEventListener('mouseover', function(e) {
        if (mouseIsDown && !filling) {
            if (!clearing) {
                const pixel = document.elementFromPoint(e.clientX, e.clientY);
                (lighten || darken) ? setPixelBrightness(pixel) : setPixelColor(pixel);
            }        
        } 
    });
}

function setPixelColor(pixel) {
    if (pixel.classList.contains('pixel')) {
        pixel.style.backgroundColor = getColor();
        // Reset pixel brightness and don't animate when erasing
        (erasing) ? (pixel.style.filter = '') : animateChangedPixel(pixel);
    }
}

function getColor() {
    let r, g, b;
    let color = colorPicker.value; // Hex color code
    
    // Return color based on selected tool / coloring mode
    if (erasing) {
        return 'transparent';
    } else if (rainbowMode) {
        r = Math.floor(Math.random() * 256);
        g = Math.floor(Math.random() * 256);
        b = Math.floor(Math.random() * 256);
    } else {
        // Convert hex to rgb
        r = parseInt(color.substr(1,2), 16);
        g = parseInt(color.substr(3,2), 16);
        b = parseInt(color.substr(5,2), 16);
    }
    return `rgb(${r}, ${g}, ${b})`;
}

function floodFill(pixelID, initialColor) {
    const pixel = document.querySelector(`#px${pixelID}`);
    // Base case 1: Pixel out of bounds (i.e. null)
    if (!pixel) {
        return;
    }

    const background = pixel.style.backgroundColor;
    // Base case 2: Pixel already filled with initial color
    if (initialColor === '' || initialColor === 'transparent') {
        if (background !== '' && background !== 'transparent') return;
    }
    if (background !== initialColor) return;
    
    
    const newColor = getColor();
    // Base case 3: Initial color is equal to fill color
    if (initialColor === newColor) return;

    // Set new pixel color
    pixel.style.backgroundColor = newColor;
    
    // Recursively fill neighbouring pixels
    const northPixelID = pixelID - gridSize;
    const southPixelID = +pixelID + +gridSize;
    const westPixelID = pixelID - 1;
    const westOnPreviousRow = pixelID % gridSize === 0;
    const eastPixelID = +pixelID + 1;
    const eastOnNextRow = eastPixelID % gridSize === 0;

    floodFill(northPixelID, initialColor);
    floodFill(southPixelID, initialColor);
    if (!westOnPreviousRow) floodFill(westPixelID, initialColor);
    if (!eastOnNextRow) floodFill(eastPixelID, initialColor);
}

function setPixelBrightness(pixel) {
    const background = pixel.style.backgroundColor;
    // Don't set brightness on empty pixels
    if (background === '' || background === 'transparent') return;

    const currentFilter = pixel.style.filter;
    if (!currentFilter || currentFilter === '') {
        // Initiate brightness setting based on lighten or darken mode
        pixel.style.filter = lighten ? 'brightness(110%)' : 'brightness(90%)';
    } else {
        const currentBrightness = pixel.style.filter.match(/\d/g).join('');
        let newBrightness = lighten ? (+currentBrightness + 10) : (currentBrightness - 10);
        // Allow for a maximum 100% increase and 100% decrease
        if (newBrightness <= 200 || newBrightness >= 0) {
            pixel.style.filter = `brightness(${newBrightness}%)`;
        }
    }
    animateChangedPixel(pixel);
}

function animateChangedPixel(pixel) {
    pixel.classList.add('got-colored');
    pixel.addEventListener('animationend', () => {
        pixel.classList.remove('got-colored');
    });
}

function turnOffOtherTools(currentTool) {
    if (currentTool !== 'filling') {
        filling = false;
        fillToggler.checked = false;
    }
    if (currentTool !== 'erasing') {
        erasing = false;
        eraserToggler.checked = false;
    }
    if (currentTool !== 'lighten') {
        lighten = false;
        lightenToggler.checked = false;
    }
    if (currentTool !== 'darken') {
        darken = false;
        darkenToggler.checked = false;
    }
}

function setGridSizeDisplay() {
    // Update position of the grid size number that sits on top
    // of the slider thumb
    let selectedGridSize = gridSizeSlider.value;
    let sliderWidth = gridSizeSlider.offsetWidth - 38;
    let widthPercentage = sliderWidth / 60;

    gridSizeDisplay.style.left = (`${selectedGridSize * widthPercentage + 4}px`);
    gridSizeDisplay.textContent = selectedGridSize;
}

function download() {
    // Create PNG image of (gridSize*gridSize) pixels using canvas element
    const image = document.createElement('canvas');
    image.height = gridSize;
    image.width = gridSize;
    const imageContext = image.getContext('2d');
    imageContext.clearRect(0, 0, image.width, image.height);

    const pixelAmount = gridSize ** 2;
    for (let i = 0; i < pixelAmount; i++) {
        if (pixels[i].style.backgroundColor) {
            if (!pixels[i].style.filter) {
                // Without brightness setting, set fill style to RGB
                // background color of current pixel
                imageContext.fillStyle = pixels[i].style.backgroundColor;
            }
            else {
                // Calculate corresponding RGB value for pixels with brightness 
                // setting before setting fill style
                const rgbSplit = pixels[i].style.backgroundColor.split(',');
                let rgb = new Array();
                rgbSplit.forEach((value) => {
                    rgb.push(value.match(/\d/g).join(''));
                });

                const currentBrightness = pixels[i].style.filter.match(/\d/g).join('');
                rgb = rgb.map(x => x * currentBrightness / 100);
                
                imageContext.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
            }
            // Fill corresponding pixel point on canvas
            imageContext.fillRect(i % gridSize, Math.floor(i / gridSize), 1, 1);
        }
    }

    const link = document.createElement('a');
    link.href = image.toDataURL("image/png");
    link.download = 'sketch.png';
    link.click();
}

function collapseButtonUpdater() {
    if (windowWidth > 755) {
        menuCollapseButton.addEventListener('mouseover', () => {
            menuCollapseArrow.style.content = 
                (displayingMenu) ? 
                'url(./images/menu-left-filled.png)' : 
                'url(./images/menu-right-filled.png)'; 
        });
        
        menuCollapseButton.addEventListener('mouseout', () => {
            menuCollapseArrow.style.content = 
                (displayingMenu) ? 
                'url(./images/menu-left-open.png)' : 
                'url(./images/menu-right-open.png)'; 
        });
    } else {
        menuCollapseButton.addEventListener('mouseover', () => {
            menuCollapseArrow.style.content = 
                (displayingMenu) ? 
                'url(./images/menu-up-filled.png)' : 
                'url(./images/menu-down-filled.png)'; 
        });
        
        menuCollapseButton.addEventListener('mouseout', () => {
            menuCollapseArrow.style.content = 
                (displayingMenu) ? 
                'url(./images/menu-up-open.png)' : 
                'url(./images/menu-down-open.png)'; 
        });
    }
}

function setSketcherDimensions() {
    // TODO: Clean up this code at a later stage. This feels very messy 
    // (but somehow works).
    if (windowWidth > 755) {
        if (windowWidth >= 1300) {
            sketcherWrapper.style.maxWidth = 
                (displayingMenu) ? 
                '1300px' : 
                '1050px';
        } else {
            sketcherWrapper.style.maxWidth = 
                (displayingMenu) ? 
                `${windowWidth}px` : 
                `${windowWidth - 250}px`;
        }
        controlPanel.style.maxHeight = '733px';
        // There must be a better way. Just setting 'width' breaks things, however.
        controlPanel.style.minWidth = (displayingMenu) ? '250px' : '0px';
        controlPanel.style.maxWidth = (displayingMenu) ? '250px' : '0px';
        menuCollapseButton.style.flex = 0;
        // Initializes arrow images
        menuCollapseArrow.style.content = 
            (displayingMenu) ? 
            'url(./images/menu-left-open.png)' : 
            'url(./images/menu-right-open.png)'; 
    } else {
        sketcherWrapper.style.maxWidth = windowWidth;
        controlPanel.style.minWidth = '250px';
        controlPanel.style.maxWidth = '550px';
        if (windowWidth > 500) {
            controlPanel.style.minHeight = (displayingMenu) ? '413px' : '0px';
        } else {
            controlPanel.style.minHeight = (displayingMenu) ? '750px' : '0px';
        }
        controlPanel.style.maxHeight = (displayingMenu) ? null : '0px';
        // These 4 menuCollapseButton styles feel nastily overcomplicated,
        // but it works...
        menuCollapseButton.style.maxWidth = windowWidth;
        menuCollapseButton.style.minWidth = windowWidth;
        menuCollapseButton.style.flex = 1;
        menuCollapseButton.style.flexBasis = '100%';
        // Initializes arrow images
        menuCollapseArrow.style.content = 
            (displayingMenu) ? 
            'url(./images/menu-up-open.png)' : 
            'url(./images/menu-down-open.png)'; 
    }
}

// Main elements
const body = document.querySelector('body');
const sketcherWrapper = document.querySelector('.sketcher-wrapper');
const sketcher = document.querySelector('.sketcher');
const grid = document.querySelector('.pixel-grid');
const menuCollapseButton = document.querySelector('.collapser');
let displayingMenu = false;
const menuCollapseArrow = document.querySelector('#menu-collapse-arrow');
const controlPanel = document.querySelector('.controls');

// Control box 1 elements
const colorPicker = document.querySelector('#colorpicker');
const colorPickerDisabler = document.querySelector('.colorpicker-disabler');
const rainbowToggler = document.querySelector('#rainbow-switch-checkbox');
let rainbowMode = false;

// Control box 2 elements
const fillToggler = document.querySelector('#fill-switch-checkbox');
const eraserToggler = document.querySelector('#eraser-switch-checkbox');
const lightenToggler = document.querySelector('#lighten-switch-checkbox');
const darkenToggler = document.querySelector('#darken-switch-checkbox');
let filling = false;
let erasing = false;
let lighten = false;
let darken = false;

// Control box 3 elements
const gridSizeSlider = document.querySelector('#grid-size-slider');
const gridSizeDisplay = document.querySelector('.grid-size-value');
setGridSizeDisplay();
const gridToggler = document.querySelector('#grid-switch-checkbox');
const clearButton = document.querySelector("#clear");
let clearing = false;

// Control box 4 elements
const downloadButton = document.querySelector('#download');

// Global variables for grid size and pixel node list
let gridSize;
let pixels;

// Create grid and listen for drawing events
makeGrid();
editPixels();

// Window resize event listener
let windowWidth = document.body.clientWidth;
setSketcherDimensions();
window.addEventListener('resize', () => {
    windowWidth = document.body.clientWidth;
    setSketcherDimensions();
    collapseButtonUpdater();
});

// Menu collapse event listener
menuCollapseButton.addEventListener('click', () => {
    displayingMenu = !displayingMenu;
    setSketcherDimensions();
    collapseButtonUpdater();
});

// Control box 1 event listeners
rainbowToggler.addEventListener('change', () => {
    rainbowMode = !rainbowMode;
    colorPickerDisabler.style.display = (rainbowMode) ? 'block' : 'none';
    colorPicker.disabled = (rainbowMode) ? true : false;
});

// Control box 2 event listeners
fillToggler.addEventListener('change', () => {
    filling = !filling;
    if (filling) turnOffOtherTools('filling');
});

eraserToggler.addEventListener('change', () => {
    erasing = !erasing;
    if (erasing) turnOffOtherTools('erasing');
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
gridSizeSlider.addEventListener('change', makeGrid);
gridSizeSlider.addEventListener('input', setGridSizeDisplay);
gridToggler.addEventListener('change', updateGridLines);
clearButton.addEventListener('click', clearGrid);

// Control box 4 event listeners
downloadButton.addEventListener('click', download);








