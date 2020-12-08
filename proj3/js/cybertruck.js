/global THREE, requestAnimationFrame, console/

'use strict';
var scene, renderer;

// Materials
var activeMaterial = 0;
var prevMaterial = 0;

// Objects
var palanque;
var floor;
var cybertruck;

// Camera
var camera = new Array(2);
var activeCamera = 0;
var viewSize = 100;
var aspectRatio = window.innerWidth / window.innerHeight;
var camControls;

// Lights
var directionalLight;
var spotLights = new Array(3);

// Keys
var keyIlumination = false;
var keyMaterial = false;
var keyRotation = 0;
var keySpotlight = -1;

class Cybertruck {
		constructor() {
			this.width = 20.27;
			this.height = 19.05;
			this.depth = 58.85;
			this.object = new THREE.Group();

			// BODY
			let bodyVer = [
					[-9.122,4.953,-29.425],[9.122,4.953,-29.425],[-9.122,-1.905,-28.248],[9.122,-1.905,-28.248], 	// traseira
					[-6.608,9.525,4.708],[6.608,9.525,4.708],																											// cima
					[-9.122,-1.905,-22.363],[9.122,-1.905,-22.363],[-9.122,1.143,-21.186],[9.122,1.143,-21.186], 	//------------------
					[-9.122,1.143,-14.124],[9.122,1.143,-14.124],[-9.122,-2.8575,-10.593],[9.122,-2.8575,-10.593],//  meio
					[-9.122,-3.239,15.007],[9.122,-3.239,15.007],[-9.122,1.143,17.832],[9.122,1.143,17.832],			//
					[-9.122,1.143,24.717],[9.122,1.143,24.717],																										//------------------
					[-9.122,1.524,27.66],[9.122,1.524,27.66],[-6.689,0.857,29.425],[6.689,0.857,29.425],					// fronteira de cima
					[-9.122,-2.477,27.071],[9.122,-2.477,27.071],[-6.953,-2.477,28.712],[6.953,-2.477,28.712],		// fronteira de baixo
					[-8.311,-4.001,-10.181],[8.311,-4.001,-10.181],[-8.311,-4.382,14.713],[8.311,-4.382,14.713],	// abas de baixo
					[-8.564,5.144,-8.239],[8.564,5.144,-8.239],[-7.682,7.430,-7.651],[7.682,7.430,-7.651],				// janelas
					[-6.831,8.954,4.708],[6.831,8.954,4.708],[-8.615,3.239,21.186],[8.615,3.239,21.186]
				],
				bodyFaces = [
					[1,5,35],[19,17,1],[32,0,20],[12,13,29],[28,30,14],[17,16,14],[15,31,29],
					[25,24,18],[11,17,15],[2,3,7],[25,21,23],[34,32,33],[10,0,8],[21,25,19],
					[33,32,38],[0,34,4],[39,38,36],[38,39,33],[24,26,22],[29,28,12],[25,27,26],
					[21,19,1],[0,1,3],[31,30,28],[5,1,0],[19,18,16],[15,14,30],[4,36,20],
					[21,20,22],[26,27,23],[5,37,35],[6,7,9],[21,39,37],[8,0,2],[33,21,1],[0,32,34],
					[3,2,0],[8,9,11],[16,10,14],[14,12,28],[11,10,8],[33,35,34],[22,23,21],
					[22,20,24],[20,21,5],[16,0,10],[0,4,5],[10,11,13],[30,31,15],[20,36,38],
					[34,35,37],[12,14,10],[7,6,2],[18,19,25],[9,8,6],[38,32,20],[39,21,33],
					[14,15,17],[7,3,1],[20,18,24],[5,21,37],[36,37,39],[23,27,25],[15,13,11],
					[13,12,10],[20,0,18],[1,9,7],[37,36,34],[29,13,15],[17,11,1],[23,22,26],
					[11,9,1],[24,25,26],[4,34,36],[1,35,33],[18,0,16],[5,4,20],[16,17,19],
					[2,6,8],[28,29,31]
				];

			this.createMesh(bodyVer,bodyFaces,0xbac3c8);

			// TOP WINDOW
			let topWinVer = [
							[-7.52,7.906,-7.651],[7.52,7.906,-7.651],[-6.608,9.525,4.708],
							[6.608,9.525,4.708],[-8.402,3.81,21.186],[8.402,3.81,21.186]
				],
				topWinFaces = [[3,2,4],[4,5,3],[1,0,2],[2,3,1]];

			this.createMesh(topWinVer,topWinFaces,0x101010);

			// SIDE WINDOWS
			let sideWindowsVerticesArr = [
						[-8.108,5.144,-8.239],[8.108,5.144,-8.239],[-7.115,7.430,-7.651],
						[7.115,7.430,-7.651],[-6.385,8.954,4.708],[6.385,8.954,4.708],
						[-8.716,3.239,21.186],[8.716,3.239,21.186]
				],
				sideWindowsFacesArr = [
						[1,0,2],[2,4,5],[4,6,7],[7,5,4],[4,2,0],[2,3,1],[0,6,4],[5,3,2],[5,7,1],
						[0,1,7],[7,6,0],[1,3,5]
				];

			this.createMesh(sideWindowsVerticesArr,sideWindowsFacesArr,0x101010);


			// LIGHTS
			let frontLightVer = [
							[-9.122,1.429,27.665],[-6.689,0.762,29.419],[6.689,0.762,29.419],
							[9.122,1.429,27.665],[-9.122,0.819,27.571225],[-6.72,0.381,29.337],
							[6.72,0.381,29.337],[9.122,0.819,27.571]
					],
					frontLightFaces = [
							[2,1,5],[5,6,2],[1,0,4],[4,5,1],[3,2,6],[6,7,3]
					];

			this.createMesh(frontLightVer,frontLightFaces,0xffffff);


			let backLightVer = [
							[-9.122,4.953,-29.425],[9.122,4.953,-29.425],
							[-9.122,4.191,-29.36],[9.122,4.191,-29.36]
					],
					backLightFaces = [[0,1,3],[3,2,0]];

			this.createMesh(backLightVer,backLightFaces,0xcc0000);

			// BOTTOM SUPPORTER
			let supGeo = new THREE.BoxGeometry(this.width-this.width*0.28,this.height*0.31,this.depth*0.98),
					supMat = new THREE.MeshBasicMaterial({color: 0xbac3c8});

			this.supporter = new THREE.Mesh(supGeo, supMat);
			this.supporter.position.set(0, this.height*-0.095, 0);
			this.object.add(this.supporter);

			// WHEELS
			this.createWheels(this.width*0.43,this.height*-0.27,this.depth*0.36,-Math.PI/2);
			this.createWheels(this.width*-0.43,this.height*-0.27,this.depth*0.36,Math.PI/2);
			this.createWheels(this.width*0.43,this.height*-0.27,this.depth*-0.3,-Math.PI/2);
			this.createWheels(this.width*-0.43,this.height*-0.27,this.depth*-0.3,Math.PI/2);
		}

