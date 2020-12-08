/*global THREE, requestAnimationFrame, console*/
'use strict';

var scene, renderer;

var geometry, material, mesh;

var ceiling;

var mobile, mobile1, mobile2, mobile3;

var limit = 50;

var keyMap = [];

var moveVec = new THREE.Vector3(0, 0, 0);

var x3, y3=7.35, z3;

var clock = new THREE.Clock();
var mov_speed = 5; //units a second
var rot_speed = 1;
var delta;

//Camera
var camera = new Array(3);
var activeCamera = 0;


/*function createCeiling() {

    material = new THREE.MeshBasicMaterial( {color: 0x808080, side: THREE.DoubleSide, wireframe: true} );
    geometry = new THREE.PlaneGeometry(100, 100);
    ceiling = new THREE.Mesh(geometry, material);

    ceiling.rotation.x = (- Math.PI / 2);

    ceiling.position.set(0, 30, 0); // 3 metros do chao

    scene.add(ceiling);
}*/

function createWire(obj, x, y, z, length, angle) {

    var objectWire = new THREE.Object3D();

    geometry = new THREE.CylinderGeometry(0.05, 0.05, length, 8);
    mesh = new THREE.Mesh(geometry, material);

    objectWire.add(mesh);
    objectWire.position.set(x, y, z);
    objectWire.rotateZ(angle);

    obj.add(objectWire);
}

function createObject(obj, x, y, z, angle, radius, width){

  	var object = new THREE.Object3D();

  	if (width == 0) {
  		geometry = new THREE.CylinderGeometry(radius, radius, 0.1, 35);
  	} else if (radius == 0) {
  		geometry = new THREE.BoxGeometry(width, width, 0.1);
  	}
      mesh = new THREE.Mesh(geometry, material);

      object.add(mesh);
      object.position.set(x, y, z);

      if (width == 0) {
      	object.rotateX(angle);
      }
      else if (radius == 0) {
      	object.rotateZ(angle);
      }

      obj.add(object);
}

function createMobile(){

    mobile = new THREE.Object3D();
    mobile1 = new THREE.Object3D();
    mobile2 = new THREE.Object3D();
    mobile3 = new THREE.Object3D();

    material = new THREE.MeshBasicMaterial({ color: 0x808080	, wireframe: true });

    // first part of mobile
    createWire(mobile1, 0, 25, 0, 10, 0);
    createWire(mobile1, 0.71, 24.285, 0, 2, -Math.PI / 4);
    createWire(mobile1, 0.71, 20.6971, 0, 2, -Math.PI / 4);//
    createObject(mobile1, 1.7156 , 21.7042, 0, -Math.PI / 4, 0, 0.7 );
    createWire(mobile1, 2.2, 24.99, 0, 1.5, Math.PI / 2);//
    createObject(mobile1, 3.5, 24.99, 0, Math.PI / 2, 0.5, 0);

    // second part of mobile
    createWire(mobile2, -3.48, 21.99, 0, 8, Math.PI / 3);
    createObject(mobile2, -7.56, 24.3305, 0, Math.PI / 3, 0, 1.5);
    createWire(mobile2, -0.75, 18.7, 0, 3, -Math.PI / 6);
    createWire(mobile2, -5.7, 18.7, 0, 9, Math.PI / 2.5);
    createWire(mobile2, -1, 16, 0, 3, Math.PI / 9);
    createWire(mobile2, -11, 21.1, 0, 3, Math.PI / 4);
    createObject(mobile2, -13.1213, 23.22131, 0, Math.PI / 2, 1.5, 0);
    createWire(mobile2, -4.80, 16, 0, 9, Math.PI / 2.5);
    createObject(mobile2, -9.58, 17.5905, 0, Math.PI / 2.5, 0, 1);
    createWire(mobile2, 0.45, 13, 0, 4, Math.PI / 6);
    createWire(mobile2, -0.508, 11.6749, 0, 4, Math.PI / 2.3);
    createWire(mobile2, 2.7, 13.433, 0, 5, -Math.PI / 6);
    createObject(mobile2, 4.75, 16.865, 0, -Math.PI / 2, 1.5, 0);
    createWire(mobile2, -3.4206, 11.1272, 0, 2.7, -Math.PI / 4);
    createObject(mobile2, -5.0456, 9.3022, 0, -Math.PI / 2, 1, 0);
    createWire(mobile2, 2.4, 9.305, 0, 4.347, Math.PI * 0.14398);

    // third part of mobile
    createWire(mobile3, 1.6906, 1.021, 0, 4, -Math.PI / 3);
    createObject(mobile3, 4.0855, 2.489, 0, -Math.PI / 2, 0.8, 0);
    createWire(mobile3, -0.845, -1.755, 0, 4, -Math.PI / 7);
    createWire(mobile3, 0.03, -2.575 , 0, 4, -Math.PI / 3);
    createObject(mobile3, 2.212, -1.325, 0, -Math.PI / 3, 0, 1);
    createWire(mobile3, -3.27, -4.81, 0, 4, -Math.PI / 3.5);
    createObject(mobile3, -5.23365, -5.057, 0, -Math.PI / 2, 1, 0);
    createWire(mobile3, -2.93, -5.45, 0, 4, -Math.PI / 2.5);
    createObject(mobile3, -0.578, -4.632, 0, -Math.PI / 2, 0.5, 0);

    mobile3.position.set(3.35, 7.35, 0); // ponto do vertice que une o mobile2 com o mobile3

    mobile.add(mobile1);
    mobile.add(mobile2);
    mobile.add(mobile3);

    scene.add(mobile);

}

