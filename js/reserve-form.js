$(function() {
$("#reserve-form__submit-button").click(function(){
var name = $("#fname").val() + " " + $("#lname").val();
var email = $("#email").val();
var job_title = $("#job-title").val();
var company = $("#company").val();
var phone = $("#phone").val();
var package = $('input[name=package]:checked').val();
var gri_benchmarking = $('#gri-benchmarking').val();
// Returns successful data submission message when the entered information is stored in database.
var dataString = 'name='+ name + '&email='+ email + '&jobtitle=' + job_title + '&company=' + company + '&phone=' + phone + '&package=' + package + "&gri-benchmarking=" + gri_benchmarking;
if(name==' '||email=='')
{
alert("Please Fill All Fields");
}
else
{
// AJAX Code To Submit Form.
$.ajax({
type: "POST",
url: "/reserve_mail.php",
data: dataString,
cache: false,
success: function(result){
	$('.reserve-form').hide();
var response_message = "Thank you for reserving the " + package + " package, " + name + ". Somebody will contact you shortly.";
$('.ra-message--success').text(response_message).show();
}
});
}
return false;
});

    $('#reserve-now-button').on('click', function(event) {
        $('.ra-message--success').hide();
        $('.reserve-form').slideDown();
    });

});
