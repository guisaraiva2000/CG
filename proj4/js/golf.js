/*global THREE, requestAnimationFrame, console*/
'use strict';

var scene, renderer, controls;

// time
var time = 0;

// textures
var background = 'textures/skybox.png';
var fieldImg = 'textures/field.png';
var fieldBmp = 'textures/grass-bmap.png';
var ballBmp = 'textures/ball-bump.jpg';
var pauseScreen = 'textures/pause.png';
var skyBack = 'textures/meadow_bk.jpg',
    skyBottom = 'textures/meadow_dn.jpg',
    skyFront = 'textures/meadow_ft.jpg',
    skyLeft = 'textures/meadow_lf.jpg',
    skyRight = 'textures/meadow_rt.jpg',
    skyTop = 'textures/meadow_up.jpg';
var boxMats;

// cameras
var camera;
var viewSize = 100;
var aspectRatio = window.innerWidth / window.innerHeight;
var newScene, newCam;
var pause;

// field
var field;
var fieldSize = 30;
var fieldMats = new Array(2);
var fieldMat;

// ball
var ball;
var ballWidth = 0.1;
var ballMats = new Array(2);
var ballMove = false;
var ballz = 0;
var wasShot = false;
var prevShot = false;

// flag
var flag;
var stick;
var stickMats = new Array(2);
var flagMats = new Array(2);
var stickMat;
var flagMat;

// lights
var dirlight;
var pointlight;

// keys
var wires = false;
var activeMat = 0;
var paused = false;
var changeMaterial = false;
var changeWire = false;
var restart = false;


function createBall(){

  ball = new THREE.Object3D();

  var ballBump = new THREE.TextureLoader().load( ballBmp );

  var geoBall = new THREE.SphereGeometry(ballWidth);

  ballMats[0] = new THREE.MeshBasicMaterial({color:0xffffff, wireframe: wires});
  ballMats[1] = new THREE.MeshPhongMaterial(
    { bumpMap: ballBump,
      specular: new THREE.Color(0xffffff),
      wireframe: wires }
  );

  var mesh = new THREE.Mesh(geoBall, ballMats[activeMat]);
  mesh.name = 'meshBall';

  ball.add(mesh);
  ball.position.y = ballWidth;

  scene.add(ball);
}

function createField() {

  var texture = new THREE.TextureLoader().load( fieldImg );
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(256, 256);

  var bump = new THREE.TextureLoader().load( fieldBmp );
  bump.wrapS = bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(256, 256);

  var geoField = new THREE.PlaneGeometry(fieldSize, fieldSize);
  fieldMats[0] = new THREE.MeshBasicMaterial(
    {map: texture, wireframe: wires, side: THREE.DoubleSide }
  );
  fieldMats[1] = new THREE.MeshPhongMaterial(
    { map: texture, bumpMap: bump, wireframe: wires, side: THREE.DoubleSide }
  );

  fieldMat = fieldMats[activeMat];

  var mesh = new THREE.Mesh(geoField, fieldMat).rotateX(-Math.PI / 2);
  mesh.name = "meshField";

  scene.add(mesh);
}

function createFlag() {

  stick = new THREE.Object3D();
  flag = new THREE.Object3D();

  var geoStick = new THREE.CylinderGeometry(0.02, 0.02, 2);
  var geoFlag = new THREE.BoxGeometry(1, 0.5, 0.01);

  stickMats[0] = new THREE.MeshBasicMaterial({ color: 0x654321, wireframe: wires });
  stickMats[1] = new THREE.MeshPhongMaterial({ color: 0x654321, wireframe: wires });

  flagMats[0] = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: wires });
  flagMats[1] = new THREE.MeshPhongMaterial({ color: 0xff0000, wireframe: wires });

  var meshStick = new THREE.Mesh(geoStick, stickMats[activeMat]);
  var meshFlag = new THREE.Mesh(geoFlag, flagMats[activeMat]);
  meshStick.name = "meshStick";
  meshFlag.name = "meshFlag";

  stick.add(meshStick).position.set(0, 1, -10);
  flag.add(meshFlag).position.set(0.5, 1.75, -10);

  scene.add(stick);
  scene.add(flag);
}

function createDirLight() {
    dirlight = new THREE.DirectionalLight(0xffffff, 1);
    dirlight.position.set(0, 30, 30);
    dirlight.target.position.set( 0, 0, 0 );
    dirlight.target.updateMatrixWorld();

    //const helper = new THREE.DirectionalLightHelper( dirlight, 5 );
    scene.add(dirlight);
    //scene.add(helper);
}

function createPointLight() {
	pointlight = new THREE.PointLight(0xffffff, 3, 20);

	pointlight.position.set(0, 10, 0);

  //const helper = new THREE.PointLightHelper( pointlight, 5 );

	scene.add(pointlight);
  //scene.add(helper);
}

function createSkyBox() {
    var boxGeo = new THREE.BoxGeometry(40, 40, 40);
    boxMats =
    [
      new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load(skyFront), side: THREE.DoubleSide, wireframe: wires}),
      new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load(skyBack), side: THREE.DoubleSide, wireframe: wires}),
      new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load(skyTop), side: THREE.DoubleSide, wireframe: wires}),
      new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load(skyBottom), side: THREE.DoubleSide, wireframe: wires}),
      new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load(skyRight), side: THREE.DoubleSide, wireframe: wires}),
      new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load(skyLeft), side: THREE.DoubleSide, wireframe: wires})
    ];


    var boxMaterial = new THREE.MeshFaceMaterial( boxMats );
    var box = new THREE.Mesh(boxGeo, boxMaterial);

    scene.add( box );
}

