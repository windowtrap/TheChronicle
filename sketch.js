let scene, renderer, splineCamera, container;
let x = 0,
  _y = 0,
  _z = 0;
// basic tracking paramaters
let binormal = new THREE.Vector3();
let normal = new THREE.Vector3();
let mouse = new THREE.Vector2();
let lookAt = new THREE.Vector3()
let scrollTop = 0;
let params = {
  animationView: true,
  lookAhead: false,
  scale: 1,
}
// wormhole / spacebridge
let majorWormhole, // take
  minorWormhole; // take
// object tracking
let nodeLength, vertexLength; // the amount of nodes (not amount of individual media objects)
let table;
let clickableObjects = []; // take
// storage of different media objects
let vidArray = [],
  audioArray = [],
  imgArray = [],
  textArray = [];

let tempText = [];

let indexList = [];
let wormHoleVersions = ["A", "B", "C", "D"];
let currentVersion;
let currentVersionArray = [];

let majorWHoleMat, minorWHoleMat, audioMaterial, dotMaterial, dotSphere;

let imgSprite = [];
let vidSprite = [];
let textSprite = [];
let textMaterial = [];

let curveObject;
let curveObject2;


let dot = [];

function preload() {
  table = loadTable('artworks.csv', 'csv', 'header');
}

function setup() {

currentVersion = wormHoleVersions[Math.floor(Math.random()*wormHoleVersions.length)];
extractData(currentVersion, 0); // 0 is current index, or start position.

  let startButton = document.createElement('startButton');
  startButton.innerHTML = "Enter the Chronicle"
  startButton.setAttribute("class", "startButton");
  startButton.addEventListener('click', function() {
    firstStartup();
  }, false);
  document.getElementById("centerDiv").appendChild(startButton);
  window.addEventListener('click', onMouseClick, false);
}

function extractData(currentVersion, objIndex){
  //replace with wormHoleVersions automatically trawling for v.numbers
  for (let r = 0; r < table.getRowCount(); r++) {
    indexList[r] = table.getString(r, 0); // put all values in an index, for future lookup
    let s = table.getString(r, 3);
    if (s.includes(currentVersion)) {
      currentVersionArray.push(table.getString(r,0));
    }
  }
    for (let r = 0; r < currentVersionArray.length; r++) {
      let s = currentVersionArray[r];
      if (s.includes("jpg")) {
        imgArray.push(s);
      }
      if (s.includes("mp3")) {
        audioArray.push(s);
      }
      if (s.includes("mp4")) {
        vidArray.push(s);
      }
      if (s.includes("txt")) {
        textArray.push(s);
      }
    }
    nodeLength = currentVersionArray.length;
    vertexLength = nodeLength + 1;

    let currentIndex = indexList[objIndex];
    let newScrollPos = ((currentVersionArray.indexOf(currentIndex)-0.5)/currentVersionArray.length)*10000;


    window.pageYOffset = 0;
    document.documentElement.scrollTop = newScrollPos;
    scrollTop = (window.pageYOffset || document.documentElement.scrollTop) / 10000;
}

function onMouseMove(event) {
  // calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function firstStartup() {
  //remove the start button DIV entirely
  let element = document.getElementById("overlay");
  element.parentNode.removeChild(element);

  // create scene
  scene = new THREE.Scene();

  //create a container DIV for this renderer
  container = document.createElement('div');
  document.body.appendChild(container);
  // create hidden DIV with a pixel length for scroll functionality
  let hiddenDiv = document.createElement("div");
  hiddenDiv.style.height = "10000px";
  document.body.appendChild(hiddenDiv);
  // create renderer, and attach to the container DIV
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  scene.background = new THREE.Color(0xffffff);
  scene.fog = new THREE.FogExp2(0x000000, 0.01, 0.05);
  scene.fog = new THREE.FogExp2(0xffffff, 0.01, 0.02);

  parent = new THREE.Object3D();
  scene.add(parent);
  splineCamera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10000);
  parent.add(splineCamera);

  minorWHoleMat = new THREE.MeshBasicMaterial({
    shading: THREE.FlatShading,
    color: 0x1e1e1e,
    transparent: true,
    opacity: 0.1
  });


  majorWHoleMat = new THREE.MeshLambertMaterial({
    shading: THREE.FlatShading,
    color: 0xababab,
    transparent: true,
    opacity: 0.1
  });

  dotMaterial = new THREE.MeshLambertMaterial({
    color: 0x7a7a7a,
    transparent: true,
    opacity: 0.8
  });

  audioMaterial = new THREE.MeshBasicMaterial({
    color: 0xff2200
  });

