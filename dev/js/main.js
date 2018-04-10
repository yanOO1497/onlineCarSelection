var speedX=0,speedY=0,flag=false;
var renderer,camera,scene,cube,width,height;

function initThree() {
    width = document.getElementById('canvas-frame').clientWidth;
    height = document.getElementById('canvas-frame').clientHeight;
    renderer = new THREE.WebGLRenderer({
        antialias : true
    });
    renderer.setSize(width, height);
    renderer.shadowMapEnabled = true;
    document.getElementById('canvas-frame').appendChild(renderer.domElement);
}
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
function initScene() {
    scene = new THREE.Scene();
}

function initObject() {
    //绘制正方形
    let cueGeometry = new THREE.CubeGeometry(180,180,180,6,6,6);
    let lamMater = new THREE.MeshLambertMaterial  ({color: 0x00ff00,opacity:0.5,emissive: 0xff0000});
    let normalMater=new THREE.MeshNormalMaterial();
    let texture = THREE.ImageUtils.loadTexture('./images/plane.png',{},function () {
        render();
    });
    let textMater=new THREE.MeshLambertMaterial({
        map: texture
    });
    let phoneMater=new THREE.MeshPhongMaterial({
        color: 0xff0000,
        specular: 0xffff00,
        shininess: 100
    });
    cube = new THREE.Mesh(cueGeometry, textMater);
    scene.add(cube);
    let cube2 = new THREE.Mesh(cueGeometry, normalMater);
    cube2.position.x=-300;
    scene.add(cube2);
    //绘制球体
    let spGeo=new THREE.SphereGeometry(80,10,10,6,6,6);
    let sphere= new THREE.Mesh(spGeo, phoneMater);
    sphere.position.x=300;
    scene.add(sphere);
    //绘制x,y,z坐标轴
    let material = new THREE.LineBasicMaterial({
        color: 0x444444,
        opacity: 0.2
    });
    let line=function(x,y,z){
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

    //绘制地面


}
function bindEvent() {
    /**
     * 鼠标拖动控制物体旋转
     * */
    let  $render=$(renderer.domElement);
    let x,y;
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
    });

    //鼠标滚动控制摄像机z轴方向运动，距离远近
    if(document.addEventListener){
        document.addEventListener('DOMMouseScroll',scrollFunc,false);
    }//W3C
    window.onmousewheel=document.onmousewheel=scrollFunc;//IE/Opera/Chrome

    //全局监听键盘事件,键盘控制摄像机漫游
    $(document).keydown(function(event){
        let code=event.keyCode;
        switch (code){
            case 87:
            case 38:
                camera.position.y-=10;break;//摄像机向下，物体向上
            case 83:
            case 40:
                camera.position.y+=10;break;//摄像机向上，物体向下
            case 65:
            case 37:
                camera.position.x-=10;break;//摄像机向右，物体向左
            case 68:
            case 39:
                camera.position.x+=10;break;//摄像机向左，物体向右
        }
        render();
    });
}
function scrollFunc(e) {//滚轮控制摄像机Z轴运动
    e=e || window.event;
    let pos=0;
    if(e.wheelDelta){//IE/Opera/Chrome  
        //自定义事件：编写具体的实现逻辑
        if(e.wheelDelta<0){
            pos+=2;
        }else {
            pos-=2;
        }
    }else if(e.detail){//Firefox  
        //自定义事件：编写具体的实现逻辑
        if(e.detail>0){
            pos+=2;
        }else {
            pos-=2;
        }
    }
    camera.position.z+=pos;
    render();
}
var light,light2,light3;
function initLight() {
    //平行光
    light = new THREE.DirectionalLight(0xFFFFFF);
    light.position.set(100, 299, 0).normalize();
    scene.add(light);
    //环境光
    light2 = new THREE.AmbientLight(0x999999);
    scene.add(light2);
    //点光源
    light3 = new THREE.SpotLight(0xFFFFFF);
    light3.position.set(0, 0, 100);
    // scene.add(light3);

}
let clock,model3D;
function load3D() {
    let loader = new THREE.JSONLoader();
    loader.load('./bf109e/bf109e.json', function (geometry, materials) {
        model3D = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
        scene.add(model3D);
    });
    // let animation = new THREE.Animation(model3D, model3D.geometry.animations[0]);
    // animation.play();
    // clock = new THREE.Clock();
}

function render(){
    // let delta = clock.getDelta();
    // THREE.AnimationHandler.update(delta);
    renderer.render(scene, camera);
    // requestAnimationFrame(render);
    //循环渲染
}

function threeStart() {
    initThree();
    initCamera();
    initScene();
    initLight();
    initObject();
    bindEvent();
    // load3D();
    render();
}
threeStart();