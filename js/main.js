var renderer;
function initThree() {
    width = document.getElementById('canvas-frame').clientWidth;
    height = document.getElementById('canvas-frame').clientHeight;
    renderer = new THREE.WebGLRenderer({
        antialias : true
    });
    renderer.setSize(width, height);
    document.getElementById('canvas-frame').appendChild(renderer.domElement);
    // renderer.setClearColor(0xFFFFFF, 1.0);
}
var stats;
function initStats() {//初始化性能监视器Stats
    stats = new Stats();
    stats.setMode(1); // 0: fps, 1: ms
// 将stats的界面对应左上角
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    document.body.appendChild( stats.domElement );
    setInterval( function () {
        stats.begin();
        // 你的每一帧的代码
        stats.end();
    }, 1000 / 60 );
}
var camera;
function initCamera() {
    camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 500;
    camera.up.x = 0;
    camera.up.y = 1;
    camera.up.z = 0;
    // camera.lookAt({
    //     x : 0,
    //     y : 0,
    //     z : -1
    // });
}
var speedX=0;
function setCamera(speedX) {
    if(speedX){
        speedX+=0.02;
        console.log(speedX);
        camera.rotation.y=speedX;
        camera.position.set(500*Math.sin(speedX),0,500*Math.cos(speedX));
    }
    render();
}
var scene;
function initScene() {
    scene = new THREE.Scene();
}

var light;

function initLight() {
    // 半球光就是渐变的光；
    // 第一个参数是天空的颜色，第二个参数是地上的颜色，第三个参数是光源的强度
    hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9);

    // 方向光是从一个特定的方向的照射
    // 类似太阳，即所有光源是平行的
    // 第一个参数是关系颜色，第二个参数是光源强度
    shadowLight = new THREE.DirectionalLight(0xffffff, .9);
    // 设置光源的方向。
    // 位置不同，方向光作用于物体的面也不同，看到的颜色也不同
    shadowLight.position.set(150, 350, 350);

    // 开启光源投影
    shadowLight.castShadow = true;

    // 定义可见域的投射阴影
    shadowLight.shadow.camera.left = -400;
    shadowLight.shadow.camera.right = 400;
    shadowLight.shadow.camera.top = 400;
    shadowLight.shadow.camera.bottom = -400;
    shadowLight.shadow.camera.near = 1;
    shadowLight.shadow.camera.far = 1000;

    // 定义阴影的分辨率；虽然分辨率越高越好，但是需要付出更加昂贵的代价维持高性能的表现。
    shadowLight.shadow.mapSize.width = 2048;
    shadowLight.shadow.mapSize.height = 2048;

    // 为了使这些光源呈现效果，只需要将它们添加到场景中
    scene.add(hemisphereLight);
    scene.add(shadowLight);

}
var cube;
function initObject() {
    //绘制正方形
    var geometry = new THREE.CubeGeometry(80,80,80);
    var cubeMe = new THREE.MeshBasicMaterial({color: 0x00ff00});
    cube = new THREE.Mesh(geometry, cubeMe);
    scene.add(cube);
    //绘制线条
    var material = new THREE.LineBasicMaterial({
        color: 0x444444,
        opacity: 0.2
    });
    var lineGeo= new THREE.CubeGeometry();
    lineGeo.vertices.push(
        new THREE.Vector3(-500,0,0),
        new THREE.Vector3(500,0,0)
    );//定义两个x方向上的点
    var createLine = function (x,y,isVertical) {
        var line = new THREE.Line( lineGeo, material);
        if (x) {
            line.position.x = x;
        }
        if (y) {
            line.position.y = y;
        }
        if (isVertical) {
            line.rotation.z = 90 * Math.PI / 180;
        }
        scene.add( line );
    };//绘制线条函数

    //绘制网格
    for (var i = 1, length = 22, half = length / 2; i < length; i++) {
        createLine(0, (i - half) * 20);
        createLine((i - half) * 20, 0, true);
    }

}

function render(){
    // renderer.clear();

    renderer.render(scene, camera);
    // requestAnimationFrame(render);
}
function bindEvent() {
    var $render=$(renderer.domElement);
    var flag=false;
    var x,y,l;
    $render.on('mousedown',function (event) {
        x=event.clientX;
        console.log('mousedown');
        flag=true;

    })
    $render.on('mousemove',function (event) {
        if(flag){
            // console.log('mousemove');
            l=(event.clientX-x)/100;
            console.log(l);
            setCamera(l);
        }
    })
    $render.on('mouseup',function () {
        console.log('mouseup');
        flag=false;
    })
}
function threeStart() {
    initThree();
    // initStats();
    bindEvent();
    initCamera();
    initScene();
    initLight();
    initObject();
    render();
}
// threeStart();