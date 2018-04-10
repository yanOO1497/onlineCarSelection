
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
    camera.position.x = 100;
    camera.position.y = 100;
    camera.position.z = 1000;
    // camera.up.x = 0;
    // camera.up.y = 1;
    // camera.up.z = 0;
    // camera.lookAt({
    //     x : 0,
    //     y : 0,
    //     z : 100
    // });
}
var speedX=0,speedY=0,posZ=500,flag=false;
function rotateAroundWorldAxis(object, axis, radians) {
    var rotWorldMatrix = new THREE.Matrix4();
    rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
    rotWorldMatrix.multiply(object.matrix);
    object.matrix = rotWorldMatrix;
    object.rotation.setFromRotationMatrix(object.matrix);
}
function retateCube(prams) {
    if(prams.speedX){//围绕Y轴旋转
        if(prams.speedX>0){
            speedX=0.02;
        }else{
            speedX=-0.02;
        }
        var axis = new THREE.Vector3(0,1,0);//指定旋转轴，旋转向量，（该向量以旋转物体中心点为起始点）
        rotateAroundWorldAxis(cube,axis,speedX);//参数：需要旋转的物体，旋转向量，旋转弧度
    }
    if(prams.speedY){
        if(prams.speedY>0){
            speedY=0.02;
        }else{
            speedY=-0.02;
        }
        var axis = new THREE.Vector3(1,0,0);//指定旋转轴，旋转向量，（该向量以旋转物体中心点为起始点）
        rotateAroundWorldAxis(cube,axis,speedY);//参数：需要旋转的物体，旋转向量，旋转弧度
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
    var geometry = new THREE.CubeGeometry(180,180,180);
    var cubeMe = new THREE.MeshBasicMaterial({color: 0x00ff00});
    cube = new THREE.Mesh(geometry, cubeMe);
    scene.add(cube);

    //绘制x,y,z坐标轴
    var material = new THREE.LineBasicMaterial({
        color: 0x444444,
        opacity: 0.2
    });
    var line=function(x,y,z){
        var lineGeo=new THREE.Geometry();
        lineGeo.vertices.push(
            new THREE.Vector3(0,0,0),
            new THREE.Vector3(x,y,z)
        );//定义两个x方向上的点
        var line=new THREE.Line( lineGeo, material);
        scene.add( line);
    }
    line(500,0,0);
    line(0,500,0);
    line(0,0,500);
}

function render(){
    renderer.render(scene, camera);
}
function bindEvent() {
    var $render=$(renderer.domElement);
    var x,y,l;
    $render.on('mousedown',function (event) {
        x=event.clientX;
        y=event.clientY;
        flag=true;
    })
    $render.on('mousemove',function (event) {
        if(flag){
            if((event.clientX-x)!=0){//水平移动
                retateCube({speedX:(event.clientX-x)/100});
            }
            if((event.clientY-y)!=0){
                retateCube({speedY:(event.clientY-y)/100});
            }
        }
    })
    $render.on('mouseup',function () {
        console.log('mouseup');
        flag=false;
    })
    if(document.addEventListener){
        document.addEventListener('DOMMouseScroll',scrollFunc,false);
    }//W3C
    window.onmousewheel=document.onmousewheel=scrollFunc;//IE/Opera/Chrome
}
function scrollFunc(e) {//滚轮控制摄像机Z轴运动
    e=e || window.event;
    if(e.wheelDelta){//IE/Opera/Chrome  
        //自定义事件：编写具体的实现逻辑
        if(e.wheelDelta<0){
            if(posZ<800){
                posZ+=2;
            }
        }else {
            if(posZ>200){
                posZ-=2;
            }
        }
    }else if(e.detail){//Firefox  
        //自定义事件：编写具体的实现逻辑
        if(e.detail>0){
            if(posZ<800){
                posZ+=2;
            }
        }else {
            if(posZ>200){
                posZ-=2;
            }
        }
    }
    camera.position.z=posZ;
    render();
}

function threeStart() {
    initThree();
    bindEvent();
    initCamera();
    initScene();
    initLight();
    initObject();
    render();
}
// threeStart();