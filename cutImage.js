(function($){
  'use strict'
  var cutImg = function(img){
    //重新获取原图片，以获取真实的尺寸
    var trueImg = new Image();
    trueImg.src = img.getAttribute("src");

    var CUTIMG = new Object();
    var _outerWidth = img.width;
    var _outerHeight = img.height;
    var _outerOffsetX = img.offsetLeft;
    var _outerOffsetY = img.offsetTop;

    var cutbox = document.createElement("div");
    cutbox.class = "cutbox";
    var _innerWidth = _outerWidth * 0.3;
    var _innerHeight = _outerHeight * 0.3;
    cutbox.style.width = _innerWidth+"px";
    cutbox.style.height = _innerHeight+"px";
    cutbox.style.border = "1px solid #bbb";
    cutbox.style.position = "absolute";
    cutbox.style.left = _outerOffsetX + _outerWidth/4+"px";
    cutbox.style.top = _outerOffsetY + _outerHeight/4+"px";
    cutbox.style.cursor = "move";
    cutbox.style.resize = "both";
    cutbox.style.overflow = "auto";
    document.getElementsByTagName("body")[0].appendChild(cutbox);

    _moveCutImg(cutbox,_outerOffsetY,_outerOffsetX+_outerWidth,_outerOffsetY+_outerHeight,_outerOffsetX);

    var canvas = _convertImageToCanvas(img);

    /*获取新图片的imgData*/
    CUTIMG.getNewImg = function(){
      return _getAfterCutImg(canvas,cutbox,img,trueImg);
    }

    /*获取新图片的url，可用于<img>的src*/
    CUTIMG.getImgURL = function(){
      var newCanvas = document.createElement("canvas");
      newCanvas.getContext("2d").putImageData(_getAfterCutImg(canvas,cutbox,img,trueImg),0,0);
      return newCanvas.toDataURL();
    }
    /*获取新图片的blob*/
    CUTIMG.getImgBlob = function(){
      var result;
      var newCanvas = document.createElement("canvas");
      newCanvas.getContext("2d").putImageData(_getAfterCutImg(canvas,cutbox,img,trueImg),0,0);
      newCanvas.toBlob(function(blob){
        result = blob;
      },"image/png",1);
      return result;
    }

    // CUTIMG = {getNewImg:getNewImg,getImgURL:getImgURL,getImgBlob:getImgBlob};
    // _getImgBlob();
    return CUTIMG;
  }
  // 把image 转换为 canvas对象
  function _convertImageToCanvas(image) {
      // 创建canvas DOM元素，并设置其宽高和图片一样
      var canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      // 坐标(0,0) 表示从此处开始绘制，相当于偏移。
      canvas.getContext("2d").drawImage(image, 0, 0);

      return canvas;
  }

  function _getAfterCutImg(canvas,cutbox,img,trueImg){
    var x = cutbox.offsetLeft -  img.offsetLeft;
    var y = cutbox.offsetTop -  img.offsetTop;
    var widthPercent;
    var heightPercent;
    //计算图片的实际长宽度，偏差值通过比例计算
    widthPercent = trueImg.width / img.offsetWidth;
    heightPercent = trueImg.height / img.offsetHeight;
    var newImg = canvas.getContext("2d").getImageData(x*widthPercent,y*heightPercent,cutbox.offsetWidth*widthPercent,cutbox.offsetHeight*heightPercent);
    return newImg;

  }

  var _moveCutImg = function(cutbox,topLimit,rightLimit,bottomLimit,leftLimit){ //参数为真实图片的上下左右边际
    var positionX;
    var positionY;
    var body = document.getElementsByTagName("body")[0];
    var initX;
    var initY;
    var lastclientX;
    var lastclientY;
    initX = cutbox.offsetLeft;
    initY = cutbox.offsetTop;
    addEventHandler(cutbox,"mousedown",mousedown);

    function mousedown(e){
      positionX = e.clientX - cutbox.offsetLeft;
      positionY = e.clientY - cutbox.offsetTop;
      lastclientX = e.clientX;
      lastclientY = e.clientY;
      if(positionX-cutbox.offsetWidth > -10 && positionX-cutbox.offsetWidth < 10 && positionY-cutbox.offsetHeight > -10 && positionY-cutbox.offsetHeight<10){

      }else{
        addEventHandler(document,"mousemove",mousemove);
        addEventHandler(document,"mouseup",mouseup);
      }

      noUserSelect(body);
    }

    function mousemove(e){
      var nowX = e.clientX - positionX;
      var nowY = e.clientY - positionY;
      // console.log("translate("+(e.clientX - lastclientX)+"px,0)");
      // console.log("translate(0,"+(e.clientY - lastclientY)+"px)");
      if((nowX< (rightLimit-cutbox.offsetWidth)) && (nowX > leftLimit)){
        cutbox.style.left = nowX +"px";
        // _setTransform(cutbox,"translate("+(e.clientX - lastclientX)+"px,0)");
      }
      if((nowY< (bottomLimit-cutbox.offsetHeight)) && (nowY > topLimit)){
        cutbox.style.top = nowY +"px";
        // _setTransform(cutbox,"translate(0,"+(e.clientY - lastclientY)+"px)");
        // lastclientX = e.clientX;
        // lastclientY = e.clientY;
      }
    }

    function mouseup(){
      removeEventHandler(document,"mousemove",mousemove);
      removeEventHandler(document,"mouseup",mouseup);
      userSelect(body);
    }
    //在拖拽的过程中，user-select要取消
    function noUserSelect(obj){
      obj.style.WebkitUserSelect = "none";
      obj.style.MozUserSelect = "none";
      obj.style.OUserSelect = "none";
      obj.style.UserSelect = "none";
    }

    function userSelect(obj){
      obj.style.WebkitUserSelect = "text";
      obj.style.MozUserSelect = "text";
      obj.style.OUserSelect = "text";
      obj.style.UserSelect = "text";
    }

    //给元素增加事件监听
    function addEventHandler(obj, type, func) {
      if (window.attachEvent) {
        obj.attachEvent("on" + type, func);
      }
      else if (window.addEventListener) {
        obj.addEventListener(type, func);
      }
      else{
        console.log ("add event error");
      }
    }
    //给元素取消事件监听
    function removeEventHandler(obj, type, func) {
      if (window.detachEvent) {
        obj.detachEvent("on" + type, func);
      }
      else if (window.removeEventListener) {
        obj.removeEventListener(type, func);
      }
      else{
        console.log ("remove event error");
      }
    }

    function _setTransform(obj,str){
      cutbox.style.transform = str;
      cutbox.style.MsTransform = str;
      cutbox.style.WebkitTransform = str;
      cutbox.style.OTransform = str;
      cutbox.style.MozTransform = str;
    }
  }

  if (typeof define === 'function' && define.amd) {
    define(function () {
      return cutImg
    })
  } else if (typeof module === 'object' && module.exports) {
    module.exports = cutImg
  } else {
    $.cutImg = cutImg
  }
}(this));

