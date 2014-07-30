$(document).ready( function() {

  $("#create").on("click", function(event) {
    event.preventDefault();
    $(".actions").find(".action-button").hide();
    $("#create-form").fadeToggle();
  });

  $("#join").on("click", function(event) {
    event.preventDefault();
    $(".actions").find(".action-button").hide();
    $("#join-form").fadeToggle();
  });

  $("#create-form").find("form").submit( function(event) {
    event.preventDefault();
    event.stopPropagation();

    var username = $("#create-username").val();
    var chatroom = $("#create-chatroom").val();

    socket.emit("initialize room", username, chatroom);
  });

//  $(".brand").on("click", function(event) {
//    event.preventDefault();
//    event.stopPropagation();
////    $("form:visible").css("display", "none");
//    $("form:visible").hide( function() {
//      $(".actions").find(".action-button").show();
//    });
//  });
});