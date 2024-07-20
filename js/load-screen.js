const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const canvasSize = () => {
    return {
        width: window.innerWidth * window.devicePixelRatio,
        height: window.innerHeight * window.devicePixelRatio
    }
} 

const resizeCanvas = () => {
    const { width, height } = canvasSize()
    canvas.width = width
    canvas.height = height
}

resizeCanvas()

let tick = 0
let rotation = 0
let textTick = 0 // Separate counter for text animation

const createPoint = (i, r) => {
    const angleStep = (Math.PI * 6) / 300
    
    /* Center the spiral */
    const xPosition = canvas.width / 2
    const yPosition = canvas.height / 2
    
    return {
        x: xPosition + Math.cos(i * angleStep) * r,
        y: yPosition + Math.sin(i * angleStep) * r
    }
}

const drawCircle = (tick, point) => {
    /* Hue */
    const h = tick * 4
    
    /* Radius of the circle */
    const radius = tick < 150 ? tick / 2 : 150
    
    ctx.strokeStyle = `hsl(${h})`
	ctx.strokeStyle = `rgba(255, 255, 255, 0.8)`
    
    /* Increment line width, but set a min and max */
    ctx.lineWidth = tick * 0.05 < 0.5 ? 0.5 : tick * 0.05 > 20 ? 20 : tick * 0.05
    
    /* Draw the circle */
    ctx.beginPath()
    ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI)
    ctx.stroke()
}

let isIncrementing = false

const draw = () => {
    window.requestAnimationFrame(draw)
    
    const { width, height } = canvas
    
    /* Position */
    const positionFromCenter = Math.pow(tick, 1.21)
    const point = createPoint(rotation, positionFromCenter)
    const point2 = createPoint(rotation + 50, positionFromCenter)
    const point3 = createPoint(rotation + 75, positionFromCenter)
    const point4 = createPoint(rotation + 25, positionFromCenter)
    const point5 = createPoint(rotation + 12.5, positionFromCenter)
    const point6 = createPoint(rotation + 62.5, positionFromCenter)
    const point7 = createPoint(rotation + 87.5, positionFromCenter)
    const point8 = createPoint(rotation + 37.5, positionFromCenter) 
    
    /* Clear canvas and redraw */
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(0, 0, width, height)
    
    drawCircle(tick, point)
    drawCircle(tick, point2)
    drawCircle(tick, point3)
    drawCircle(tick, point4)
    drawCircle(tick, point5)
    drawCircle(tick, point6)
    drawCircle(tick, point7)
    drawCircle(tick, point8) 
    
    /* Add animated white text in a square pattern */
    const squareSize = 100; // Size of the square
    const speed = 2; // Speed of the text animation
    const phase = (textTick % (4 * squareSize)) / squareSize; // Determine the current phase of the animation

    let textXPosition = canvas.width / 2;
    let textYPosition = canvas.height / 2;
    let textRotation = textTick * 0.05; // Add rotation effect to text
    let textScale = 1 + 0.1 * Math.sin(textTick * 0.030); // Add scaling effect to text

    ctx.save();
    ctx.translate(textXPosition, textYPosition);
    ctx.scale(textScale, textScale);
    ctx.fillStyle = `hsl(${textTick % 360})`;
	  ctx.fillStyle = `rgba(255, 255, 255, 0.8)`
    ctx.font = '30px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Préparation du Site', 0, 0);
    ctx.restore();

    if (tick < 100 && isIncrementing) {
        tick = tick + 0.6
    }
    
    if (tick === 150 && isIncrementing) {
        isIncrementing = false
    }
    
    if (tick === 0 && !isIncrementing) {
        isIncrementing = true
    }
    
    if (tick > 0 && !isIncrementing) {
        tick = tick - 0.5
    }
    
    rotation = rotation + 0.3
    textTick += 2; // Increment textTick to create continuous animation
}

window.addEventListener('resize', () => {
    resizeCanvas()
})

/* Initial canvas background */
ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
ctx.fillRect(0, 0, canvas.width, canvas.height)

draw()

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        window.location.href = 'acceuil.html';
    }, 5000); // Attend 10 secondes
});
