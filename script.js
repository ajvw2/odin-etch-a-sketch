function setGrid() {
    let pixelPercentage = 100 / gridSize;
    for (let i = 0; i < gridSize ** 2; i++) {
        let newPixel = document.createElement('div');
        newPixel.classList.add('pixel');
        newPixel.setAttribute('id', `pixel${i}`);
        newPixel.style.cssText = `flex: 1 0 ${pixelPercentage}%`;
        if (i % gridSize === gridSize - 1)
        {
            newPixel.style.borderRight = '0px';
        }
        if (i > gridSize * (gridSize - 1) - 1) {
            newPixel.style.borderBottom = '0px';
        }
        grid.appendChild(newPixel);
    }
}

function delay(ms) {
    return new Promise((resolution) => {setTimeout(() => resolution('done!'), ms)});
}

async function clearGrid() {
    let shakeNumber = Math.floor(Math.random() * 2) + 1;

    sketcher.classList.add(`shake${shakeNumber}`);
    for (let i = 0; i < gridSize ** 2; i++) {
        let selectedPixel = document.querySelector(`#pixel${i}`);
        selectedPixel.classList.add('erasure');
        selectedPixel.style.backgroundColor = 'transparent';
        
        if (i % gridSize === 0) {
            selectedPixel.innerHTML = "&nbsp;";
            await delay(50);
            selectedPixel.innerHTML = "";
        }
    }

    pixels.forEach((pixel) => {
        pixel.classList.remove('erasure');
    })

    

    sketcher.addEventListener('animationiteration', () => {
        sketcher.classList.remove(`shake${shakeNumber}`);
    });  
}

const sketcher = document.querySelector('.sketcher');
const grid = document.querySelector('.pixel-grid');
let gridSize = 16;
setGrid();
const pixels = document.querySelectorAll('.pixel');


// Drawing with mouse held down
let mouseIsDown = false;
window.onmousedown = () => {
    mouseIsDown = true;
}
window.onmouseup = () => {
    mouseIsDown = false;
}

pixels.forEach((pixel) => {
    pixel.addEventListener('mouseover', () => {
        if (mouseIsDown) {
            pixel.style.backgroundColor = 'rgba(0, 0, 0, 0.700)';
        } else {
            pixel.addEventListener('mousedown', () => {
                pixel.style.backgroundColor = 'rgba(0, 0, 0, 0.700)';
            });
        }
    })
})


// Drawing on touchscreen
grid.addEventListener('touchmove', function(e) {
    // Credit to: https://gist.github.com/VehpuS/6fd5dca2ea8cd0eb0471
    let touch = e.touches[0];
    const pixel = document.elementFromPoint(touch.clientX, touch.clientY);
    pixel.style.backgroundColor = 'rgba(0, 0, 0, 0.700)';
});


// Clear grid button
clearButton = document.querySelector("#clear");
clearButton.addEventListener('click', () => {
    clearGrid();
})



