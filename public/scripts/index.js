(function () {

  var showSection = function(selector) {
    $("section").hide();
    $(selector).show();
  }

  var showSections = function() {
    $("#cmdSubiTuFoto").click(function(event) {
      event.preventDefault(event);
      showSection("#subi-tu-foto-1");
    });
    $("#cmdUpload").click(function(event) {
      event.preventDefault();
      showSection("#subi-tu-foto-2");
    });
    $("#cmdMiraLasFotos").click(function(event) {
      event.preventDefault();
      showSection("#mira-las-fotos");
    });
    $("#cmdMecanica").click(function(event) {
      event.preventDefault();
      showSection("#mecanica");
    });
    $("#cmdPremios").click(function(event) {
      event.preventDefault();
      showSection("#premios");
    });
    $("#cmdBases").click(function(event) {
      event.preventDefault();
      showSection("#bases");
    });
  };

  var validateFormUpload = function() {
    $(".subir").click(function(event) {
      event.preventDefault();
      $("#upload-foto").submit();
    });

    $("#upload-foto").validate({
      submitHandler: function(form) {
        form.submit();
      },
      rules: {
        nombre: "required",
        apellido: "required",
        ciudad: "required",
        mail: {
          required: true,
          email: true
        },
        image: {
          required: true,
          accept: "image/*"
        }
      },
      messages: {
        nombre: "*",
        apellido: "*",
        ciudad: "*",
        mail: {
          required: "*",
          email: "@"
        },
        image: {
          required: "*",
          accept: "!"
        }
      }
    });
  };

  var showMyImage = function() {
    if(window.location.href.indexOf("#miFoto") >= 0) {
      showSection("#mi-foto");
    }
  };

  var lighBoxImages = function() {
    $(".iniline").fancybox({
      titleShow: false,
      showNavArrows: false,
      padding: 0,
      scrolling: "no"
    });
  };

  var paginateImages = function() {
    lighBoxImages();
    var page = 1;
    var pagesCount = $("#paginador .next").attr("data-count");

    if (pagesCount > 1) {
      $("#paginador .next img").attr("src", "/images/right-on.png");
    }

    $("#paginador .prev").click(function (event) {
      event.preventDefault();
      if (page > 1) {
        page--;
        showImages(page);
        if (page == 1) {
          $("#paginador .prev img").attr("src", "/images/left-off.png");
        }
        $("#paginador .next img").attr("src", "/images/right-on.png");
      }
    });

    $("#paginador .next").click(function (event) {
      event.preventDefault();
      if (page < pagesCount) {
        page++;
        showImages(page);
        if (page == pagesCount) {
          $("#paginador .next img").attr("src", "/images/right-off.png");
        }
        $("#paginador .prev img").attr("src", "/images/left-on.png");
      }
    });
  };

  var showImages = function(page) {
    $.get("images/", { page: page }, function(data) {
      $("#fotos-container").html(data);
      lighBoxImages();
    });
  };
  
  var showRecommended = function() {
    $("#foto-recomendada-lighbox").fancybox({
      titleShow: false,
      showNavArrows: false,
      padding: 0,
      scrolling: "no"
    });
    $("#foto-recomendada-lighbox").trigger('click');
  };

  $(document).ready(function() {
    showSections();
    showMyImage();
    validateFormUpload();
    paginateImages();
    showRecommended();
  });

})();

var vote = function(id) {
  var url = "votar?id=" + id;
  $.get(url, function(data) {
    $("a.votar[data-id='" + id + "']").hide();
    // $.fancybox.close();
  });
  return false;
};

var share = function(imgIndex, workId) {
  var imgUrl = $("#foto-" + imgIndex + " img").attr("src");
  var link = shareUrl + "?app_data=" + workId;
  FB.ui(
  {
    method: 'feed',
    name: 'Tenés imaginación, tenés BIC',
    link: link,
    picture: imgUrl,
    caption: 'Viste todo lo que se puede hacer con los BIC Marking?',
    description: 'Entrá y mirá todo lo que podés hacer cuando tenés imaginación y tenés BIC.'
  },
  function(response) {
    $.fancybox.close();
  });
};
