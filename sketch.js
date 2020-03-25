var scene, renderer;

let x = 0;
let _y = 0;
let _z = 0;
var splineCamera;
var binormal = new THREE.Vector3();
var normal = new THREE.Vector3();
var mouse = new THREE.Vector2();
var scrollTop = 0;
var params = {
  animationView: true,
  lookAhead: false,
}
var texture = [];
var geoMaterial = [];
var container;
var sprite = [];
var geoTemp = [];
var geometry = [];
var renderer;

var tempX = [];
var tempY = [];
var tempZ = [];
var curves = [];

var audioHome = [];
var textHome = [];

// TODO: Make curve resolution and length relative to list length
var curveResolution = 100;
var curveObject = [];



var startButton = document.getElementById('startButton');
startButton.addEventListener('click', function () {
  letsGo();
}, false);

var vidArray = [];
var audioArray = [];
var imgArray = [];
var textArray = [];


let table;

function preload() {
  table = loadTable('artworks.csv', 'csv', 'header');
}

function setup() {
  /* NOTE: This function;
     1. reads the CSV.
     2. looks at each line for a certian file type
     3. if found, that file is saved in the appropriate array */
  for (let r = 0; r < table.getRowCount(); r++) {
    let s = table.getString(r, 0);

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
  console.log(imgArray);
  console.log(audioArray);
  console.log(vidArray);
  console.log(textArray);


}


function letsGo() {

  init();
  animate();

}


function init() {

  // create a set of points to be used for the curve
  for (i = 0; i < 100; i++) {

    tempX[i] = (Math.random() * 140 - 150);
    tempY[i] = (Math.random() * 140 - 150);
    tempZ[i] = (Math.random() * 140 - 150);

  }

  // create scene and default material
  scene = new THREE.Scene();
  material = new THREE.MeshBasicMaterial({
    shading: THREE.FlatShading,
    color: 0x6e6e6e,
    transparent: true,
    opacity: 0.1
  });

  //remove the start button DIV entirely
  var element = document.getElementById("overlay");
  element.parentNode.removeChild(element);

  //create a container DIV for this renderer
  container = document.createElement('div');
  document.body.appendChild(container);

  // create a hidden DIV with a pixel length
  // creates the scroll functionality
  var hiddenDiv = document.createElement("div");
  hiddenDiv.style.height = "10000px";
  document.body.appendChild(hiddenDiv);

  // create renderer, and attach to the container DIV
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);



  // create a new curve
  // TODO: expand this to an array of curves = length of collections in CSV
  for (let i = 0; i < 1; i++) {

    curves[i] = new THREE.CatmullRomCurve3();
    curves[i].tension = 0;

    // TODO: make this match the amound of artworks contained in that collection

    for (let j = 0; j < 16; j++) {

      let tempRand = Math.floor(Math.random() * 50);


      let _x = Math.floor(tempX[tempRand]);
      let _y = Math.floor(tempY[tempRand])
      let _z = Math.floor(tempZ[tempRand])


      curves[i].points.push(new THREE.Vector3(_x, _y, _z))

    }


    geometry[i] = new THREE.TubeBufferGeometry(curves[i], 1000, 0.1, 12, false);


    //material = new THREE.MeshPhongMaterial({shading: THREE.FlatShading, color: 0xdcdcdc, ambient: 0xffffff, emissive: 0x000000, specular: 0x111111, shininess: 30, side: THREE.DoubleSide, transparent: true, opacity: 0.47});
    // var curveObject = new THREE.Mesh(geometry, material);
    curveObject[i] = new THREE.Line(geometry[i], material);
    scene.add(curveObject[i]);

  }

  // for (let i = 0; i < 10; i++) {
  //   _x = _x + (Math.random() * 300 - 150);
  //   _y = _y + (Math.random() * 300 - 150);
  //   _z = _z + (Math.random() * 300 - 150);
  //   curve.points.push(new THREE.Vector3(_x, _y, _z))
  // }


  // var material = new THREE.LineBasicMaterial({
  //   color: 0x8f8f8f
  // });


  scene.background = new THREE.Color(0xffffff);
  scene.fog = new THREE.FogExp2(0x000000, 0.01, 0.05);
  scene.fog = new THREE.FogExp2(0xffffff, 0.01, 0.02);


  processImages();
  processVideos();
  processAudio();
  processText();



  window.addEventListener('mousemove', onMouseMove, false);
  window.addEventListener('touchmove', onMouseMove, false);
  window.addEventListener('scroll', onScroll, false);


}

