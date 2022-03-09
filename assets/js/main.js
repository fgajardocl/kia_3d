'use strict';

/* global THREE, dat */

function main() {
    const canvas = document.querySelector('#scene');
    const renderer = new THREE.WebGLRenderer({ canvas });
    const loader = new THREE.GLTFLoader();

    const fov = 45;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 10000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 2000, 3500);
    camera.lookAt(0, 0, 1000);

    let cameraPathGeometry;
    let cameraTargetPathGeometry;
    let storyPosition = 0.0;
    let pathPosition = THREE.Vector3(0, 0, 0);
    let targetPosition = THREE.Vector3(0, 0, 0);

    const cameraPath = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 500, 2500),
        new THREE.Vector3(0, 500, 1500),
        new THREE.Vector3(1300, 500, 1000),
        new THREE.Vector3(1300, 500, 0),
        new THREE.Vector3(500, 500, -1000),
        new THREE.Vector3(500, 500, -1500),
        new THREE.Vector3(-500, 500, -2000),

    ]);

    const cameraTargetPath = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-400, 500, 1500),
        new THREE.Vector3(-200, 500, 1000),
        new THREE.Vector3(200, 500, 500),
        new THREE.Vector3(-200, 500, -1200),
        new THREE.Vector3(-600, 500, -1500),
        new THREE.Vector3(-1400, 500, -1800),

    ]);

    function updateCamera() {
        camera.updateProjectionMatrix();
    }

    const gui = new dat.GUI();
    gui.add(camera, 'fov', 1, 180).onChange(updateCamera);

    // const controls = new THREE.OrbitControls(camera, canvas);
    // controls.target.set(0, 5, 0);
    // controls.enableDamping=true;
    // controls.update();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('white');

    cameraPathGeometry = new THREE.TubeGeometry(cameraPath, 50, 2, 4, false);
    cameraTargetPathGeometry = new THREE.TubeGeometry(cameraTargetPath, 150, 10, 30, false);

    const pathMaterial = new THREE.MeshBasicMaterial({ color: 'blue', opacity: 1, wireframe: false, transparent: true });
    const pathMesh = new THREE.Mesh(cameraPathGeometry, pathMaterial);
    scene.add(pathMesh);

    const targetMaterial = new THREE.MeshBasicMaterial({ color: 'red', opacity: 1, wireframe: false, transparent: true });
    const targetMesh = new THREE.Mesh(cameraTargetPathGeometry, targetMaterial);
    scene.add(targetMesh);

    function onMouseWheel(event) {
        storyPosition += event.deltaY * 0.00008;
        console.log(storyPosition);

        pathPosition = cameraPathGeometry.parameters.path.getPointAt(storyPosition);
        targetPosition = cameraTargetPathGeometry.parameters.path.getPointAt(storyPosition);

        console.log(pathPosition);
        console.log(targetPosition);
        console.log(camera.target);

        camera.position.x = pathPosition.x;
        camera.position.y = pathPosition.y;
        camera.position.z = pathPosition.z;

        camera.lookAt(targetPosition);

    }

    // {
    //     for (let i = -5; i < 5; i++) {
    //         for (let j = -5; j < 5; j++) {
    //             for (let k = -5; k < 5; k++) {
    //                 const cubeSize = 0.5;
    //                 const separation = 2;
    //                 const cubeGeo = new THREE.BoxBufferGeometry(cubeSize, cubeSize, cubeSize);
    //                 const randColor = Math.random() * 0xffffff;
    //                 const cubeMat = new THREE.MeshPhongMaterial({ color: randColor });
    //                 const mesh = new THREE.Mesh(cubeGeo, cubeMat);
    //                 mesh.position.set(
    //                     (cubeSize + separation) * i,
    //                     (cubeSize + separation) * j,
    //                     (cubeSize + separation * k)
    //                 );
    //                 scene.add(mesh);
    //             }
    //         }
    //     }
    // }

    {
        // const color = 0xFFFFFF;
        // const light = new THREE.DirectionalLight(color, 1);
        // const ambient = new THREE.AmbientLight(color, 0.5);
        // const light2 = new THREE.DirectionalLight(color, 0.5);
        // light.position.set(0, 500, 0);
        // light.target.position.set(-5, 500, 0);
        // light2.target.position.set(5, 0, 10);
        // scene.add(light);
        // scene.add(light.target);
        // scene.add(light2);
        // scene.add(ambient);

        const light = new THREE.AmbientLight( 0xffffff ); // soft white light
        scene.add( light );
    }

    {
        

        loader.load(
            // resource URL
            'assets/models/show01.glb',
            // called when the resource is loaded
            function ( gltf ) {
        
                // const texture = new THREE.TextureLoader().load( 'assets/textures/showtest01.png' );
                // const material = new THREE.MeshBasicMaterial( { map: texture } );
                // console.info(gltf);
				// mesh = new THREE.Mesh( gltf.scene, material );

                scene.add( gltf.scene );
        
                gltf.animations; // Array<THREE.AnimationClip>
                gltf.scene; // THREE.Group
                gltf.scenes; // Array<THREE.Group>
                gltf.cameras; // Array<THREE.Camera>
                gltf.asset; // Object
        
            },
            // called while loading is progressing
            function ( xhr ) {
        
                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        
            },
            // called when loading has errors
            function ( error ) {
        
                console.log( 'An error happened' );
        
            }
        );
    }

    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    function render() {

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        // controls.update();
        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
    window.addEventListener('wheel', onMouseWheel, false);


    document.onkeydown = checkKey;
    function checkKey(e) {

        e = e || window.event;

        var step = 80;
        var stepRotation = 0.1;
        if (e.keyCode == '38') {//up
            camera.position.z -= step;
        }
        else if (e.keyCode == '40') {//down
            camera.position.z += step;
        }
        else if (e.keyCode == '37') {//left
            camera.rotation.y += stepRotation;
        }
        else if (e.keyCode == '39') {//right
            camera.rotation.y -= stepRotation;
        }

    }
}

main();
