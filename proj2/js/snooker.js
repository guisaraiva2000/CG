/*global THREE, requestAnimationFrame, console*/
'use strict';

var scene, renderer;

var geometry, material, mesh;

var TABLE_WIDTH = 260;
var TABLE_HEIGHT = 130;

var normal = new THREE.Vector3();
var relativeVelocity = new THREE.Vector3();

var clock = new THREE.Clock();

var rot_angle = Math.PI / 94;

//Camera
var camera = new Array(3);
var activeCamera = 0;
var viewSize = 350;
var aspectRatio = window.innerWidth / window.innerHeight;

// Balls
var ballsGroup = new THREE.Group();
var RADIUS = 2.6;
var shot = false;
var activeWhiteBall = -1;

//Sticks
var sticksGroup = new THREE.Group();
var sticks = new Array(6);
var colorBrown = new THREE.Color(0x654321);
var activeStick = -1;
var desactivateStick = -1;
var STICK_LENGTH = 100;
var stickRotation = 0;
var change = false;

//Holes

var holes = [{x: 130 - 5.2, z: 65 - 5.2}, {x: -130 + 5.2, z: 65 - 5.2}, {x: 130 - 5.2, z: -65 + 5.2},
			{x: -130 + 5.2, z: -65 + 5.2}, {x: 0, z: -65 + 5.2}, {x: 0, z: 65 - 5.2}];

class Ball extends THREE.Object3D{
    constructor(x, y, z, color, velx, velz, acc){
       super();
       this.radius = RADIUS;
       this.color = color;
       this.velocity = new THREE.Vector3(velx, 0, velz);
       this.wasShot = false;
       this.acceleration = acc;
       createBall(this, x, y, z, color);
       ballsGroup.add(this);
    }

    setMotion(delta){

        this.position.x += this.velocity.x*delta*this.acceleration;
        this.position.z += this.velocity.z*delta*this.acceleration;

        var axis = new THREE.Vector3(this.velocity.z, 0, this.velocity.x).normalize();
        this.rotateOnAxis(axis, delta*this.acceleration);

        this.acceleration *= 0.99; // retarding the velocityement
    }

    makeFall(delta) {

    	this.position.y -= 2;

	}
    hasBeenShot(){
        this.wasShot = !this.wasShot;
    }

    hasWallCollision(){
        var rangex = TABLE_WIDTH/2 - this.radius - 0.2;
        var rangez = TABLE_HEIGHT/2 - this.radius - 0.2;

        if ( this.position.x < -rangex  || this.position.x > rangex ) {
          this.position.x = THREE.Math.clamp( this.position.x, - rangex, rangex );
          this.velocity.x = -this.velocity.x;
        }

        if ( this.position.z < -rangez || this.position.z > rangez ) {
          this.position.z = THREE.Math.clamp( this.position.z, - rangez, rangez );
          this.velocity.z = -this.velocity.z;
        }
    }

    hasBallCollision(obj){

       // x1 - x2
        normal.copy( this.position ).sub( obj.position );

        // distance between balls
        var distance = normal.length();

        if ( distance < 2 * RADIUS) {

            // re-adjust balls positions
            normal.multiplyScalar( 0.5 * distance - RADIUS );

            this.position.sub( normal );
            obj.position.add( normal );

            normal.normalize();

            // v1 - v2
            relativeVelocity.copy( this.velocity ).sub( obj.velocity );

            // (x1 - x2) * < v1 - v2, x1 - x2> -> dot product
            normal = normal.multiplyScalar( relativeVelocity.dot( normal ) );

            this.velocity.sub( normal );
            obj.velocity.add( normal );

            if(this.acceleration > obj.acceleration) {
              obj.acceleration = this.acceleration;
            } else {
              this.acceleration = obj.acceleration;
            }
        }
    }

    isInHole(delta) {
    	for (var i = 0; i < 6; i++){
    		var x = holes[i].x;
    		var z = holes[i].z;
    		if (this.position.x >= x - RADIUS &&
    			this.position.x <= x + RADIUS &&
    			this.position.z >= z - RADIUS &&
    			this.position.z <= z + RADIUS){

    			this.makeFall(delta);
    		}
    	}
    }
}

class Stick extends THREE.Object3D {
    constructor(material, x, y, z, pos, side, id, rotx, roty, rotz){
        super();
        this.material = material;
        this.length = STICK_LENGTH;
        this.pos = pos;
        this.side = side;
        this.color = 0x654321;
        this.angle = 0;
        this.rotx = rotx;
        this.roty = roty;
        this.rotz = rotz;
        this.active = false;
        createStick(this, x, y, z);
        sticksGroup.add(this);
    }