function processImages() {
  // IMAGE PROCESSING!!
  for (let i = 0; i < imgArray.length; i++) {
    // extract number from filename.
    // NB, this is important. (i) is the array counter. nx is the existence of
    // a file that is an image
    let sx = imgArray[i];
    let nx = sx.match(/\d+/g).map(Number);
    texture[i] = new THREE.TextureLoader().load('artworks/art-object-' + [nx] + '.jpg');
    texture[i].wrapS = THREE.RepeatWrapping;
    texture[i].wrapT = THREE.RepeatWrapping;
    texture[i].repeat.set(1, 1)
    geoMaterial[i] = new THREE.MeshBasicMaterial({
      map: texture[i]
    });
    geoTemp[i] = new THREE.PlaneGeometry(15, 10, 20, 20);
    sprite[i] = new THREE.Mesh(geoTemp[i], geoMaterial[i])
    scene.add(sprite[i]);
    // note the use of nx in the position data, not i
    var posPlane = geometry[0].parameters.path.getPointAt(0.05 * nx); // + Math.random() * 0.03);
    var rotPlane = geometry[0].parameters.path.getPointAt(0.0499 * (nx));
    sprite[i].position.copy(posPlane);
    sprite[i].lookAt(rotPlane, normal);
    parent = new THREE.Object3D();
    scene.add(parent);
    splineCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 10000);
    parent.add(splineCamera);
  }
}

function processVideos() {
  video = document.getElementById('video');
  video.play();

  // IMAGE PROCESSING!!
  for (let i = 0; i < vidArray.length; i++) {
    // extract number from filename.
    // NB, this is important. (i) is the array counter. nx is the existence of
    // a file that is an image
    let sx = vidArray[i];
    let sx2 = sx.substring(0, sx.length - 4); // remove extension
    let nx = sx2.match(/\d+/g).map(Number);
    texture[i] = new THREE.VideoTexture(video);
    texture[i].wrapS = THREE.RepeatWrapping;
    texture[i].wrapT = THREE.RepeatWrapping;
    texture[i].repeat.set(1, 1)
    geoMaterial[i] = new THREE.MeshBasicMaterial({
      map: texture[i]
    });
    geoTemp[i] = new THREE.PlaneGeometry(15, 10, 20, 20);
    sprite[i] = new THREE.Mesh(geoTemp[i], geoMaterial[i])
    scene.add(sprite[i]);
    // note the use of nx in the position data, not i
    var posPlane = geometry[0].parameters.path.getPointAt(0.05 * nx); // + Math.random() * 0.03);
    var rotPlane = geometry[0].parameters.path.getPointAt(0.0499 * (nx));
    sprite[i].position.copy(posPlane);
    sprite[i].lookAt(rotPlane, normal);
    parent = new THREE.Object3D();
    scene.add(parent);
    splineCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 10000);
    parent.add(splineCamera);
  }
}