	 	createWheels(x, y, z, angle){

			let wheelGeo = new THREE.CylinderGeometry(this.height*0.23,this.height*0.23,this.width*0.14,32),
				wheelMat = new THREE.MeshBasicMaterial({color: 0x1c1c1c}),

				wheel = new THREE.Mesh(wheelGeo,wheelMat);
				wheel.position.set(x, y, z);
				wheel.rotateZ(angle);

				this.object.add(wheel);
	 	}

		verticesToVector3(vertices){
			return new THREE.Vector3( vertices[0], vertices[1], vertices[2] );
	 	}

		facesToFaces3(faces){
			return new THREE.Face3( faces[0], faces[1], faces[2] );
	  }


	createMesh(vertices, faces, color){

			let geo = new THREE.Geometry(),
			mat = new THREE.MeshBasicMaterial({color: color});

			geo.vertices = vertices.map(this.verticesToVector3);
			geo.faces = faces.map(this.facesToFaces3);
			geo.computeVertexNormals();
			geo.computeFaceNormals();

			const body = new THREE.Mesh(geo, mat);
			this.object.add(body);

		}

		setMaterial(num){
				if (num == 0) {
						this.object.children[0].material = new THREE.MeshBasicMaterial({color: 0xbac3c8});
						this.object.children[1].material = new THREE.MeshBasicMaterial({color: 0x101010});
						this.object.children[2].material = new THREE.MeshBasicMaterial({color: 0x101010});
						this.object.children[3].material = new THREE.MeshBasicMaterial({color: 0xffffff});
						this.object.children[4].material = new THREE.MeshBasicMaterial({color: 0xcc0000});
						this.object.children[5].material = new THREE.MeshBasicMaterial({color: 0xbac3c8});
						this.object.children[6].material = new THREE.MeshBasicMaterial({color: 0x1c1c1c});
						this.object.children[7].material = new THREE.MeshBasicMaterial({color: 0x1c1c1c});
						this.object.children[8].material = new THREE.MeshBasicMaterial({color: 0x1c1c1c});
						this.object.children[9].material = new THREE.MeshBasicMaterial({color: 0x1c1c1c});
				} else if (num == 1) {
						this.object.children[0].material = new THREE.MeshLambertMaterial({color: 0xbac3c8});
						this.object.children[1].material = new THREE.MeshLambertMaterial({color: 0x101010});
						this.object.children[2].material = new THREE.MeshLambertMaterial({color: 0x101010});
						this.object.children[3].material = new THREE.MeshLambertMaterial({color: 0xffffff});
						this.object.children[4].material = new THREE.MeshLambertMaterial({color: 0xcc0000});
						this.object.children[5].material = new THREE.MeshLambertMaterial({color: 0xbac3c8});
						this.object.children[6].material = new THREE.MeshLambertMaterial({color: 0x1c1c1c});
						this.object.children[7].material = new THREE.MeshLambertMaterial({color: 0x1c1c1c});
						this.object.children[8].material = new THREE.MeshLambertMaterial({color: 0x1c1c1c});
						this.object.children[9].material = new THREE.MeshLambertMaterial({color: 0x1c1c1c});
				} else if (num == 2) {
						this.object.children[0].material = new THREE.MeshPhongMaterial({color: 0xbac3c8});
						this.object.children[1].material = new THREE.MeshPhongMaterial({color: 0x101010});
						this.object.children[2].material = new THREE.MeshPhongMaterial({color: 0x101010});
						this.object.children[3].material = new THREE.MeshPhongMaterial({color: 0xffffff});
						this.object.children[4].material = new THREE.MeshPhongMaterial({color: 0xcc0000});
						this.object.children[5].material = new THREE.MeshPhongMaterial({color: 0xbac3c8});
						this.object.children[6].material = new THREE.MeshPhongMaterial({color: 0x1c1c1c});
						this.object.children[7].material = new THREE.MeshPhongMaterial({color: 0x1c1c1c});
						this.object.children[8].material = new THREE.MeshPhongMaterial({color: 0x1c1c1c});
						this.object.children[9].material = new THREE.MeshPhongMaterial({color: 0x1c1c1c});
				}
		}
}

