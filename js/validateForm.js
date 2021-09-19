$(function () {
    $('.formBody').validate({
        ignore: [],
        highlight: function (input) {
            //console.log(input);
            $(input).parents('.form-line').addClass('error');
        },
        unhighlight: function (input) {
            $(input).parents('.form-line').removeClass('error');
        },
        errorPlacement: function (error, element) {
            $(element).parents('.field-requiredVal').append(error);
            //$(element).parents('.form-group').value = error.innerHTML;
        }
    });

    $('select').change(function(){
        if ($(this).val()!="")
        {
            $(this).valid();
        }
    });
    $('.file-input').change(function(){
        if ($(this).val()!="")
        {
            $(this).valid();
        }
    });
});