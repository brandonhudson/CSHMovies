/*
File: smartBanner.js
Description: Detect mobile devices and serve
			 banner to inform users of web-app
			 enabled capabilities. Allow users
			 to close the banner.
Creation Date: 11 26 14
Author: Brandon Hudson

Copyright Connexus 2014. All Rights Reserved.
Any unauthorized use of this script may 
be subject to legal repercussions.

*/

//CHECK THE userAgent
var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    WebApp: function() {
        return (isMobile.Android() || isMobile.iOS() || isMobile.Windows());
    }
};

function setCookie(cname, cvalue, exdays) {
	if( exdays >= 1){
    	var d = new Date();
    	d.setTime(d.getTime() + (exdays*24*60*60*1000));
    	var expires = "expires="+d.toUTCString();
    	document.cookie = cname + "=" + cvalue + "; " + expires;
	}
}

function BannerPosition(position){
	/*
	Handles the positioning of the banner
	given the user position parameter
	
	*/
	if(position == "top"){
		$('#SmartBanner').css('top',0);
	}
	else if(position == "bottom"){
		$('#SmartBanner').css('bottom',0);
	}
	else if(position == "top-push"){
		$('body').css("position","relative");
		$('body').css("top",70);
		$('#SmartBanner').css('z-index',0);
		$('#SmartBanner').css('top',0);
	}
	
	
}

function isStandalone() {
    return ( window.navigator.standalone );
};


