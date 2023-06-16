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

    sketcher.classList.add('shake');
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

    sketcher.classList.remove('shake');
}

const grid = document.querySelector('.pixel-grid');
let gridSize = 16;
setGrid();

const sketcher = document.querySelector('.sketcher');

const pixels = document.querySelectorAll('.pixel');

let mouseIsDown = false;
window.onmousedown = () => {
    mouseIsDown = true;
}
window.ontouchstart = () => {
    mouseIsDown = true;
}

window.onmouseup = () => {
    mouseIsDown = false;
}

window.ontouchend = () => {
    mouseIsDown = true;
}


pixels.forEach((pixel) => {
    pixel.addEventListener('mouseover', () => {
        if (mouseIsDown) {
            pixel.style.backgroundColor = 'rgba(0, 0, 0, 0.700)';
        } else {
            pixel.addEventListener('mousedown', () => {
                pixel.style.backgroundColor = 'rgba(0, 0, 0, 0.700)';
            })
            pixel.addEventListener('touchstart', () => {
                pixel.style.backgroundColor = 'rgba(0, 0, 0, 0.700)';
            })
        }
    })
})

clearButton = document.querySelector("#clear");

clearButton.addEventListener('click', () => {
    clearGrid();
})



