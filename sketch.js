var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
let _x = 0;
let _y = 0;
let _z = 0;
var splineCamera;
var binormal = new THREE.Vector3();
var normal = new THREE.Vector3();
var mouse = new THREE.Vector2();
var scrollTop = 0;

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 1 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 1 + 1;
}

function onScroll(event){
scrollTop = (window.pageYOffset || document.documentElement.scrollTop)/10000;
console.log(scrollTop);
}

var params = {
  animationView: true,
  lookAhead: false,
}
var curve = new THREE.CatmullRomCurve3([]);
for (let i = 0; i < 6; i++) {
  _x = Math.random() * 3 - 6;
  _y = Math.random() * 3 - 6;
  _z = Math.random() * 3 - 6;
  curve.points.push(new THREE.Vector3(_x, _y, _z))
}
var points = curve.getPoints(10000); // the higher this value, the smoother the curve
var geometry = new THREE.TubeBufferGeometry(curve, 100, 0.01, 8, true);
var material = new THREE.LineBasicMaterial({
  color: 0x424242
});
var curveObject = new THREE.Line(geometry, material);
scene.add(curveObject);
camera.position.z = 5;
var geometry2 = new THREE.SphereGeometry(.1, 3, 3);
var material = new THREE.MeshBasicMaterial({
  color: 0xffff00
});
var sphere = new THREE.Mesh(geometry2, material);
//
// var planeGeo = new THREE.PlaneGeometry(1, 1, 32 );
// var planematerial = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
// var plane = new THREE.Mesh(planeGeo, material );
// scene.add(plane);
// plane.position.copy(posPlane);
//var spriteMap = new THREE.TextureLoader().load( 'textures/sprite.png' );
var sprite = [];
var spriteMaterial = new THREE.SpriteMaterial({
  color: 0xffffff
});
for (let i = 0; i < 20; i++) {
  sprite[i] = new THREE.Sprite(spriteMaterial);
  sprite[i].scale.set(.1, 0.1, 1)
  scene.add(sprite[i]);
  var posPlane = geometry.parameters.path.getPointAt((0.05 * i) + Math.random() * 0.03);
  sprite[i].position.copy(posPlane);
}
var animate = function() {
  render();
  requestAnimationFrame(animate);
  // curveObject.rotation.x += 0.001;
  // curveObject.rotation.y += 0.001;
  renderer.render(scene, splineCamera);
};
init();
animate();
window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('touchmove', onMouseMove, false);
window.addEventListener('scroll', onScroll, false);

function init() {
  parent = new THREE.Object3D();
  scene.add(parent);
  splineCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 100);
  parent.add(splineCamera);
  splineCamera.add(sphere);
}

function render() {
  // var time = Date.now();
  // var looptime = 20*2000;
  // var t = (time % looptime) / looptime;
  var t = (scrollTop);
  console.log(scrollTop);
  var pos = geometry.parameters.path.getPointAt(t);
  // interpolation
  var segments = geometry.tangents.length;
  var pickt = t * segments;
  var pick = Math.floor(pickt);
  var pickNext = (pick + 1) % segments;
  binormal.subVectors(geometry.binormals[pickNext], geometry.binormals[pick]);
  binormal.multiplyScalar(pickt - pick).add(geometry.binormals[pick]);
  var dir = geometry.parameters.path.getTangentAt(t);
  var offset = 0.0;
  normal.copy(binormal).cross(dir);
  // we move on a offset on its binormal
  pos.add(normal.clone().multiplyScalar(offset));
  splineCamera.position.copy(pos);
  //    // using arclength for stablization in look ahead
  var lookAt = geometry.parameters.path.getPointAt((t + 30 / geometry.parameters.path.getLength()) % 1).multiplyScalar(params.scale);
  // camera orientation 2 - up orientation via normal
  if (!params.lookAhead) lookAt.copy(pos).add(dir);
  splineCamera.matrix.lookAt(splineCamera.position, lookAt, normal);
  splineCamera.quaternion.setFromRotationMatrix(splineCamera.matrix);
}
