let fs = require('fs');

let images = require('image-size');


let option = {
    dirPath : '../images/',
    outputPath:'../scss/'
};

function DealImages(option){
    this.dirPath = option.dirPath;
    this.outputPath = option.outputPath;
    this.timer = null;
}

DealImages.prototype.init = function(){
    this.readAllImages();
    fs.watch(this.dirPath,(eventType,filename)=>{
        if(eventType){
            clearTimeout(this.timer);
            this.timer = setTimeout(()=>{
                this.readAllImages();
            },3000);
        }
    });
};

DealImages.prototype.readAllImages = function(){
    fs.readdir(this.dirPath,(err,data)=>{
        if(err){
            console.log(err);
            return false;
        }

        this.callback('writeStylesheet',data);
    });
};

DealImages.prototype.filterImages = function(data){

    let formatAry = ['bmp','png','jpeg','gif','jpg']

    let newAry = [];

    data.forEach((item,index)=>{

        let suffix = item.split('.')[1];

        if(formatAry.indexOf(suffix) != -1){ //  如果 judge 里面有 说明是图片
            newAry.push(item);
        }
    });

    return newAry;

};

DealImages.prototype.getSize = function(filePath){
    let size = images(filePath);

    return {
        width : size.width,
        height : size.height
    }
};

DealImages.prototype.template = function(w,h,fileName,fileNameAll){
    return `@mixin ${fileName}($size:100% auto){
  width:${w == 640? '100%' : 'r('+w + ')'};
  height:r(${h});
  background:url(../images/${fileNameAll}) no-repeat;
  background-size:$size;
}
`;
}

DealImages.prototype.templateWidth = function(w,fileName){
    return `@function ${fileName}-w(){
    @return r(${w});
}
`;
}

DealImages.prototype.templateHeight = function(h,fileName){
    return `@function ${fileName}-h(){
    @return r(${h});
}
`;
}

DealImages.prototype.writeStylesheet = function(data){

    let imagesAry = this.filterImages(data);

    let template = `$base:40;`;

    imagesAry.map((item,index)=>{

        let fileName = item.split('.')[0];

        let filePath = this.dirPath + item;

        let size = this.getSize(filePath);

        template += this.template(size.width,size.height,fileName,item);

        template += this.templateWidth(size.width,fileName);

        template += this.templateHeight(size.height,fileName);

    });

    let outputPath = this.outputPath + 'imagesStylesheet.scss';

    fs.writeFile(outputPath,template,(err)=>{
        if(err){
            console.log(err);
            return err;
        }
    });
};


DealImages.prototype.callback = function(strategy,data){
    this.strategies(strategy,data) || console.log(strategy + '您回调的策略对象不存在~');
};

DealImages.prototype.strategies = function (strategy,data){

    if(this[strategy]){

        this[strategy](data);

        return true;
    }

    return false;
};

let deal = new DealImages(option);
deal.init();
module.exports = deal;
