var LAppDefine = {   
  
    //这里配置canvsa元素的id
    CANVAS_ID : "live2d",

    //是否允许拖拽，默认为true
    IS_DRAGABLE : true,

    /**
     *  模型定义
        自定义配置模型，同一数组内放置同个模型的不同皮肤，换肤时按照顺序依次显示
        这里请用相对路径配置
     */
    MODELS:
    [
        ["model/22/index.json"]
    ]
};

this.canvas = document.getElementById(LAppDefine.CANVAS_ID);
if (this.canvas.addEventListener) {
    this.canvas.addEventListener("click", mouseEvent, false);
    this.canvas.addEventListener("mousedown", mouseEvent, false);
    this.canvas.addEventListener("mouseup", mouseEvent, false);
    this.canvas.addEventListener("mousemove", mouseEvent, false);
}

var isDragging = false;
var mouseOffsetx = 0;
var mouseOffsety = 0;
function mouseEvent(e) {
    e.preventDefault();
    if (e.type == "mousedown") {
        if ("button" in e && e.button != 0){
            return;
        }
        isDragging = true;
        mouseOffsetx = e.pageX - document.getElementById(LAppDefine.CANVAS_ID).offsetLeft;
        mouseOffsety = e.pageY - document.getElementById(LAppDefine.CANVAS_ID).offsetTop;
    } else if (e.type == "mousemove") {
        if(isDragging == true) {
            var movex = e.pageX - mouseOffsetx;
            var movey = e.pageY - mouseOffsety;
            if(movex > window.innerWidth - document.getElementById(LAppDefine.CANVAS_ID).width)
                movex = window.innerWidth - document.getElementById(LAppDefine.CANVAS_ID).width;
            if(movex < 0) movex = 0;
            if(movey > window.innerHeight - document.getElementById(LAppDefine.CANVAS_ID).height)
                movey = window.innerHeight - document.getElementById(LAppDefine.CANVAS_ID).height;
            if(movey < 0) movey = 0;
            if(LAppDefine.IS_DRAGABLE) {
                document.getElementById(LAppDefine.CANVAS_ID).style.left = movex + "px";
                document.getElementById(LAppDefine.CANVAS_ID).style.top = movey + "px";
            }
        }
    } else if (e.type == "mouseup") {
        if ("button" in e && e.button != 0) return;
        isDragging = false;
    }
}