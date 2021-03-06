var Index = (function($){
    //var host = "http://192.168.3.92:8088/api-rest/";
    var host = "http://prueba.conectium.com/api-rest/";

    // variables de inicializacion
    var intervalId;
    var isMSISDN;
    var subscriber;
    var email;
    var site;

    // destruye la ejecucion de los intervalos de tiempo
    var destroy = function(){
        clearInterval(intervalId);
    };

    var my_slider = function(){
        var timeExpire = 2000;
        var count = 0;

        if ($("#influence").val() === undefined || $("#influence").val() === "") return;

        var dataInfluence = JSON.parse($("#influence").val());

        console.log(dataInfluence);

        var tempInfluence = [];
        // dinamic parser
        $.each(dataInfluence,function(i,object){
            object.shown = false;
            object.image =  object.nombreima;
        });

        // buscando modulo de imagenes ya que las mismas manejan la capaciad de agregar influenciadores
        $('[type="Imagen"]').each(function(i){
            var self = $(this);
            var params = JSON.parse($( this ).attr("params"));
            if (params.isInfluencer !== undefined && params.isInfluencer === true){

                // seteando texto a la imagen
                //self.find("img").attr("src",(self.find("img").attr("src") === "images/office.jpg" ? "images/sample-1.jpg" : "images/office.jpg"));

                // buscando los textos cuya target se defina en el bloque de imagen influenciador
                $("div[type='Text']").each(function(e){
                    var paramsText = JSON.parse($( this ).attr("params"));

                    // cambiando el texto del influenciador al target del nombre de la imagen del influenciador
                    if (params.nameTarget !== undefined && paramsText.name === params.nameTarget){
                        $(this).text(params.nameInfluence);

                        // solo entra una vez
                        return false;
                    }
                });
            }
            if(params.isSlider !== undefined && params.isSlider === true
                && (params.isInfluencer !== undefined && params.isInfluencer === true)
            ){
                count++;
                // sincronizando influenciador
                setTimeout(function(){

                    var timer = null;

                    self.mouseenter(function(){
                        clearInterval(timer);
                        timer = null
                    });

                    self.on("mouseleave",function(){
                        clearInterval(timer);
                        timer = null;

                        if (timer !== null) return;
                        timer = setInterval(influencerBlockEvent,count * timeExpire);
                    });

                    var influencerBlockEvent = function(){
                        var reset = true;
                        var actualObject = {};

                        // validando si todo los influenciadores se han mostrado en el efecto slider
                        $.each(dataInfluence, function(i,object){
                            if(object.shown === false){
                                object.shown = true;
                                actualObject = object;
                                reset = false;
                                return false;
                            }
                        });

                        // reiniciando los influenciadores
                        if (reset === true) {
                            $.each(dataInfluence, function(i,object){
                                object.shown = false;
                                dataInfluence[i] = object;
                            });
                            actualObject = dataInfluence[0];
                        }

                        // se debe validar que el json tenga influenciadores para mostrar
                        // aqui


                        // cambiando imagenes
                        self.find("img").attr("src",actualObject.image);
                        // agrego el cambio desde el dataInfluence

                        // buscando los textos cuya target se defina en el bloque de imagen influenciador
                        $("div[type='Text']").each(function(e){
                            var paramsText = JSON.parse($( this ).attr("params"));

                            // cambiando el texto del influenciador al target del nombre de la imagen del influenciador
                            if (params.nameTarget !== undefined && paramsText.name === params.nameTarget){
                                $(this).text("Influenciador");

                                ///dataInfluence.show = true;
                                return true;
                            }

                        });
                    };

                    timer = setInterval(influencerBlockEvent,count * timeExpire)
                },count * timeExpire);
            }
        })
    };

    var buttonAction = function(){
        $("a[type='Button']").click(function(){
            var $this_element = $(this);
            var params = JSON.parse($this_element.attr("params"));

            var elementForms = [];
            var postParam=[{}];

            if (params.actionType !== undefined && params.actionType === "action"){
                // si estamos en el iframe
                var insideIframe = window.top !== window.self;
                if (insideIframe)
                        Materialize.toast('Simulacion de redireccionamiento a: '+params.action, 4000)
                else
                    // si estamos en el jsp
                    window.location.href = params.action;

            } else if (params.actionType !== undefined && params.actionType === "poll")  {
                postParam=[{
                   subscriber   : subscriber,
                   site         : site,
                   correo       : email
                }];

                $("div[type='Radios']").find("input:checked").each(function(i){
                    var input = $(this);
                    eval('postParam[0].opcion_seleccionada="'+input.val()+'"');
                    return true;
                });

                $("div[type='Checkboxs']").find("input:checked").each(function(i){
                    var input = $(this);
                    eval('postParam.'+ input.attr("name") +'="'+input.val()+'"');
                });

                $("div[type='InputSelect']").each(function(i){
                    var input = $(this).find("select");
                    eval('postParam.'+ input.attr("name") +'="'+input.val()+'"');
                });

                $.ajax({
                    url:host+"respuestasEncuesta"+"/",
                    dataType: 'JSON',
                    contentType: "application/json",
                    data : JSON.stringify(postParam),
                    method: "POST",
                    statusCode: {
                        404: function() {
                            console.log( "page not found" );
                        }
                    }
                }).done(function( text ) {
                    // contenido de ajax aqui
                });

            }
        });
    };

    // se reconstruye select
    var formatSelect = function(){
        $("[type='InputSelect']").each(function(i){
            var select = $(this).find("select:eq(0)");
            var labelText = $(this).find("label").text();
            var inputText = $(this).find("input");
            $(this).empty();
            $(this).append("<div class='input-field col s12'><select>"+select.html()+"</select><label>"+labelText+"</label></div>");

            $(this).find("select").material_select();
            $(this).find("input").attr("id",inputText.attr("id"));
            $(this).find("input").attr("name",inputText.attr("name"));
        });

    };

    var formatDatapicker = function(){
        $('.datepicker').pickadate({
            selectMonths: true, // Creates a dropdown to control month
            selectYears: 15, // Creates a dropdown of 15 years to control year,
            today: 'Today',
            clear: 'Clear',
            close: 'Ok',
            closeOnSelect: false, // Close upon selecting a date,
            format: 'dd/mm/yyyy',
            formatSubmit: 'yyyy/mm/dd',
        });
    };

    var elementBody =  function(){
        var $this_element = $("body:eq(0)");
        if ($("input#elementBody").attr("params") !== undefined){
            var params = JSON.parse($("input#elementBody").attr("params"));

            if (params.isBackgroundColor === true){
                $this_element.css('background-image','none');
                $this_element.css('background-repeat','none');
                $this_element.css('background-position', 'none');
                $this_element.css('background-size','none');
                $this_element.css({"background-color":params.backgroundColor});
            } else {
                $this_element.css({"background-color":'initial'});
            }
            if (params.isBackgroundImage === true){
                $this_element.css('background-image',params.backgroundImage);
                $this_element.css('background-repeat',params.backgroundRepeat);
                $this_element.css('background-position', params.backgroundPosition);
                $this_element.css('background-size',params.backgroundSize);
                $this_element.css({"background-color":'initial'});
            } else {
                $this_element.css('background-image','none');
                $this_element.css('background-repeat','none');
                $this_element.css('background-position', 'none');
                $this_element.css('background-size','none');
            }
        }
    };

    var formValidator = function(){
        var _self;
        $("[type='InputText']").each(function(i,obj){
            _self = this;
            var json = JSON.parse($(this).attr("params"));
            alert(json.validator);
            if(json.validator === "1"){
                alert("sin validacion")
            } else {
                $(_self).keydown(function (e) {
                    if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
                        (e.keyCode == 65 && e.ctrlKey === true) ||
                        (e.keyCode >= 35 && e.keyCode <= 39)) {
                        return;
                    }

                    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                        e.preventDefault();
                    }
                });
            }
        });
    };
    var poolCheckBox = function(){
        $("div[type='Checkboxs']").each(function(i){

            var self = this;
            var params = JSON.parse($(this).attr("params"));

            if (params.isPoll === true){
                $.ajax({
                    url: host+"preguntas/"+params.pollSelected,
                    method: "GET",
                    dataType: "JSON",
                    contentType: "application/json"
                }).done(function(option) {
                    $.each(option,function(i,object){
                        if(parseInt($(self).find("input").val()) === object.id){
                            $(self).find("label").text(object.planteamiento)
                            return true;
                        }
                    });
                });
            }
        });
    };

    var poolRadioBox = function(){
        $("div[type='Radios']").each(function(i){

            var self = this;
            var params = JSON.parse($(this).attr("params"));

            if (params.isPoll === true){
                $.ajax({
                    url: host+"preguntas/"+params.pollSelected,
                    method: "GET",
                    dataType: "JSON",
                    contentType: "application/json"
                }).done(function(option) {
                    $.each(option,function(i,object){
                        if(parseInt($(self).find("input").val()) === object.id){
                            $(self).find("label").text(object.planteamiento)
                            return true;
                        }
                    });
                });
            }
        });
    };

    // seteando las preguntas en las encuestas
    var pollText = function(){
        $("div[type='Text']").each(function(i){
            var self = this;
            var params = JSON.parse($(this).attr("params"));

            if (params.isPoll === true){
                $.ajax({
                    url: host+"preguntas/"+params.pollSelected,
                    method: "GET",
                    dataType: "JSON",
                    contentType: "application/json"
                }).done(function(option) {
                    $.each(option,function(i,object){
                        if(parseInt(params.questionSelect) === object.id){
                            $(self).text(object.planteamiento );
                            return true;
                        }
                    });
                });
            }
        });
    };

    // esto hay que terminarlo
    var InputText = function(){
        $("div[type='InputText']").each(function(i){

            var self = this;
            var params = JSON.parse($(this).attr("params"));
            if (params.actionType === "msisdn"){
                // validando MSISDN aqui
                // envia con ajax
            }
        });
    };

    // permite mostrar los elementos que pertenece al MSISDN
    var MSISDN = function(){
        var self = this;
        $("div[type='None']").each(function(){

            var params = JSON.parse($(this).attr("params"));
            if (params.actionType !== undefined && params.actionType === "msisdn"){
                if (isMSISDN === true){
                    $(this).show();
                } else {
                    // mostrando el contenido
                    $(this).hide();
                }
            }
        });
    };

    var showContent = function(){
      $("body").show();
    };

    var RRSS = function(){
        var self = this;
        $("span[type='Rrss']").each(function(){

            var params = JSON.parse($(this).attr("params"));
            if (params.actionType !== undefined && params.actionType === "google"){
                $(this).hide();
                $(this).after('<div id="my-signin2"></div>');
                renderButtonGoogle();
            }
            if (params.actionType !== undefined && params.actionType === "facebook"){
                $(this).hide();
                $(this).after('<div class="fb-login-button" data-max-rows="1" data-size="large" data-button-type="continue_with" data-show-faces="false" data-auto-logout-link="false" data-use-continue-as="false" onlogin="index.facebook.login()"></div>');
                renderButtonFacebook();
                //checkLoginStateFacebook();
                //$(this).after('<fb:login-button scope="public_profile,email" onlogin="index.checkLoginStateFacebook.getLoginStatus();"></fb:login-button>');
                //renderButtonFacebook();
            }
        });
    };

    var execute = function(){
        formValidator();
        elementBody();
        my_slider();
        formatSelect();
        buttonAction();
        formatDatapicker();
        poolCheckBox();
        pollText();
        poolRadioBox();
        InputText();
        MSISDN();
        RRSS();
        showContent();
    };

    var init = function(_isMSISDN,_subscriber,_email,_site){
        isMSISDN = _isMSISDN;
        subscriber = _subscriber;
        email = _email;
        site = _site;
        jQuery(function(){
            execute();
        });
    };

    var renderButtonGoogle = function(){
        gapi.signin2.render('my-signin2', {
            'scope': 'profile email',
            'width': 240,
            'height': 50,
            'longtitle': true,
            'theme': 'dark',
            'onsuccess': onSuccess,
            'onfailure': onFailure
        });
    };

    var renderButtonFacebook = function(){

        (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = 'https://connect.facebook.net/es_LA/sdk.js#xfbml=1&version=v2.10&appId=1747722528863757';
            fjs.parentNode.insertBefore(js, fjs);

        }(document, 'script', 'facebook-jssdk'));


    };

    var checkLoginStateFacebook = function(){
        //https://developers.facebook.com/docs/facebook-login/web#logindialog

        window.fbAsyncInit = function() {
            FB.init({
                appId      : '1747722528863757',
                cookie     : true,  // enable cookies to allow the server to access
                                    // the session
                xfbml      : true,  // parse social plugins on this page
                version    : 'v2.8' // use graph api version 2.8
            });

            FB.Event.subscribe('auth.login', alert("hola mundo"));

            // Now that we've initialized the JavaScript SDK, we call
            // FB.getLoginStatus().  This function gets the state of the
            // person visiting this page and can return one of three states to
            // the callback you provide.  They can be:
            //
            // 1. Logged into your app ('connected')
            // 2. Logged into Facebook, but not your app ('not_authorized')
            // 3. Not logged into Facebook and can't tell if they are logged into
            //    your app or not.
            //
            // These three cases are handled in the callback function.

            FB.getLoginStatus(function(response) {
                alert("hola22");
                statusChangeCallback(response);
            });

            FB.login(function(response) {
                alert("entroo")
                if (response.status === 'connected') {
                    alert("hola");
                    // Logged into your app and Facebook.
                } else {
                    alert("hola2");
                    // The person is not logged into this app or we are unable to tell.
                }
            });

        };

        var getLoginStatus = function(){
            FB.getLoginStatus(function(response) {
                alert(statusChangeCallback(response));
            });
        };

        return {
            getLoginStatus : getLoginStatus,
        };
    };

    var onSuccess = function(){
        console.log('Logged in as: ' + googleUser.getBasicProfile().getName());
    };

    var onFailure = function(){
        console.log(error);
    };

    var facebook = (function($){
        var login = function(){
            alert("hola");
        };
        return {
            login : login
        }

    })(jQuery);

    return {
        init : init,
        destroy : destroy,
        execute : execute,
        renderButtonGoogle : renderButtonGoogle ,
        facebook : facebook,
        onSuccess : onSuccess,
        onFailure : onFailure
    }

})(jQuery);