dotSphere = new THREE.SphereBufferGeometry(0.03, 10, 10);

  init();
  setTimeout();
}

function initArrays(){
  let majorWormhole, // take
    minorWormhole; // take
    clickableObjects = []; // take
    vidArray = [],
    audioArray = [],
    imgArray = [],
    textArray = [];
    tempText = [];
    indexList = [];
    currentVersionArray = [];
    dot = [];
    imgSprite = [];
    vidSprite = [];
  textSprite = [];
    textMaterial = [];


  }

function init() {
  // temp values, explain
  let tempX = [],
    tempY = [],
    tempZ = [];
  let curves = [];

  let cScale = 60;
  // create a set of points to be used for the curve
  for (i = 0; i < vertexLength; i++) {
    if (i === 0) {
      tempX[i] = 0;
      tempY[i] = 0;
      tempZ[i] = 0;
    } else {
      tempX[i] = tempX[i - 1] + ((Math.random() * cScale) - cScale / 2);
      tempY[i] = tempY[i - 1] + ((Math.random() * cScale) - cScale / 2);
      tempZ[i] = tempZ[i - 1] + ((Math.random() * cScale) - cScale / 2);
    }
  }
  // create a new curve
  // TODO: expand this to an array of curves = length of collections in CSV
  for (let i = 0; i < 1; i++) {
    curves[i] = new THREE.CatmullRomCurve3();
    curves[i].tension = 0.4;
    // create points along the curve
    for (let j = 0; j < tempX.length; j++) {
      let _x = Math.floor(tempX[j]);
      let _y = Math.floor(tempY[j])
      let _z = Math.floor(tempZ[j])
      curves[i].points.push(new THREE.Vector3(_x, _y, _z))
    }
    majorWormhole = new THREE.TubeGeometry(curves[i], 2000, 0.01, 3, false);
    minorWormhole = new THREE.TubeBufferGeometry(curves[i], 800, 0.1, 7, false);

    curveObject2 = new THREE.Line(minorWormhole, minorWHoleMat);
    curveObject = new THREE.Mesh(majorWormhole, majorWHoleMat);
    scene.add(curveObject);
    scene.add(curveObject2);

  }

  makeSpheres();
  processImages();
  processVideos();
  processAudio();
  processText();

  window.addEventListener('mousemove', onMouseMove, false);
  window.addEventListener('touchmove', onMouseMove, false);
  window.addEventListener('scroll', onScroll, false);
}

function makeSpheres() {
  let numofDots = 600;
  for (let i = 0; i < numofDots; i++) {
    dot[i] = new THREE.Mesh(dotSphere, dotMaterial);
    scene.add(dot[i]);
    let posPlane = majorWormhole.parameters.path.getPointAt(1 / numofDots * i); // + Math.random() * 0.03);
    dot[i].position.copy(posPlane);
  }
}

function processImages() {
  let geoTemp = [];
  let texture = [];
  let geoMaterial = [];
;
  // IMAGE PROCESSING!!
  for (let i = 0; i < imgArray.length; i++) {
    let sx = imgArray[i];
    let nx = currentVersionArray.indexOf(sx);
    texture[i] = new THREE.TextureLoader().load('artworks/'+sx);
    texture[i].wrapS = THREE.ClampToEdgeWrapping;
    texture[i].wrapT = THREE.ClampToEdgeWrapping;
    texture[i].repeat.set(1, 1)
    geoMaterial[i] = new THREE.MeshBasicMaterial({
      map: texture[i],
      shading: THREE.FlatShading,
    });
    geoTemp[i] = new THREE.PlaneGeometry(15, 10, 20, 20);
    imgSprite[i] = new THREE.Mesh(geoTemp[i], geoMaterial[i]);
    imgSprite[i].name = sx;
    clickableObjects.push(imgSprite[i]);
    scene.add(imgSprite[i]);


    let t = (1 / nodeLength) * (nx * 0.9999);
    let pos = majorWormhole.parameters.path.getPointAt(t);

    // interpolation
    let segments = majorWormhole.tangents.length; // how many tangents
    let pickt = t * segments; // select which of the tangents
    let pick = Math.floor(pickt); // nearest integer
    let pickNext = (pick + 1) % segments; // add one, make sure does not go over length

    binormal.subVectors(majorWormhole.binormals[pickNext], majorWormhole.binormals[pick]);
    binormal.multiplyScalar(pickt - pick).add(majorWormhole.binormals[pick]);
    let dir = majorWormhole.parameters.path.getTangentAt(t);
    let offset = 0.5;
    normal.copy(binormal).cross(dir);
    // we move on a offset on its binormal
    pos.add(normal.clone().multiplyScalar(offset));
    imgSprite[i].position.copy(pos);
    majorWormhole.parameters.path.getPointAt((t + 30 / majorWormhole.parameters.path.getLength()) % 1, lookAt);
    lookAt.multiplyScalar(params.scale);
    lookAt.copy(pos).add(dir);
    imgSprite[i].matrix.lookAt(imgSprite[i].position, lookAt, normal);
    imgSprite[i].quaternion.setFromRotationMatrix(imgSprite[i].matrix);
  }
}

