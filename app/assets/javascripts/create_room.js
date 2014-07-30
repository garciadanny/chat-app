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
});