    rotate(teta) {
        var axis = new THREE.Vector3(0,1,0).normalize();
        var pivot = new THREE.Vector3(this.rotx, this.roty, this.rotz);
        this.position.sub(pivot);

        this.position.applyAxisAngle(axis, teta);
        this.position.add(pivot);

        if (this.pos == 'x'){
            this.rotateZ(-teta);

        } else if (this.pos == 'z'){
            this.rotateX(teta);
        }

    }

    changeState(){
        this.active = !this.active
        if (this.material.color.equals(colorBrown)) {  //change color to white
          this.material.color.set(0xffffff);
        } else {
          this.material.color.set(0x654321);
        }
    }
}

function random(min, max) {
    return Math.random() * (max - min) + min
}

function addTableFloor(obj, x, y, z, angle) {
    geometry = new THREE.CubeGeometry(TABLE_WIDTH, 0, TABLE_HEIGHT);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addTableWall(obj, x, y, z, dimx, dimy, dimz) {
    material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });

    geometry = new THREE.CubeGeometry(dimx, dimy, dimz);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addTableHole(obj, x, y, z) {
    material = new THREE.MeshBasicMaterial({ color: 0x808080, wireframe: false });

    geometry = new THREE.CylinderGeometry(RADIUS * 2, RADIUS * 2, 0, 360);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function createStick(obj, x, y, z, endx, endy, endz) {

    if (obj.side == 'l'){
    	geometry = new THREE.CylinderGeometry(3, 1, obj.length, 8);
    } else if (obj.side == 'r'){
    	geometry = new THREE.CylinderGeometry(1, 3, obj.length, 8);
    }
    mesh = new THREE.Mesh(geometry, obj.material);

    obj.add(mesh);
    obj.position.set(x, y, z);

    if (obj.pos == 'z') {
      obj.rotateZ(Math.PI/2);
    } else if (obj.pos == 'x') {
      obj.rotateX(Math.PI/2);
    }
}

function createBall(obj, x, y, z, color) {

    material = new THREE.MeshBasicMaterial({ color: color, wireframe: false });
    geometry = new THREE.SphereGeometry(RADIUS, 10, 10);
    mesh = new THREE.Mesh(geometry, material);

    obj.add(mesh);
    obj.position.set(x, y, z);

}

function createWhiteBalls() {
    var color = 0xffffff; // white
    new Ball(-127.4, RADIUS, 0, color, 0, 0, 0);
    new Ball(-65, RADIUS, -62.4, color, 0, 0, 0);
    new Ball(65, RADIUS, -62.4, color, 0, 0, 0);
    new Ball(127.4, RADIUS, 0, color, 0, 0, 0);
    new Ball(65, RADIUS, 62.4, color, 0, 0, 0);
    new Ball(-65, RADIUS, 62.4, color, 0, 0, 0);
}

function createRedBalls(){

    var ball, x, z;
    var velocityx, velocityz;

    var color = 0xff0000; //red
    for (var i = 0; i < 20; i++) {
      x = random(-125, 125);
      z = random(-60, 60);
      velocityx = random(-10, 10);
      velocityz = random(-10, 10);
      ball = new Ball(x, RADIUS, z, color, velocityx, velocityz, 2);
    }
}

function createSticks() {
    var color = 0x654321;

    var sticksMaterial = new Array(6);

    for (var i = 0; i < sticks.length; i++) {
      sticksMaterial[i] = new THREE.MeshBasicMaterial({ color: color, wireframe: false });
    }

    sticks[0] = new Stick(sticksMaterial[0], -180, RADIUS,  0, 'z', 'l', 1, -130 + RADIUS, RADIUS, 0);
    sticks[1] = new Stick(sticksMaterial[1], -65, RADIUS, -115, 'x', 'r', 2, -65, RADIUS, -65 + RADIUS);
    sticks[2] = new Stick(sticksMaterial[2], 65, RADIUS, -115, 'x', 'r', 3, 65, RADIUS, -65 + RADIUS);
    sticks[3] = new Stick(sticksMaterial[3], 180, RADIUS,  0, 'z', 'r', 4, 130 - RADIUS, RADIUS, 0);
    sticks[4] = new Stick(sticksMaterial[4], 65, RADIUS, 115, 'x', 'l', 5, 65, RADIUS, 65 - RADIUS);
    sticks[5] = new Stick(sticksMaterial[5], -65, RADIUS, 115, 'x', 'l', 6, -65, RADIUS, 65 - RADIUS);

}

function createTable(x, y, z) {

    var table = new THREE.Object3D();

    material = new THREE.MeshBasicMaterial({ color: 0x008000, wireframe: false });

    addTableFloor(table, 0, 0, 0);
    addTableWall(table, 130, 5, 0, 0, 10, 130);
    addTableWall(table, -130, 5, 0, 0, 10, 130);
    addTableWall(table, 0, 5, 65, 260, 10, 0);
    addTableWall(table, 0, 5, -65, 260, 10, 0);
    for (var i = 0; i<6; i++){
    	addTableHole(table, holes[i].x, 0.1, holes[i].z);
    }

    scene.add(table);

    table.position.x = x;
    table.position.y = y;
    table.position.z = z;
}

function velocityeRedBalls(delta){

    for(var i = 6; i < ballsGroup.children.length; i++){
    	if (ballsGroup.children[i].position.y == RADIUS){
        	ballsGroup.children[i].setMotion(delta);
        }

  	}
}

function velocityeWhiteBall(delta){
    var a = 60;

    for(var i = 0; i < 6; i++){

    	var ball = ballsGroup.children[i];
        if (ball.wasShot) {
            var b = Math.tan(sticks[i].angle) * a;

            if (sticks[i].pos == 'x' && sticks[i].side == 'r') {
                ball.velocity.set(-b, 0, a);

            } else if (sticks[i].pos == 'x') {
                ball.velocity.set(-b, 0, -a);

            } else if (sticks[i].side == 'l') {
                ball.velocity.set(a, 0, b);

            } else {
                ball.velocity.set(-a, 0, -b);
            }
            ball.acceleration = 1;
            ball.hasBeenShot();
            //var axesHelper = new THREE.AxisHelper(10);
            //ballsGroup.children[i].add(axesHelper);
            //ballsGroup.children[i].add(camera[2]);
       }
       ball.setMotion(delta);
    }
}

function shootBalls() {
    for(var i = 0; i < 6; i++){
        if (sticks[i].active) {
            ballsGroup.children[i].hasBeenShot();
						//camera[2].position.copy(sticks[i].position);
			activeWhiteBall = i;

			//move camera
			if(ballsGroup.children[activeWhiteBall].position.x > 0) {
				camera[2].position.x = ballsGroup.children[activeWhiteBall].position.x + 4*RADIUS;
			} else {
				camera[2].position.x = ballsGroup.children[activeWhiteBall].position.x - 4*RADIUS;
			}

			if(ballsGroup.children[activeWhiteBall].position.z > 0) {
				camera[2].position.z = ballsGroup.children[activeWhiteBall].position.z + 4*RADIUS;
			} else {
				camera[2].position.z = ballsGroup.children[activeWhiteBall].position.z - 4*RADIUS;
			}

            sticks[i].changeState();
        }
    }
}

function rotateStick(sign) {
    var stick = sticks[activeStick];
    if (stick.pos == 'z'){
        sign = -sign;
    }
    if (stick.active && stick.angle + sign * rot_angle <=  Math.PI / 3 && stick.angle + sign * rot_angle >= -Math.PI / 3){
        stick.angle = stick.angle + sign * rot_angle;
        if (stick.pos == 'x' && stick.side == 'l') {
            stick.rotate(rot_angle * sign);
        } else {
            stick.rotate(-rot_angle * sign);
        }
    }
}

function checkCollision(){

	for ( var i = 0; i < ballsGroup.children.length; i ++ ) {
        if(ballsGroup.children[i].velocity.x != 0 || ballsGroup.children[i].velocity.z != 0){ // avoid collide with stopped whites
            ballsGroup.children[i].hasWallCollision();
      	    for ( var j = i + 1; j < ballsGroup.children.length; j ++ ) {
                //if(ballsGroup.children[j].velocity.x != 0 || ballsGroup.children[j].velocity.z != 0){ // avoid collide with stopped whites
                    ballsGroup.children[i].hasBallCollision(ballsGroup.children[j]);
                //}
      	    }
        }
	}
}

function checkIfIsInHole(delta){
	for ( var i = 0; i < ballsGroup.children.length; i++ ) {
		ballsGroup.children[i].isInHole(delta);
	}

}

function update() {

    var delta = clock.getDelta();
    checkCollision();
    checkIfIsInHole(delta);
    velocityeRedBalls(delta);

    if (stickRotation != 0) {
        rotateStick(stickRotation);
    }
    if (change) {				//activate and desactivate sticks
        if (activeStick != -1) {
            sticks[activeStick].changeState();
        }
        if (desactivateStick != -1 && sticks[desactivateStick].active) {
            sticks[desactivateStick].changeState();
        }
        change = false;
    }

    if (shot) {
        shootBalls();
        shot = false;
    }

    velocityeWhiteBall(delta);

    if (activeWhiteBall != -1) {
      camera[2].lookAt(ballsGroup.children[activeWhiteBall].position);
    }

}

function createScene() {

    scene = new THREE.Scene();

    scene.add(new THREE.AxisHelper(10));

    createTable(0, 0, 0);
    createWhiteBalls();
    createRedBalls();
    createSticks();

    scene.add(ballsGroup);
    scene.add(sticksGroup);
}

function createTopCamera() {

    camera[0] = new THREE.OrthographicCamera(-aspectRatio * viewSize / 2,
                                             aspectRatio * viewSize / 2,
                                             viewSize / 2, -viewSize / 2,
                                             0.1,
                                             1000);

    camera[0].lookAt(scene.position);
    camera[0].position.y = 50;
    camera[0].rotateX(-Math.PI /2);
}

function createPerspectiveCamera() {
    camera[1] = new THREE.PerspectiveCamera(45,
                                         window.innerWidth / window.innerHeight,
                                         1,
                                         1000);

    camera[1].lookAt(scene.position);
    camera[1].position.y = 100;
    camera[1].position.z = 500;
}

function createLateralCamera() {

    camera[2] = new THREE.PerspectiveCamera(45,
                                         window.innerWidth / window.innerHeight,
                                         1,
                                         1000);

    camera[2].lookAt( new THREE.Vector3(0, 0, 0) );
    camera[2].position.y = 30;
    camera[2].position.z = 250;
}

function onResize() {
  	renderer.setSize(window.innerWidth, window.innerHeight);

    //OrthographicCamera
    resizeOrtCamera();

  	//PerspectiveCameras
  	resizePerspCamera(1);
  	resizePerspCamera(2);
}

function resizeOrtCamera() {
    var aspect = window.innerWidth / window.innerHeight;
    var change = aspectRatio / aspect;
    var newSize = viewSize * change;
    camera[0].left = -aspect * newSize / 2;
    camera[0].right = aspect * newSize  / 2;
    camera[0].top = newSize / 2;
    camera[0].bottom = -newSize / 2;
    camera[0].updateProjectionMatrix();
}

function resizePerspCamera(n) {
    if (window.innerHeight > 0 && window.innerWidth > 0) {
        camera[n].aspect = window.innerWidth / window.innerHeight;
        camera[n].updateProjectionMatrix();
    }
}

function onKeyDown(e) {
    var key = e.keyCode;
    switch (key) {

        case 32: //space
          shot = true;
           break;
        case 37: //left
        if (activeStick != -1){
        	stickRotation = -1;
    	}
        break;
        case 39: //right
        if (activeStick != -1){
        	stickRotation = 1;
    	}
        break;
        case 52: // 4 to 9
        case 53:
        case 54:
        case 55:
        case 56:
        case 57:
        var i = key-52;
        change = true;
        if (activeStick != -1 && sticks[activeStick].active && i!= activeStick){
            desactivateStick = activeStick;
            activeStick = i;
        } else if (i == activeStick) {
            desactivateStick = i;
            activeStick = -1;
        } else {
        	desactivateStick = -1;
            activeStick = i;
        }
        break;
        case 49: // 1 to 3
        activeCamera = 0;
        break;
        case 50:
        activeCamera = 1;
        break;
        case 51:
        activeCamera = 2;
        break;
    }
}

function onKeyUp(e) {
    var key = e.keyCode;
    switch (key) {
        case 37: //left
        case 39: //right
        stickRotation = 0;
        break;
    }
}


function createCameras(){

    createPerspectiveCamera();
    createTopCamera();
    createLateralCamera();

}

function init() {

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    createScene();
    createCameras();

    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("keyup", onKeyUp, true);
    window.addEventListener("resize", onResize);


}

function animate() {

    update();

    renderer.render(scene, camera[activeCamera]);

    requestAnimationFrame(animate);
}