function processVideos() {

  let geoTemp = [];
  let texture = [];
  let geoMaterial = [];

  video = document.getElementById('video');
  video.play();

  // IMAGE PROCESSING!!
  for (let i = 0; i < vidArray.length; i++) {
    let sx = vidArray[i];
    let nx = currentVersionArray.indexOf(sx);
    texture[i] = new THREE.VideoTexture(video);
    texture[i].wrapS = THREE.ClampToEdgeWrapping;
    texture[i].wrapT = THREE.ClampToEdgeWrapping;
    texture[i].repeat.set(1, 1)
    geoMaterial[i] = new THREE.MeshBasicMaterial({
      map: texture[i],
      shading: THREE.FlatShading,
    });
    geoTemp[i] = new THREE.PlaneGeometry(15, 10, 20, 20);
    vidSprite[i] = new THREE.Mesh(geoTemp[i], geoMaterial[i])
    vidSprite[i].name = sx;
    clickableObjects.push(vidSprite[i]);
    scene.add(vidSprite[i]);
    // note the use of nx in the position data, not i

    let t = (1 / nodeLength) * (nx * 0.9999);
    let pos = majorWormhole.parameters.path.getPointAt(t);

    // interpolation
    let segments = majorWormhole.tangents.length; // how many tangents
    let pickt = t * segments; // select which of the tangents
    let pick = Math.floor(pickt); // nearest integer
    let pickNext = (pick + 1) % segments; // add one, make sure does not go over length

    binormal.subVectors(majorWormhole.binormals[pickNext], majorWormhole.binormals[pick]);
    binormal.multiplyScalar(pickt - pick).add(majorWormhole.binormals[pick]);
    let dir = majorWormhole.parameters.path.getTangentAt(t);
    let offset = 0.5;
    normal.copy(binormal).cross(dir);
    // we move on a offset on its binormal
    pos.add(normal.clone().multiplyScalar(offset));
    vidSprite[i].position.copy(pos);
    majorWormhole.parameters.path.getPointAt((t + 30 / majorWormhole.parameters.path.getLength()) % 1, lookAt);
    lookAt.multiplyScalar(params.scale);
    lookAt.copy(pos).add(dir);
    vidSprite[i].matrix.lookAt(vidSprite[i].position, lookAt, normal);
    vidSprite[i].quaternion.setFromRotationMatrix(vidSprite[i].matrix);
  }
}

function processAudio() {
  // AUDIO PROCESSING
  // create an AudioListener and add it to the camera
  let listener = new THREE.AudioListener();
  let audioHome = [];
  splineCamera.add(listener);
  // create the PositionalAudio object (passing in the listener)
  let sound = new THREE.PositionalAudio(listener);
  // load a sound and set it as the PositionalAudio object's buffer
  let audioLoader = new THREE.AudioLoader();

  for (let i = 0; i < audioArray.length; i++) {
    let sx = audioArray[i];
    let nx = currentVersionArray.indexOf(sx);

    audioLoader.load('artworks/audio.mp3', function(buffer) {
      sound.setBuffer(buffer);
      sound.setRefDistance(5);
      sound.play();
    });
    // finally add the sound to the mesh

    let audioSphere = new THREE.SphereBufferGeometry(0.3, 0.3, 30);

    audioHome[i] = new THREE.Mesh(audioSphere, audioMaterial);
    audioHome[i].name = sx;
    clickableObjects.push(audioHome[i]);
    scene.add(audioHome[i]);

    let posPlane = majorWormhole.parameters.path.getPointAt(0.05 * nx); // + Math.random() * 0.03);

    audioHome[i].position.copy(posPlane);
    audioHome[i].add(sound)
  }

}

