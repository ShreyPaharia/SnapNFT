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


// import JeelizThreeHelper from "./helpers/JeelizThreeHelper"
// import JEELIZFACEFILTER from "./dist/jeelizFaceFilter.module"
// import JeelizResizer from "./helpers/JeelizResizer"
let THREECAMERA = null;

// callback: launched if a face is detected or lost.
function detect_callback(faceIndex, isDetected) {
  if (isDetected) {
    console.log('INFO in detect_callback(): DETECTED');
  } else {
    console.log('INFO in detect_callback(): LOST');
  }
}

// build the 3D. called once when Jeeliz Face Filter is OK:
function init_threeScene(spec, url) {
  const threeStuffs = JeelizThreeHelper.init(spec, detect_callback);

  // improve WebGLRenderer settings:
  threeStuffs.renderer.toneMapping = THREE.ACESFilmicToneMapping;
  threeStuffs.renderer.outputEncoding = THREE.sRGBEncoding;

  // CREATE THE GLASSES AND ADD THEM
  const r = JeelizThreeGlassesCreator({
    envMapURL: url + "/assets/envMap.jpg",
    frameMeshURL: url + "/assets/glassesFramesBranchesBent.json",
    lensesMeshURL: url + "/assets/glassesLenses.json",
    occluderURL: url + "/assets/face.json"
  });

  // vertical offset:
  const dy = 0.07;

  // create and add the occluder:
  r.occluder.rotation.set(0.3, 0, 0);
  r.occluder.position.set(0, 0.03 + dy,-0.04);
  r.occluder.scale.multiplyScalar(0.0084);
  threeStuffs.faceObject.add(r.occluder);
  
  // create and add the glasses mesh:
  const threeGlasses = r.glasses;
  //threeGlasses.rotation.set(-0.15,0,0); / /X neg -> rotate branches down
  threeGlasses.position.set(0, dy, 0.4);
  threeGlasses.scale.multiplyScalar(0.006);
  threeStuffs.faceObject.add(threeGlasses);

  // add a debug cube:
  /* const sc = 0.1;
  const debugCube = new THREE.Mesh(new THREE.BoxGeometry(sc,sc,sc), new THREE.MeshNormalMaterial());
  threeStuffs.faceObject.add(debugCube); //*/

  // CREATE THE CAMERA:
  THREECAMERA = JeelizThreeHelper.create_camera();
} // end init_threeScene()

// entry point:
async function main(url){
  console.log(" *********** jeeFaceFilterCanvas");
  const p1 = loadscript(url+"/helpers/JeelizResizer.js");
  const p2 = loadscript(url+"/helpers/JeelizThreeHelper.js");
  const p3 = loadscript(url+"/dist/jeelizFaceFilter.js");
  const p4 = loadscript(url+"/helpers/JeelizThreeGlassesCreator.js");
  const p5 = loadscript(url+"/libs/three/v112/three.min.js");

  await Promise.all([p1, p2, p3, p4, p5])
  console.log("************* completed loading all filess *****************");
  
    JeelizResizer.size_canvas({
      canvasId: 'jeeFaceFilterCanvas',
      callback: function(isError, bestVideoSettings){
        init_faceFilter(bestVideoSettings, url);
      }
    })
}



function init_faceFilter(videoSettings, url){
  JEELIZFACEFILTER.init({
    followZRot: true,
    canvasId: 'jeeFaceFilterCanvas',
    NNCPath: url +'/neuralNets/', // path of NN_DEFAULT.json file
    maxFacesDetected: 1,
    callbackReady: function(errCode, spec){
      if (errCode){
      console.log('AN ERROR HAPPENS. ERR =', errCode);
      return;
      }

      console.log('INFO: JEELIZFACEFILTER IS READY');
      init_threeScene(spec, url);
    },

    // called at each render iteration (drawing loop):
    callbackTrack: function(detectState){
      JeelizThreeHelper.render(detectState, THREECAMERA);
    }
  }); //end JEELIZFACEFILTER.init call
}