function createPauseScreen() {
	var geometry = new THREE.PlaneGeometry(50, 40, 0);

	var texture = new THREE.TextureLoader().load(pauseScreen);

  var material = new THREE.MeshBasicMaterial({map: texture});

  pause = new THREE.Mesh(geometry, material);
  pause.visible = false;
}

function createPauseScene() {
  	newScene = new THREE.Scene();

  	createPauseScreen();

    newCam = new THREE.OrthographicCamera(-aspectRatio * viewSize / 2,
                                         aspectRatio * viewSize / 2,
                                         viewSize / 2, -viewSize / 2,
                                         0.1,
                                         1000);
    newScene.add(newCam);


    newCam.position.y = 20;
    newCam.position.z = 20;
  	newCam.lookAt(newScene.position);

  	newScene.add(pause);
}

function resetKeys() {
    wires = false;
    activeMat = 0;
    paused = false;
    changeMaterial = false;
    changeWire = false;
    ballMove = false;
    ballz = 0;
    wasShot = false;
    prevShot = false;
    time = 0;
}

THREE.Object3D.prototype.clear = function(){
    var children = this.children;
    for(var i = children.length - 1; i >= 0; i--){
        var child = children[i];
        child.clear();
        this.remove(child);
    };
};

function restartScene() {

    paused = !paused;
    pause.visible = !pause.visible;

    scene.clear();

    createBall();
    createField();
    createFlag();
    createDirLight();
    createPointLight();
    createSkyBox();
    createPerspectiveCamera();
    resetKeys();
    controls = new THREE.OrbitControls( camera, renderer.domElement );

    restart = false;
}

function createScene() {

    scene = new THREE.Scene();

    createBall();
    createField();
    createFlag();
    createDirLight();
    createPointLight();
    createSkyBox();

}

function toggleWireframe() {
	wires = !wires;

  ballMats[activeMat].wireframe = wires;
	fieldMats[activeMat].wireframe = wires;
  stickMats[activeMat].wireframe = wires;
  flagMats[activeMat].wireframe = wires;

  for (var i = 0; i < boxMats.length; i++) {
    boxMats[i].wireframe = wires;
  }

  changeWire = false;
}

function toggleMaterial() {

  if(activeMat == 0) {
    activeMat = 1;
  } else {
    activeMat = 0;
  }

  scene.getObjectByName("meshBall").material = ballMats[activeMat];
  scene.getObjectByName("meshFlag").material = flagMats[activeMat];
  scene.getObjectByName("meshStick").material = stickMats[activeMat];
  scene.getObjectByName("meshField").material = fieldMats[activeMat];

  changeMaterial = false;
}

function rotateFlag() {
  var axis = new THREE.Vector3(0, 3, 0).normalize();
  var point = new THREE.Vector3(0, 0, -10);

  flag.position.sub(point);
  flag.position.applyAxisAngle(axis, 0.05);
  flag.position.add(point);

  flag.rotateOnAxis(axis, 0.05);
}

function moveBall() {

    // y = y0 + vt -1/2gt^2
    ball.position.y = ballWidth +  10 * time - 0.5 * 9.8 * time * time;

    // x = x0 + vt
    if(!prevShot) {
        ball.position.z = ballz - 3 * time;
        wasShot = true;
    } else {
        ball.position.z = ballz + 3 * time;
        wasShot = false;
    }

    time += 0.05;

    if(ball.position.y <= ballWidth - 0.01) {

      prevShot = wasShot;
      ballMove = false;
      ball.position.y = ballWidth;
      ballz = ball.position.z;
      time = 0;

    }

}

function createPerspectiveCamera() {
    camera = new THREE.PerspectiveCamera(45,
                                         window.innerWidth / window.innerHeight,
                                         1,
                                         1000);

    camera.lookAt(scene.position);
    camera.position.y = 2;
    camera.position.z = 10;

    controls = new THREE.OrbitControls( camera, renderer.domElement);
  }

function onResize() {
  	renderer.setSize(window.innerWidth, window.innerHeight);

    if (window.innerHeight > 0 && window.innerWidth > 0) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }

    if(paused) {
      var aspect = window.innerWidth / window.innerHeight;
      var change = aspectRatio / aspect;
      var newSize = viewSize * change;
      newCam.left = -aspect * newSize / 2;
      newCam.right = aspect * newSize  / 2;
      newCam.top = newSize / 2;
      newCam.bottom = -newSize / 2;
      newCam.updateProjectionMatrix();
    }
}

function update() {

    if(!paused) {

      rotateFlag();

      if(ballMove)
        moveBall();

      if(changeMaterial)
        toggleMaterial();

      if(changeWire)
        toggleWireframe();

    } else {

      if(restart)
        restartScene();

    }
}

function onKeyDown(e) {
    var key = e.keyCode;
    switch (key) {

      case 80: //p
        pointlight.visible = !pointlight.visible;
        break;
      case 68: //d
        dirlight.visible = !dirlight.visible;
        break;
    	case 73: //i
        changeMaterial = true;
        break;
    	case 87: //w
        changeWire = true;
        break;
    	case 66: //b
        ballMove = !ballMove;
        break;
      case 83: //s
        paused = !paused;
        pause.visible = !pause.visible;
        break;
      case 82: //r
        restart = true;
        break;
    }
}

function init() {

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.autoClear = false;
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    createScene();
    createPauseScene();
    createPerspectiveCamera();

    document.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("resize", onResize);
}

function render() {
  	renderer.clear();
  	renderer.render(scene, camera);
    renderer.render(newScene, newCam);
}

function animate() {

    update();

    render();

    requestAnimationFrame(animate);

    controls.update();
}