function processText() {

  let textSprite = [];
  let textMaterial = [];

  for (let i = 0; i < textArray.length; i++) {
    let sx = textArray[i];
    let nx = currentVersionArray.indexOf(sx);
    let t = (1 / nodeLength) * (nx * 0.9999);
   $.ajax({
      type: "GET",
      url: 'theArchive/' + textArray[i],
      async: true,
      success: function(text) {
        tempText[i] = text;
        let texture = new THREE.TextTexture({
          fillStyle: '#000000',
          fontFamily: '"Arial", Times, serif',
          fontSize: 32,
          fontStyle: 'italic',
          text: [
            "What's happened to me, he thought. It was no dream.",
          ].join('\n'),
        });
        texture.text = tempText[i];
        textMaterial[i] = new THREE.SpriteMaterial({
          map: texture
        });
        textSprite[i] = new THREE.Sprite(textMaterial[i]);
        let textSpriteScale = 1;
        texture.redraw();
        textSprite[i].scale
          .set(texture.image.width / texture.image.height, 1, 1)
          .multiplyScalar(textSpriteScale);
        textSprite[i].name = sx;
        clickableObjects.push(textSprite[i]);
        scene.add(textSprite[i]);
        let posPlane = majorWormhole.parameters.path.getPointAt(t); // + Math.random() * 0.03);
        textSprite[i].position.copy(posPlane);
      }
    });
  }
}


async function readFile(filePath) {
  const response = await fetch('theArchive/' + filePath);
  const text = await response.text();
}

function animate() {
  render();
  requestAnimationFrame(animate);
  renderer.render(scene, splineCamera);
};

function render() {
  // let time = Date.now();
  // let looptime = 20*2000;
  // let t = (time % looptime) / looptime;

  let t = (scrollTop);
  let pos = majorWormhole.parameters.path.getPointAt(t);

  // interpolation
  let segments = majorWormhole.tangents.length; // how many tangents
  let pickt = t * segments; // select which of the tangents
  let pick = Math.floor(pickt); // nearest integer
  let pickNext = (pick + 1) % segments; // add one, make sure does not go over length

  binormal.subVectors(majorWormhole.binormals[pickNext], majorWormhole.binormals[pick]);
  binormal.multiplyScalar(pickt - pick).add(majorWormhole.binormals[pick]);
  let dir = majorWormhole.parameters.path.getTangentAt(t);
  let offset = 0.5;
  normal.copy(binormal).cross(dir);
  // we move on a offset on its binormal
  pos.add(normal.clone().multiplyScalar(offset));
  splineCamera.position.copy(pos);
  majorWormhole.parameters.path.getPointAt((t + 30 / majorWormhole.parameters.path.getLength()) % 1, lookAt);
  lookAt.multiplyScalar(params.scale);
  lookAt.copy(pos).add(dir);
  splineCamera.matrix.lookAt(splineCamera.position, lookAt, normal);
  splineCamera.quaternion.setFromRotationMatrix(splineCamera.matrix);
}

function onMouseClick(event) {
  let raycaster = new THREE.Raycaster();

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // update the picking ray with the camera and mouse position
  raycaster.setFromCamera(mouse, splineCamera);

  // calculate objects intersecting the picking ray
  let intersects = raycaster.intersectObjects(clickableObjects, true);

  if (intersects.length > 0) {
    for (let i = 0; i < 1; i++) {
      let currentName = intersects[i].object.name;
      console.log(currentName);
      let currentIndex = indexList.indexOf(currentName);
      let availAlphas = table.getString(currentIndex, 3); // put all values in an index, for future lookup
      console.log(availAlphas);
      let availAlphasSplit = availAlphas.split('');
      let newVersion = availAlphasSplit[Math.floor(Math.random()*availAlphasSplit.length)];
      console.log(scene);
      runDisposal();
      initArrays();
      extractData(newVersion, currentIndex)
      setTimeout(init, 5);
      setTimeout(animate, 5);


      // TODO - condense the above



    }
  } else {
    console.log("nothingThere")
  }

}

function onScroll(event) {
  scrollTop = (window.pageYOffset || document.documentElement.scrollTop) / 10000;

}

function runDisposal(){



  majorWormhole.dispose();
  minorWormhole.dispose();
  scene.remove(curveObject);
  scene.remove(curveObject2);


  for (let i = 0; i < dot.length; i++){
    let tempMesh = dot[i];
    scene.remove(dot[i]);
  }

for (let i = 0; i < clickableObjects.length; i++){
  scene.remove(clickableObjects[i]);
}


//   dot[]
//
//   imgSprite[]
//
// audioLoader

  // curveObject.dispose;
  // curveObject2.dispose;

}
