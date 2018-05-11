(function($){
  "use strict";
  $(window).on("load",function(){
      $("#status").fadeOut();
      $("#preloader").delay(450).fadeOut();
  });

  $(document).ready(function(){
    var bodyEl = document.body,
    openbtn = document.getElementById('open-button'),
    closebtn = document.getElementById('close-button'),
    isOpen = false;
    
    function toggleMenu(){
      if(isOpen){
        classie.remove(bodyEl,'show-menu');
      }else{
        classie.add(bodyEl,'show-menu');
      }
      isOpen = !isOpen;
    }

    function initEvents(){
      openbtn.addEventListener('click',toggleMenu);
      closebtn.addEventListener('click',toggleMenu);
    }

    function inits(){
      initEvents();
    }

    inits();

    $(".typed").typed({
      strings: [
        "我叫张龙", 
        "是一个程序猿", 
        "简单、喜静"],
      typeSpeed: 200,
      backDelay: 900,
      loop: true
    });

    $('.owl-carousel-about').owlCarousel({
      autoPlay:3000,//3秒自动播放
      items:1,//每页显示个数
      itemsDesktop:[1199,1],
      itemsDesktopSmall:[979,1],
      itemsTablet:[768,1],
      itemsMobile:[479,1],
      autoPlay:false,
      baseClass:"owl-carousel",
      theme:"owl-theme"
    });
  });
})(jQuery);