function SmartBanner(parameters){
	/*
	Handles the generation of the
	banner using the parameters
	passed in a dictionary by the
	user.
	Requred Parameters:
	
	title
	price
	developer
	iconpath
	applink
	
	//ADD TO PLATFORMS WITH
	ios: "true/false" (boolean string)
	android: "true/false" (boolean string)
	windows: "true/false" (boolean string)
	
	*/
	/* Set custom input values */
	title = parameters.title;
	price = parameters.price;
	developer = parameters.developer;
	iconPath = parameters.iconpath;
	position = parameters.position;
	ios = parameters.ios;
	android = parameters.android;
	windows = parameters.windows;
	applinkios = parameters.applinkios;
	applinkandroid = parameters.applinkandroid;
	applinkwindows = parameters.applinkwindows;
	mode = parameters.mode;
	alertdelay = parameters.alertdelay;
	alertfadespeed = parameters.alertfadespeed;
	bannerslidespeed = parameters.bannerslidespeed;
	force = parameters.force;
	iosMessage = parameters.messageios;
	androidMessage = parameters.messageandroid;
	windowsMessage = parameters.messagewindows;
	theme = parameters.theme;
	cookieTime = parameters.cookiedays;
	
	if(title == null){
		title = "App Title";	
	}
	if(price == null){
		price = "PRICE";	
	}
	if(developer == null){
		developer = "Developer";	
	}
	if(position == null){
		position = "top-push";	
	}
	if(applinkios == null){
		applinkios = "#";	
	}
	if(applinkandroid == null){
		applinkandroid = "#";	
	}
	if(applinkwindows == null){
		applinkwindows = "#";	
	}
	if(mode == null){
		mode = "web-app";	
	}
	if(alertdelay == null){
		alertdelay = 3000;
		
	}
	if(alertfadespeed == null){
		alertfadespeed = 400;	
		
	}
	if(bannerslidespeed == null){
		bannerslidespeed = 300;	
	}
	if(cookieTime == null){
		bannerslidespeed = 14;	
	}
	if(iosMessage == null){
		iosMessage = 'on the App Store';	
	}
	if(androidMessage == null){
		androidMessage = 'on Google Play';	
	}
	if(windowsMessage == null){
		windowsMessage = 'on the Microsoft Store';	
	}
	if(mode  == 'web-app'){
		windowsMessage = 'Add to Homescreen';
		iosMessage = 'Add to Homescreen	';
		androidMessage = 'Add to Homescreen';
	}
	html = '<div id="SmartBanner"><img id="SBicon" hspace="8px"/><div id="SBtitle"></div><div id="SBdeveloper"></div><div id="SBmessage"></div><div id="SBcloseContainer"><button type="button" id="SBclose"><i class="SB-fa SB-fa-close" id="SBcloseIcon"></i></button></div><div id="SBlinkContainer"><a href="" id="SBlink">TEXT</a></div></div>';
	
	alertHTML = '<div id="SBAlert"></div>';
	
	if ($(document).height() < 670 && position == "bottom"){
			html = html + '<div id="SBpadding"></div>';
			
	}
	if( force == "ios"){
    	$(html).appendTo('body');
		BannerPosition(position);
		$('#SBmessage').html(price + ' - ' + iosMessage);
		
		
	}
	if( force == "android"){
    	$(html).appendTo('body');
		BannerPosition(position);
		$('#SBmessage').html(price + ' - ' + androidMessage);
		
		
	}
	if( force == "windows"){
    	$(html).appendTo('body');
		BannerPosition(position);
		$('#SBmessage').html(price + ' - ' + windowsMessage);
		
		
	}
	else if(force == null && $.cookie('SmartBanner') != 'seen'){
	if (isMobile.Android() && android == "true" && !isStandalone()) {
		
    	$(html).appendTo('body');
		BannerPosition(position);
		$('#SBmessage').html(price + ' - ' + androidMessage);
		
	}
	else if(isMobile.iOS() && ios == "true" && !isStandalone() )
	{
		
    	$(html).appendTo('body');
		BannerPosition(position);
		$('#SBmessage').html(price + ' - ' + iosMessage);
	}
	else if(isMobile.Windows() && windows == "true" && !isStandalone() ){
		
		$(html).appendTo('body');
		BannerPosition(position);
		$('#SBmessage').html(price + ' - ' + windowsMessage);
	}
	}
	if(isMobile.WebApp()){
		$('#SBcloseContainer').css("right","-8px");	
	}
	//THEME CHECKING
	$('#SBtitle').html(title);
	$('#SBdeveloper').html(developer);
	$('#SBicon').attr('src',iconPath);
	
	
	if(mode == "native-app"){
		$('#SBlink').html('VIEW');
		if(isMobile.iOS()){
			$('#SBlink').attr('href',applinkios);
		}
		else if(isMobile.Android()){
			$('#SBlink').attr('href',applinkandroid);
		}
		else if(isMobile.Windows()){
			$('#SBlink').attr('href',applinkwindows);
		}
		
	}
	else if(mode == "web-app"){
		$('#SBlink').html('ADD');
		$('#SBlink').attr('href',"#");
	}
	if(theme == "light"){
		$('#SmartBanner').css("color", "#000");
		$('#SmartBanner').css("backround-color", "#FAFAFA");
		$('#SBcloseIcon').css("color","#000");
		$('#SBlinkContainer a').css("color", "#808080");	
	}
	else if(theme == "dark"){
		$('#SmartBanner').css("color", "#F7F7F7");
		$('#SmartBanner').css("background-color", "#3d3d3d");
		$('#SBcloseIcon').css("color","#F7F7F7");
		$('#SBlinkContainer a').css("color", "#F7F7F7");	
	}


	
//CHECK FOR CLOSE
$('#SBclose').on('click', function(){
	if(position == "top"){
		$('#SmartBanner').animate(
			{
			top: "-=200"	
			},
			bannerslidespeed, function(){
			padding = document.getElementById('SBpadding');
			$('#SmartBanner').remove();
			if(padding != null){
				$('#SBpadding').remove();
		}
		// add cookie here
		
		
		});	
	}
	if(position == "bottom"){
		$('#SmartBanner').animate(
			{
			bottom: "-=200"	
			},
			bannerslidespeed, function(){
			padding = document.getElementById('SBpadding');
			$('#SmartBanner').remove();
			if(padding != null){
				$('#SBpadding').remove();
		}
		// add cookie here
		
		
		});	
		
	}
	if(position == "top-push"){
		$('#SmartBanner').animate(
			{
			top: "-=200"	
			},
			bannerslidespeed, function(){
			padding = document.getElementById('SBpadding');
			$('#SmartBanner').remove();
			if(padding != null){
				$('#SBpadding').remove();
		}
		// add cookie here
		
		
		});	
		$('body').animate(
			{
			top: "-=70"	
			},
			200);
		}
	
	
		
		
	setCookie("SmartBanner", "seen", cookieTime); // Sample 1
	
});
	
$('#SBlink').on('click', function(){
	
	if(mode == "web-app"){
		$(alertHTML).appendTo('body').hide();
		$('#SBAlert').fadeIn(alertfadespeed);
		
		if(isMobile.Android() && android == "true"  || force == "android"){
			
			$('#SBAlert').html('Open Google Chrome, tap <i id="SBshareIcon" class="SB-fa SB-fa-ellipsis-v"/></i> and then select <b>Add to Homescreen</b>');
				
			
		}
		else if(isMobile.iOS() && ios == "true" || force == "ios"){
			$('#SBAlert').html('Open Safari, tap <i id="SBshareIcon" class="SB-fa SB-fa-sign-out SB-fa-rotate-270"/></i> and then select <b>Add to Homescreen</b>');
			
		}
		else if(isMobile.Windows() && windows == "true"  || force == "ios"){
			$('#SBAlert').html('Open Internet Explorer, tap <i id="SBshareIcon" class="SB-fa SB-fa-thumb-tack"/></i> and then select <b>Pin to Start</b>');
			
			
		}
		if(theme == "dark"){
			$('#SBAlert').css("color","#FFF");
			$('#SBAlert').css("background-color","rgba(0,0,0,0.95)");
			$("#SBAlert").css("border-color","#666");	
		}
		else if(theme == "light"){
			$('#SBAlert').css("color","#000");
			$('#SBAlert').css("background-color","rgba(255,255,255,0.95)");
			$("#SBAlert").css("border-color","#999");	
		}
		
		$('#SBAlert').delay(alertdelay).fadeOut(alertfadespeed, function(){
			$('#SBAlert').remove()
			
		});
		
		
		setCookie('SmartBanner','seen',cookieTime);
	}
	
	
		
});

}

/* 
   TO DO LIST
----------------
 - Add cookies that remember popup
 
 */