function processAudio() {
  // AUDIO PROCESSING
  // create an AudioListener and add it to the camera
  var listener = new THREE.AudioListener();
  splineCamera.add(listener);
  // create the PositionalAudio object (passing in the listener)
  var sound = new THREE.PositionalAudio(listener);
  // load a sound and set it as the PositionalAudio object's buffer
  var audioLoader = new THREE.AudioLoader();

  for (let i = 0; i < audioArray.length; i++) {
    let sx = audioArray[i];
    let sx2 = sx.substring(0, sx.length - 4); // remove extension
    let nx = sx2.match(/\d+/g).map(Number); // extract only numbers

    audioLoader.load('artworks/audio.mp3', function (buffer) {
      sound.setBuffer(buffer);
      sound.setRefDistance(10);
      sound.play();
    });
    // finally add the sound to the mesh

    var audioSphere = new THREE.SphereBufferGeometry(0.1, 0.1, 10);
    var audioMaterial = new THREE.MeshPhongMaterial({
      color: 0xff2200
    });
    audioHome[i] = new THREE.Mesh(audioSphere, audioMaterial);
    scene.add(audioHome[i]);

    var posPlane = geometry[0].parameters.path.getPointAt(0.05 * nx); // + Math.random() * 0.03);

    audioHome[i].position.copy(posPlane);
    audioHome[i].add(sound)
  }

}

function processText() {

  let tempText = [];
  for (let i = 0; i < textArray.length; i++) {
    let sx = textArray[i];
    let sx2 = sx.substring(0, sx.length - 4); // remove extension
    let nx = sx2.match(/\d+/g).map(Number); // extract only numbers
    tempText[i] = readFile(textArray[i]);
    console.log(tempText[i])

    let texture = new THREE.TextTexture({
      fillStyle: '#000000',
      fontFamily: '"Arial", Times, serif',
      fontSize: 32,
      fontStyle: 'italic',
      text: [
      "What's happened to me, he thought. It was no dream.",
     ].join('\n'),
    });
    let material = new THREE.SpriteMaterial({
      map: texture
    });
    let sprite = new THREE.Sprite(material);
    let spriteScale = 1;
    texture.redraw();
    sprite.scale
      .set(texture.image.width / texture.image.height, 1, 1)
      .multiplyScalar(spriteScale);
    scene.add(sprite);
    var posPlane = geometry[0].parameters.path.getPointAt(0.05 * nx); // + Math.random() * 0.03);
    sprite.position.copy(posPlane);

  }
}


function readFile(filePath) {

  fetch('theArchive/' + filePath)
    .then(response => response.text())
    .then((data) => {
      console.log(data);
          return (data);
    })
}

function animate() {
  render();
  requestAnimationFrame(animate);
  // curveObject.rotation.x += 0.001;

  renderer.render(scene, splineCamera);

};

function render() {
  // var time = Date.now();
  // var looptime = 20*2000;
  // var t = (time % looptime) / looptime;

  var t = (scrollTop);
  //console.log(scrollTop);
  var pos = geometry[0].parameters.path.getPointAt(t);
  // interpolation
  var segments = geometry[0].tangents.length;
  var pickt = t * segments;
  var pick = Math.floor(pickt);
  var pickNext = (pick + 1) % segments;
  binormal.subVectors(geometry[0].binormals[pickNext], geometry[0].binormals[pick]);
  binormal.multiplyScalar(pickt - pick).add(geometry[0].binormals[pick]);
  var dir = geometry[0].parameters.path.getTangentAt(t);
  var offset = 1;
  normal.copy(binormal).cross(dir);
  // we move on a offset on its binormal
  pos.add(normal.clone().multiplyScalar(offset));
  splineCamera.position.copy(pos);
  //    // using arclength for stablization in look ahead
  var lookAt = geometry[0].parameters.path.getPointAt((t + 30 / geometry[0].parameters.path.getLength()) % 1).multiplyScalar(params.scale);
  // camera orientation 2 - up orientation via normal
  if (!params.lookAhead) lookAt.copy(pos).add(dir);
  splineCamera.matrix.lookAt(splineCamera.position, lookAt, normal);
  splineCamera.quaternion.setFromRotationMatrix(splineCamera.matrix);
}

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 1 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 1 + 1;
}

function onScroll(event) {
  scrollTop = (window.pageYOffset || document.documentElement.scrollTop) / 10000;
  //console.log(scrollTop);
}
