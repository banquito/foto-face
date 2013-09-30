(function () {

  $(document).ready(function() {

    $("#approve").click(function() {
      $("form").attr("action", "approve");
    });

    $("#reject").click(function() {
      $("form").attr("action", "reject");
    });

    $(".iniline").fancybox({
      titleShow: false,
      showNavArrows: false,
      padding: 0,
      scrolling: "no"
    });
  });

})();