class Palanque extends THREE.Object3D {
  constructor() {
    super();
    this.width = 20.27 * 3; //it fits 3 cybertruck
    this.height = 19.05 / 3;
    this.color = 0x3d3635;
    this.palanqueGeo = new THREE.CylinderGeometry(this.width, this.width, this.height, 64);
    this.palanqueMaterials = new Array(3);
    this.palanqueMaterials[0] = new THREE.MeshBasicMaterial({color: this.color});
    this.palanqueMaterials[1] = new THREE.MeshLambertMaterial({color: this.color});
    this.palanqueMaterials[2] = new THREE.MeshPhongMaterial({color: this.color});
    this.mesh = new THREE.Mesh(this.palanqueGeo, this.palanqueMaterials[0]);
    this.add(this.mesh);
  }

  rotateLeft(){
    this.rotation.y-=0.1;
  }

  rotateRight(){
    this.rotation.y+=0.1;
  }

  setMaterial(num) {
    this.mesh.material = this.palanqueMaterials[num];
  }
}

class Floor extends THREE.Object3D {
  constructor() {
    super();
    this.width = 20.27 * 12;
    this.height = 0.1;
    this.color = 0x2b1d0e;
    this.floorGeo = new THREE.BoxGeometry(this.width, this.height, this.width);
    this.floorMaterials = new Array(3);
    this.floorMaterials[0] = new THREE.MeshBasicMaterial({color: this.color});
    this.floorMaterials[1] = new THREE.MeshLambertMaterial({color: this.color});
    this.floorMaterials[2] = new THREE.MeshPhongMaterial({color: this.color});
    this.mesh = new THREE.Mesh(this.floorGeo, this.floorMaterials[0]);
    this.add(this.mesh);
  }

