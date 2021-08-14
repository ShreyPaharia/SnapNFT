"use strict";
const loadscript = (scriptSrc, callback) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = scriptSrc;
    document.getElementsByTagName('head')[0].appendChild(script);
    script.onload = () => {
      // if (callback) callback();
      resolve();
    };
  })
};

// SETTINGS of this demo :
const SETTINGS = {
  maxFaces: 4, //max number of detected faces
};

// some globalz:
let THREECAMERA = null;

// callback: launched if a face is detected or lost
function detect_callback(faceIndex, isDetected){
  if (isDetected){
    console.log('INFO in detect_callback(): face n°', faceIndex, 'DETECTED');
  } else {
    console.log('INFO in detect_callback(): face n°', faceIndex, 'LOST');
  }
}

function create_libertyMaterial(url){
  return new THREE.MeshLambertMaterial({
    color: 0xadd7bf, // cyan oxidized bronze
    alphaMap: new THREE.TextureLoader().load(url+'/assets/libertyAlphaMapSoft512.png'),
    transparent: true,
    premultipliedAlpha: true
  });
}

function create_faceMaterial(){
  return new THREE.MeshBasicMaterial({
    color: 0x5da0a0, // cyan oxidized bronze a bit modified
    transparent: true,
    side: THREE.DoubleSide,
    premultipliedAlpha: false,
    blending: THREE.CustomBlending,
    blendSrc: THREE.SrcColorFactor,
    blendDst: THREE.OneFactor,
    blendEquation: THREE.AddEquation
  });
}

// build the 3D. called once when Jeeliz Face Filter is OK:
function init_threeScene(spec, url){
  const threeStuffs = JeelizThreeHelper.init(spec, detect_callback);
  
  function add_faceMesh(threeFaceMesh){
    threeFaceMesh.frustumCulled = false;
    threeFaceMesh.scale.multiplyScalar(0.37);
    threeFaceMesh.position.set(0,0.25,0.5);
    threeStuffs.faceObjects.forEach(function(faceObject){ //display the cube for each detected face
      faceObject.add(threeFaceMesh.clone());
    });
  }

  // IMPORT THE STATUE OF LIBERTY
  const libertyLoader = new  THREE.BufferGeometryLoader();
  libertyLoader.load(url+'/assets/liberty.json', function(libertyGeometry){
    console.log(" LOADED *************** liberty");
    JeelizThreeHelper.sortFaces(libertyGeometry, 'z', true);
    const libertyMesh = new THREE.Mesh(libertyGeometry, create_libertyMaterial(url));
    libertyMesh.renderOrder = 2;
    add_faceMesh(libertyMesh);
  });

  // IMPORT THE FACE MASK
  new THREE.BufferGeometryLoader().load(url+'/assets/libertyFaceMask.json', function(faceGeometry){
    console.log(" LOADED *************** libertyFaceMask");
    
    JeelizThreeHelper.sortFaces(faceGeometry, 'z', true);
    const faceMesh = new THREE.Mesh(faceGeometry, create_faceMaterial());
    faceMesh.renderOrder = 1;
    add_faceMesh(faceMesh);
  });

  // CREATE THE CAMERA
  THREECAMERA = JeelizThreeHelper.create_camera();

  // ADD LIGHTS
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  const dirLight = new THREE.DirectionalLight(0xffffee, 0.7);
  dirLight.position.set(0, 0.05, 1);
  threeStuffs.scene.add(ambientLight, dirLight);
} //end init_threeScene()

// Entry point, launched by body.onload():
async function main(url){
  console.log(" *********** Liberty jeeFaceFilterCanvas");
  const p1 = loadscript(url+"/helpers/JeelizResizer.js");
  const p2 = loadscript(url+"/helpers/JeelizThreeHelper.js");
  const p3 = loadscript(url+"/dist/jeelizFaceFilter.js");
  const p4 = loadscript(url+"/helpers/JeelizThreeGlassesCreator.js");
  const p5 = loadscript(url+"/libs/three/v112/three.min.js");

  await Promise.all([p1, p2, p3, p4, p5])
  console.log("************* completed loading all filess *****************");
  
  JEELIZFACEFILTER.init({
    canvasId: 'jeeFaceFilterCanvas',
    NNCPath: url+'/neuralNets/', // path of NN_DEFAULT.json file
    maxFacesDetected: SETTINGS.maxFaces,
    callbackReady: function(errCode, spec){
      if (errCode){
        console.log('AN ERROR HAPPENS. SORRY BRO :( . ERR =', errCode);
        return;
      }

      console.log('INFO: JEELIZFACEFILTER IS READY');
      init_threeScene(spec, url);
    }, //end callbackReady()

    // called at each render iteration (drawing loop):
    callbackTrack: function(detectState){
      JeelizThreeHelper.render(detectState, THREECAMERA);
    } //end callbackTrack()
  }); //end JEELIZFACEFILTER.init call
} //end main()