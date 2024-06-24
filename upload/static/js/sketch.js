let timeline = [];
let startTime;
let currentTime;
let duration = 20000; // Duration of the timeline in milliseconds (20 seconds)
let currentIndex = -1;

let s1, s2;
let gravity = 9.0;
let mass = 2.0;

function setup() {
	let canvas = createCanvas(800, 600);
	canvas.parent('sketch-container');
	startTime = millis();

	// Initialize the timeline with different canvases and their start times
	timeline.push({ start: 0, setupFunc: setupCanvas1, drawFunc: drawCanvas1, isSetup: false });
	timeline.push({ start: 5000, setupFunc: setupCanvas2, drawFunc: drawCanvas2, isSetup: false });
	timeline.push({ start: 10000, setupFunc: setupCanvas3, drawFunc: drawCanvas3, isSetup: false });
	timeline.push({ start: 15000, setupFunc: setupCanvas4, drawFunc: drawCanvas4, isSetup: false });
}

function draw() {
	background(255);
	currentTime = millis() - startTime;

	// Loop the timeline
	if (currentTime > duration) {
		startTime = millis();
		currentTime = 0;
		// Reset isSetup for all timelines
		for (let i = 0; i < timeline.length; i++) {
			timeline[i].isSetup = false;
		}
	}

	// Find the correct canvas to draw based on the current time
	for (let i = 0; i < timeline.length; i++) {
		let nextStart = i < timeline.length - 1 ? timeline[i + 1].start : duration;
		if (currentTime >= timeline[i].start && currentTime < nextStart) {
			if (currentIndex !== i) {
				if (!timeline[i].isSetup) {
					timeline[i].setupFunc();
					timeline[i].isSetup = true;
				}
				currentIndex = i;
			}
			timeline[i].drawFunc();
			break;
		}
	}

	// Draw the timeline
	drawTimeline();
}

// Canvas 1 ==========================
let x = [],
	y = [],
	segNum = 20,
	segLength = 18;

for (let i = 0; i < segNum; i++) {
	x[i] = 0;
	y[i] = 0;
}

function setupCanvas1() {
	// Setup for Canvas 1
	// Add any initialization code for Canvas 1 here
	strokeWeight(9);
	stroke(255, 100);
}

function drawCanvas1() {
	background(0);
	dragSegment(0, mouseX, mouseY);
	for (let i = 0; i < x.length - 1; i++) {
		dragSegment(i + 1, x[i], y[i]);
	}
}

function dragSegment(i, xin, yin) {
	const dx = xin - x[i];
	const dy = yin - y[i];
	const angle = atan2(dy, dx);
	x[i] = xin - cos(angle) * segLength;
	y[i] = yin - sin(angle) * segLength;
	segment(x[i], y[i], angle);
}

function segment(x, y, a) {
	push();
	translate(x, y);
	rotate(a);
	line(0, 0, segLength, 0);
	pop();
}

// ==============================================

function setupCanvas2() {
	// Setup for Canvas 2
	// Add any initialization code for Canvas 2 here
}

function drawCanvas2() {
	fill(0, 255, 0);
	rect(width / 2 - 50, height / 2 - 50, 100, 100);
}

function setupCanvas3() {
	// Setup for Canvas 3
	// Add any initialization code for Canvas 3 here
	// Inputs: x, y, mass, gravity
	s1 = new Spring2D(0.0, width / 2, mass, gravity);
	s2 = new Spring2D(0.0, width / 2, mass, gravity);
}

function drawCanvas3() {
	background(0);
	s1.update(mouseX, mouseY);
	s1.display(mouseX, mouseY);
	s2.update(s1.x, s1.y);
	s2.display(s1.x, s1.y);
	fill(255, 126);
}

function Spring2D(xpos, ypos, m, g) {
	this.x = xpos; // The x- and y-coordinates
	this.y = ypos;
	this.vx = 0; // The x- and y-axis velocities
	this.vy = 0;
	this.mass = m;
	this.gravity = g;
	this.radius = 30;
	this.stiffness = 0.2;
	this.damping = 0.7;

	this.update = function (targetX, targetY) {
		let forceX = (targetX - this.x) * this.stiffness;
		let ax = forceX / this.mass;
		this.vx = this.damping * (this.vx + ax);
		this.x += this.vx;
		let forceY = (targetY - this.y) * this.stiffness;
		forceY += this.gravity;
		let ay = forceY / this.mass;
		this.vy = this.damping * (this.vy + ay);
		this.y += this.vy;
	};

	this.display = function (nx, ny) {
		noStroke();
		ellipse(this.x, this.y, this.radius * 2, this.radius * 2);
		stroke(255);
		line(this.x, this.y, nx, ny);
	};
}

function setupCanvas4() {
	// Setup for Canvas 4
	// Add any initialization code for Canvas 4 here
}

function drawCanvas4() {
	fill(255, 255, 0);
	line(0, 0, width, height);
	line(width, 0, 0, height);
}

function drawTimeline() {
	stroke(0);
	fill(200);
	rect(0, height - 50, width, 50);

	// Draw the progress bar
	let progress = map(currentTime, 0, duration, 0, width);
	fill(0, 0, 255);
	rect(0, height - 50, progress, 50);

	// Draw the markers for each segment
	for (let i = 0; i < timeline.length; i++) {
		let markerPos = map(timeline[i].start, 0, duration, 0, width);
		stroke(255, 0, 0);
		line(markerPos, height - 50, markerPos, height);
	}
}
