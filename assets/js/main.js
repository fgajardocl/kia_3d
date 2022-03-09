'use strict';

/* global THREE, dat */

function main() {
    const canvas = document.querySelector('#scene');
    const renderer = new THREE.WebGLRenderer({ canvas });

    const fov = 45;
    const aspect = 2;  // the canvas default
    const near = 0.0001;
    const far = 10000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(40, 40, 40);
    camera.lookAt(0, 0, 0);

    let cameraPathGeometry;
    let cameraTargetPathGeometry;
    let storyPosition = 0.0;
    let pathPosition = THREE.Vector3(0, 0, 0);
    let targetPosition = THREE.Vector3(0, 0, 0);

    const cameraPath = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-10, 0, 0), new THREE.Vector3(10, 0, 0),

    ]);

    const cameraTargetPath = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-5, -5, -5), new THREE.Vector3(15, -15, 5),

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

    cameraPathGeometry = new THREE.TubeGeometry(cameraPath, 150, 0.5, 5, false);
    cameraTargetPathGeometry = new THREE.TubeGeometry(cameraTargetPath, 150, 0.5, 5, false);

    const pathMaterial = new THREE.MeshBasicMaterial({ color: 'blue', opacity: 0.3, wireframe: false, transparent: false });
    const pathMesh = new THREE.Mesh(cameraPathGeometry, pathMaterial);
    scene.add(pathMesh);

    const targetMaterial = new THREE.MeshBasicMaterial({ color: 'red', opacity: 0.3, wireframe: false, transparent: false });
    const targetMesh = new THREE.Mesh(cameraTargetPathGeometry, targetMaterial);
    scene.add(targetMesh);

    function onMouseWheel(event) {
        storyPosition += event.deltaY * 0.00005;
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

    {
        for (let i = -5; i < 5; i++) {
            for (let j = -5; j < 5; j++) {
                for (let k = -5; k < 5; k++) {
                    const cubeSize = 0.5;
                    const separation = 2;
                    const cubeGeo = new THREE.BoxBufferGeometry(cubeSize, cubeSize, cubeSize);
                    const randColor = Math.random() * 0xffffff;
                    const cubeMat = new THREE.MeshPhongMaterial({ color: randColor });
                    const mesh = new THREE.Mesh(cubeGeo, cubeMat);
                    mesh.position.set(
                        (cubeSize + separation) * i,
                        (cubeSize + separation) * j,
                        (cubeSize + separation * k)
                    );
                    scene.add(mesh);
                }
            }
        }
    }

    {
        const color = 0xFFFFFF;
        const light = new THREE.DirectionalLight(color, 1);
        const ambient = new THREE.AmbientLight(color, 0.5);
        const light2 = new THREE.DirectionalLight(color, 0.5);
        light.position.set(0, 10, 0);
        light.target.position.set(-5, 0, 0);
        light2.target.position.set(5, 0, 10);
        scene.add(light);
        scene.add(light.target);
        scene.add(light2);
        scene.add(ambient);
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
}

main();
