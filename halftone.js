const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// options
const dotSpacing = 15;
const dotMinRadius = -15;
const dotMaxRadius = 15;
const animationSpeed = 20 * 0.00001;
const nodes = 2;
const color = '#ff005b';
const images = ['gradient.jpg', 'gradient2.jpg']; // Add your image paths here
let imageIndex = 0;

// gradient mode
let isGradientMode = false;
let gradientTransition = 0;
const transitionSpeed = 0.002;
let gradientImage = null;
let gradientCanvas = null;
let gradientCtx = null;

// image transition
let isImageTransitioning = false;
let imageTransition = 0;
let oldGradientCanvas = null;
let oldGradientCtx = null;

function resizeCanvas() {
	canvas.width = window.innerWidth + 200;
	canvas.height = window.innerHeight + 200;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Load gradient image
function setupGradient() {
    gradientImage = new Image();
    gradientImage.onload = function() {
        gradientCanvas = document.createElement('canvas');
        gradientCtx = gradientCanvas.getContext('2d');
        updateGradientCanvas();
    };
    loadCurrentImage();
}

function loadCurrentImage() {
    if (images.length > 0) {
        gradientImage.src = images[imageIndex];
    }
}

function nextImage() {
    if (isImageTransitioning) return; // Prevent multiple transitions
    
    // Store current gradient canvas as old
    if (gradientCanvas && gradientCtx) {
        oldGradientCanvas = document.createElement('canvas');
        oldGradientCtx = oldGradientCanvas.getContext('2d');
        oldGradientCanvas.width = gradientCanvas.width;
        oldGradientCanvas.height = gradientCanvas.height;
        oldGradientCtx.drawImage(gradientCanvas, 0, 0);
    }
    
    // Start transition
    isImageTransitioning = true;
    imageTransition = 0;
    
    // Load next image
    imageIndex = (imageIndex + 1) % images.length;
    loadCurrentImage();
}

function updateGradientCanvas() {
    if (!gradientImage || !gradientCanvas) return;
    gradientCanvas.width = canvas.width;
    gradientCanvas.height = canvas.height;
    gradientCtx.drawImage(gradientImage, 0, 0, canvas.width, canvas.height);
}

setupGradient();

// Keyboard event listener
window.addEventListener('keydown', function(event) {
    if (event.key.toLowerCase() === 'g') {
        isGradientMode = !isGradientMode;
    } else if (event.key.toLowerCase() === 'n') {
        nextImage();
    }
    if (event.key.toLowerCase() === 'b') {
        canvas.classList.toggle('blur');
    }
});

// Update gradient canvas on resize
window.addEventListener('resize', function() {
    resizeCanvas();
    updateGradientCanvas();
});

function create3DPerlinNoise() {
    // Implementation of 3D Perlin Noise
    // Source: https://mrl.nyu.edu/~perlin/noise/
    const permutation = [...Array(512)].map((_, i) => i < 256 ? i : i - 256);
    for (let i = 0; i < 256; i++) {
        const j = Math.floor(Math.random() * 256);
        [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
    }
    const p = [...permutation, ...permutation];

    function fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    function lerp(t, a, b) {
        return a + t * (b - a);
    }

    function grad(hash, x, y, z) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    return function noise(x, y, z) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        const u = fade(x);
        const v = fade(y);
        const w = fade(z);

        const A = p[X] + Y;
        const AA = p[A] + Z;
        const AB = p[A + 1] + Z;
        const B = p[X + 1] + Y;
        const BA = p[B] + Z;
        const BB = p[B + 1] + Z;

        return lerp(w, lerp(v, lerp(u, grad(p[AA], x, y, z),
            grad(p[BA], x - 1, y, z)),
            lerp(u, grad(p[AB], x, y - 1, z),
                grad(p[BB], x - 1, y - 1, z))),
            lerp(v, lerp(u, grad(p[AA + 1], x, y, z - 1),
                grad(p[BA + 1], x - 1, y, z - 1)),
                lerp(u, grad(p[AB + 1], x, y - 1, z - 1),
                    grad(p[BB + 1], x - 1, y - 1, z - 1))));
    };
}

const noise3D = create3DPerlinNoise();
let animationTime = 0;

// create a grid of dots
function drawDots(deltaTime) {
	animationTime += deltaTime * animationSpeed;
	
	// Update gradient transition
	const targetTransition = isGradientMode ? 1 : 0;
	const transitionDelta = deltaTime * transitionSpeed;
	if (gradientTransition < targetTransition) {
		gradientTransition = Math.min(targetTransition, gradientTransition + transitionDelta);
	} else if (gradientTransition > targetTransition) {
		gradientTransition = Math.max(targetTransition, gradientTransition - transitionDelta);
	}
	
	// Update image transition
	if (isImageTransitioning) {
		imageTransition += deltaTime * transitionSpeed; // Faster image transitions
		if (imageTransition >= 1) {
			imageTransition = 1;
			isImageTransitioning = false;
			oldGradientCanvas = null;
			oldGradientCtx = null;
		}
	}
	
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	const noiseScale = nodes / Math.max(canvas.width, canvas.height);
	
	for (let y = dotSpacing; y < canvas.height; y += dotSpacing) {
		for (let x = dotSpacing; x < canvas.width; x += dotSpacing) {
			// Get noise value
			const noiseZ = noise3D(x * noiseScale, y * noiseScale, animationTime);
			const noiseRadius = dotMinRadius + (noiseZ + 1) * 0.5 * (dotMaxRadius - dotMinRadius);
			
			// Get gradient values (current and old if transitioning)
			let gradientRadius = dotMinRadius;
			let oldGradientRadius = dotMinRadius;
			
			if (gradientCanvas && gradientCtx) {
				const imageData = gradientCtx.getImageData(x, y, 1, 1).data;
				const brightness = (imageData[0] + imageData[1] + imageData[2]) / (3 * 255);
				gradientRadius = dotMinRadius + brightness * (dotMaxRadius - dotMinRadius);
			}
			
			if (isImageTransitioning && oldGradientCanvas && oldGradientCtx) {
				const oldImageData = oldGradientCtx.getImageData(x, y, 1, 1).data;
				const oldBrightness = (oldImageData[0] + oldImageData[1] + oldImageData[2]) / (3 * 255);
				oldGradientRadius = dotMinRadius + oldBrightness * (dotMaxRadius - dotMinRadius);
				
				// Interpolate between old and new gradient
				gradientRadius = oldGradientRadius * (1 - imageTransition) + gradientRadius * imageTransition;
			}
			
			// Interpolate between noise and gradient
			const radius = noiseRadius * (1 - gradientTransition) + gradientRadius * gradientTransition;
			drawDot(x, y, radius);
		}
	}
}

let lastTime = 0;
function animate(currentTime = 0) {
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    
    drawDots(deltaTime);
    requestAnimationFrame(animate);
}
animate();

function drawDot(x, y, radius) {
    if (radius < 0) radius = 0;
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, Math.PI * 2);
	ctx.fillStyle = color;
	ctx.fill();
}
