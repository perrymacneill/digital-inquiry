var container, scene, camera, renderer, composer, light;

var shaderTime = 0;
var badTVParams, badTVPass;
var staticParams, staticPass;
var rgbParams, rgbPass;
var filmParams, filmPass;
var renderPass, copyPass;


function init() {
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000000, 1, 1000);

  var SCREEN_WIDTH = window.innerWidth,
    SCREEN_HEIGHT = window.innerHeight;
  var VIEW_ANGLE = 45,
    ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT,
    NEAR = 0.1,
    FAR = 20000;
  camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
  scene.add(camera);
  camera.position.set(0, 0, 200);
  camera.lookAt(scene.position);

  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

  container = document.getElementById('container');
  container.appendChild(renderer.domElement);

  renderPass = new THREE.RenderPass(scene, camera);
  badTVPass = new THREE.ShaderPass(THREE.BadTVShader);
  rgbPass = new THREE.ShaderPass(THREE.RGBShiftShader);
  filmPass = new THREE.ShaderPass(THREE.FilmShader);
  staticPass = new THREE.ShaderPass(THREE.StaticShader);
  copyPass = new THREE.ShaderPass(THREE.CopyShader);

  scene.add(new THREE.AmbientLight(0x222222));
  light = new THREE.DirectionalLight(0xffffff);
  light.position.set(1, 1, 1);
  scene.add(light);
  composer = new THREE.EffectComposer(renderer);
  composer.addPass(new THREE.RenderPass(scene, camera));

  composer.addPass(filmPass);
  composer.addPass(badTVPass);
  composer.addPass(rgbPass);
  composer.addPass(staticPass);
  composer.addPass(copyPass);
  copyPass.renderToScreen = true;

  window.addEventListener('resize', onWindowResize, false);

  addToCanvas(['WHAT\'S REALLY KEEPING YOU', 'HERE?', 'FROM WHAT YOU WANT?',
    'FROM BEING WHERE YOU WANT?', 'FROM BEING WHO YOU WANT?'
  ]);
}

function addToCanvas(items) {
  for (var i = 0; i <= items.length; i++) {
    setObjects(items, i);
  }
}

function setObjects(items, i) {
  setTimeout(function() {
    if (i === items.length) {
      for (var j = 0; j < items.length; j++) {
        var meshObject = scene.getObjectByName('mesh' + j);
        scene.remove(meshObject);
      }
      addToCanvas(items);
      return;
    }
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.font = "16px Arial";
    context.fillStyle = "white";
    if (i !== 0) {
      context.textAlign = 'right';
    }
    var item = items[i];
    if (i === 0) {
      context.fillText(item, 15, 20 * (i + 1));
    } else {
      context.fillText(item, 290, 20 * (i + 1));
    }

    var texture = new THREE.Texture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.needsUpdate = true;

    var material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide
    });
    material.transparent = true;

    var mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(canvas.width, canvas.height),
      material
    );
    mesh.position.set(0, 0, 0);
    mesh.name = 'mesh' + i;
    scene.add(mesh);
  }, (i + 1) * 1000);
}

function animate() {
  shaderTime += 0.1;
  badTVPass.uniforms['time'].value = shaderTime;
  filmPass.uniforms['time'].value = shaderTime;
  staticPass.uniforms['time'].value = shaderTime;
  requestAnimationFrame(animate);
  composer.render(0.1);
}

function render() {
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}