function createScene() {

    scene = new THREE.Scene();

    scene.add(new THREE.AxisHelper(10));

    //createCeiling();
    createMobile();

}

function createFrontalCamera() {

    /*camera[0] = new THREE.PerspectiveCamera(45,
                                         window.innerWidth / window.innerHeight,
                                         1,
                                         1000);*/
    camera[0] = new THREE.OrthographicCamera(-50, 50, 30, -30, 0.1, 10000);

    camera[0].lookAt(scene.position);
    camera[0].position.y = 18;
    camera[0].position.z = 70;

}

function createTopCamera() {

    camera[1] = new THREE.OrthographicCamera(-50, 50, 30, -30, 0.1, 10000);

    camera[1].lookAt(scene.position);
    camera[1].position.y = 50;
    camera[1].rotateX(-Math.PI /2);

}

function createLateralCamera() {

    camera[2] = new THREE.OrthographicCamera(-50, 50, 30, -30, 0.1, 10000);

    camera[2].lookAt(scene.position);
    camera[2].position.x = 70;
    camera[2].position.y = 18;
    camera[2].rotateY(Math.PI /2);

}

function rotate3(teta){ // rodar o mobile3 nos eixo do mobile

    var axis = new THREE.Vector3(0, y3, 0).normalize();
    var point = new THREE.Vector3(x3 + mobile.position.x, 0, z3 + mobile.position.z);

    mobile3.position.sub(point);
    mobile3.position.applyAxisAngle(axis, teta);
    mobile3.position.add(point);

    mobile3.rotateOnAxis(axis, teta);

}

function onDocumentKeyDown(event){
    var keyCode = event.keyCode;
    keyMap[keyCode] = true;

    if(keyMap[52]) { //4
      material.wireframe = !material.wireframe;
    }
}

function onDocumentKeyUp(event){
    var keyCode = event.keyCode;
    keyMap[keyCode] = false;
}

function update(){

    delta = clock.getDelta();
    var rotation_value = rot_speed * delta;
    var movement_value = mov_speed * delta;

    if (keyMap[81]) { //W
      mobile1.rotateY(-rotation_value);
      mobile2.rotateY(-rotation_value);
      rotate3(-rotation_value);
    }
    if (keyMap[87]) { //Q
      mobile1.rotateY(rotation_value);
      mobile2.rotateY(rotation_value);
      rotate3(rotation_value);
    }
    if (keyMap[65]) { //A
      mobile2.rotateY(-rotation_value);
      rotate3(-rotation_value);
    }
    if (keyMap[68]) { //D
      mobile2.rotateY(rotation_value);
      rotate3(rotation_value);
    }
    if (keyMap[90]) { //Z
      mobile3.rotateY(-rotation_value);
    }
    if (keyMap[67]) { //C
      mobile3.rotateY(rotation_value);
    }
    if (keyMap[37]) {//left
      if ( mobile.position.x > -limit ){
        moveVec.x = -1;
      }
    }
    if (keyMap[38]) {//up
      if ( mobile.position.z > -limit ){
        moveVec.z = -1;
      }
    }
    if (keyMap[39]) {//right
      if ( mobile.position.x < limit ){
        moveVec.x = 1;
      }
    }
    if (keyMap[40]) {//down
      if ( mobile.position.z < limit ){
        moveVec.z = 1;
      }
    }
    if(keyMap[49]) { //1
        activeCamera = 0;
    }
    if(keyMap[50]) { //2
        activeCamera = 1;
    }
    if(keyMap[51]) { //3
        activeCamera = 2;
    }

    moveVec.normalize(); // constant diagonal speed
    mobile.translateOnAxis(moveVec, movement_value);

    if(moveVec.x != 0){ // reset moveVec
      moveVec.x = 0;
    } else if(moveVec.z != 0){
      moveVec.z = 0;
    }
}

function createCameras(){

    createFrontalCamera();
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

    document.addEventListener("keydown", onDocumentKeyDown, true);
    document.addEventListener("keyup", onDocumentKeyUp, true);

}

function animate() {

    update();

    renderer.render(scene, camera[activeCamera]);

    requestAnimationFrame( animate );

}