  setMaterial(num) {
    this.mesh.material = this.floorMaterials[num];
  }

}

function createSpotlight(x, y, z, angle, id) {
	var sphereGeo = new THREE.SphereGeometry( 2 );
	var sphereMat = new THREE.MeshBasicMaterial( {color: 0xffffff} );
	var sphere = new THREE.Mesh( sphereGeo, sphereMat );
	scene.add( sphere );

	var coneGeo = new THREE.ConeGeometry( 5, 20, 32 );
	var coneMat = new THREE.MeshBasicMaterial( {color: 0xffff00} );
	var cone = new THREE.Mesh( coneGeo, coneMat );
	cone.position.set(x, y, z);
	cone.lookAt(scene.position);

	if( id == 0 ){
		cone.rotateX(-angle);
		sphere.position.set(x, y+5.5, z+6.5);

	} else if (id == 1) {
		cone.rotateX(-angle);
		sphere.position.set(x+6, y+5.5, z-6);

	} else if (id == 2) {
		cone.rotateX(-angle);
		sphere.position.set(x-6, y+5.5, z-6);

	}

	scene.add( cone );
}

function createScene() {

    scene = new THREE.Scene();

    scene.add(new THREE.AxisHelper(10));

    // light from the top
    directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    scene.add( directionalLight );

    // floor
    floor = new Floor();
    scene.add(floor);

    // cybertruck
    cybertruck = new Cybertruck();
    cybertruck.object.position.y = cybertruck.height/1.5;

    // palanque
    palanque = new Palanque();
    palanque.position.y = palanque.height/2;
    palanque.add(cybertruck.object);
    scene.add(palanque);

		// spotlights
		spotLights[0] = new THREE.SpotLight( 0xffffff, 0);
    spotLights[0].position.set( 0, 5*cybertruck.height, floor.width / 2 );
    spotLights[0].target.position.set( 0,0,0 );
		scene.add( spotLights[0] );
		scene.add( spotLights[0].target);
		createSpotlight(0, 5*cybertruck.height, floor.width / 2, Math.PI / 2, 0);

		spotLights[1] = new THREE.SpotLight( 0xffffff, 0);
		spotLights[1].position.set( floor.width / 2, 5*cybertruck.height, -floor.width / 2 );
		spotLights[1].target.position.set( 0,0,0 );
		scene.add( spotLights[1] );
		scene.add( spotLights[1].target);
		createSpotlight(floor.width / 2, 5*cybertruck.height, -floor.width / 2, Math.PI / 2, 1);

		spotLights[2] = new THREE.SpotLight( 0xffffff, 0);
		spotLights[2].position.set( -floor.width / 2, 5*cybertruck.height, -floor.width / 2 );
		spotLights[2].target.position.set( 0,0,0 );
		scene.add( spotLights[2] );
		scene.add( spotLights[2].target);
		createSpotlight(-floor.width / 2, 5*cybertruck.height, -floor.width / 2, Math.PI / 2, 2);

}

function turnSpotlights(num){

	if (spotLights[num].intensity == 0){
		spotLights[num].intensity = 2;

	} else {
		spotLights[num].intensity = 0;
	}
}

