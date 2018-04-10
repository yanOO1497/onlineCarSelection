var speedX=0,speedY=0,posZ=500,flag=false;
var renderer,camera,scene,cube,width,height;

function initThree() {
    width = document.getElementById('canvas-frame').clientWidth;
    height = document.getElementById('canvas-frame').clientHeight;
    renderer = new THREE.WebGLRenderer({
        antialias : true
    });
    renderer.setSize(width, height);
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
    initObject();
    render();
}
threeStart();