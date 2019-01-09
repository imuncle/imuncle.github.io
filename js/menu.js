$('.navi-button').click(function(){
  if($('.main').css("transform") == "matrix(1, 0, 0, 1, 0, 0)")
  {
    $('.main').css("transform","translateX(-150px)");
    $('.main-navication span').css("opacity","1");
    $('.main-navication').css("opacity","1");
    $('.main-navication span').css("transform","translateX(-10px)");
  }else {
    $('.main').css("transform","translateX(0)");
    $('.main-navication span').css("opacity","0");
    $('.main-navication').css("opacity","0");
    $('.main-navication span').css("transform","translateX(-50px)");
  }
});

function WeChart(command)
{
  if(command == "show") {
    $('#wechart-qrcode').css("opacity","1");
    $('#wechart-qrcode').css("transform","translateY(0)");
  } else if(command == "hide")
  {
    $('#wechart-qrcode').css("opacity","0");
    $('#wechart-qrcode').css("transform","translateY(-20px)");
  }
}