function changeIlumination(){
    if (activeMaterial != 0) {   // caso nao seja basic, mete basic

        prevMaterial = activeMaterial;
        palanque.setMaterial(0);
        floor.setMaterial(0);
				cybertruck.setMaterial(0);
        activeMaterial = 0;

    } else if (prevMaterial > 0) { // caso seja basic, e o mat ja tenha sido alterado

        palanque.setMaterial(prevMaterial);
        floor.setMaterial(prevMaterial);
				cybertruck.setMaterial(prevMaterial);
        activeMaterial = prevMaterial;

    } else {  // caso seja basic e o mat nnc foi alterado, mete Lambert

        palanque.setMaterial(1);
        floor.setMaterial(1);
				cybertruck.setMaterial(1);
        activeMaterial = 1;
    }

    keyIlumination = false;
}

function changeMaterial(){
    if (activeMaterial == 0) {
        palanque.setMaterial(1);
        floor.setMaterial(1);
        cybertruck.setMaterial(1);
        activeMaterial = 1;
    } else if (activeMaterial == 1) {
        palanque.setMaterial(2);
        floor.setMaterial(2);
        cybertruck.setMaterial(2);
        activeMaterial = 2;
    } else if (activeMaterial == 2) {
        palanque.setMaterial(1);
        floor.setMaterial(1);
				cybertruck.setMaterial(1);
        activeMaterial = 1;
    }
    keyMaterial = false;
}

function createPerspectiveCamera() {
    camera[0] = new THREE.PerspectiveCamera(60,
                                         window.innerWidth / window.innerHeight,
                                         1,
                                         1000);

    camera[0].position.x = 75;
    camera[0].position.y = 90;
    camera[0].position.z = 160;
		camera[0].lookAt(scene.position);
}

function createTopCamera() {

    camera[1] = new THREE.OrthographicCamera(-aspectRatio * viewSize / 2,
                                             aspectRatio * viewSize / 2,
                                             viewSize / 2, -viewSize / 2,
                                             0.1,
                                             1000);

		camera[1].position.x = 63;
    camera[1].position.y = 19.05/6;
		camera[1].lookAt(scene.position);
}

function onResize() {
  	renderer.setSize(window.innerWidth, window.innerHeight);

    //OrthographicCamera
    resizeOrtCamera();

  	//PerspectiveCameras
  	resizePerspCamera();
}

function resizeOrtCamera() {
    var aspect = window.innerWidth / window.innerHeight;
    var change = aspectRatio / aspect;
    var newSize = viewSize * change;
    camera[1].left = -aspect * newSize / 2;
    camera[1].right = aspect * newSize  / 2;
    camera[1].top = newSize / 2;
    camera[1].bottom = -newSize / 2;
    camera[1].updateProjectionMatrix();
}

function resizePerspCamera() {
    if (window.innerHeight > 0 && window.innerWidth > 0) {
        camera[0].aspect = window.innerWidth / window.innerHeight;
        camera[0].updateProjectionMatrix();
    }
}

function update() {
	if (keyIlumination) {
		changeIlumination();
	}
	if (keyMaterial) {
		changeMaterial();
	}
	if (keyRotation == -1) {
		palanque.rotateLeft();
		keyRotation = 0;
	}
	if (keyRotation == 1) {
		palanque.rotateRight();
		keyRotation = 0;
	}
	if (keySpotlight != -1) {
		turnSpotlights(keySpotlight);
		keySpotlight = -1;
	}
}

function onKeyDown(e) {
    var key = e.keyCode;
    switch (key) {
      	case 81: //q
          if(directionalLight.intensity > 0){
            directionalLight.intensity = 0;
          } else {
            directionalLight.intensity = 1;
          }
          break;
      	case 87: //w
      	  keyIlumination = true;
          break;
      	case 69: //e
      	  keyMaterial = true;
          break;
        case 37: //left
          keyRotation = -1;
          break;
        case 39: //right
          keyRotation = 1;
          break;
        case 49: // 1 to 5
        case 50:
        case 51:
          keySpotlight = key - 49;
		  		break;
        case 52:
		  		activeCamera = 0;
		  		break;
        case 53:
					activeCamera = 1;
					break;
    }
}

function createCameras(){

    createPerspectiveCamera();
    createTopCamera();

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
    window.addEventListener("resize", onResize);

}

function animate() {

    renderer.render(scene, camera[activeCamera]);
    update();

    requestAnimationFrame(animate);
}
