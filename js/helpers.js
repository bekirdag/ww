var action = "click";
if (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i)) {
	action = "touchstart";
}

$(document).ready(function () {
	ipad_events();
	$("#reset_map_position").on(action,function(){
		$("#map").css("top",0);
		$("#map").css("left","");
		$("#map").css("right",0);
	});
	
	var overlay = document.getElementById('info');
	
	if (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i)) {
		window.addEventListener('scroll', function(e){
		  	overlay.style.position = 'absolute';
		    overlay.style.left = window.pageXOffset + 'px';
		    overlay.style.bottom = document.documentElement.clientHeight - (window.pageYOffset + window.innerHeight) + 'px';
		    overlay.style["-webkit-transform"] = "scale(" + window.innerWidth/document.documentElement.clientWidth + ")";
		});
	}
});

(function($) {

    $.ucfirst = function(str) {
        var text = str;
        var parts = text.split(' '),
            len = parts.length,
            i, words = [];
        for (i = 0; i < len; i++) {
            var part = parts[i];
            var first = part[0].toUpperCase();
            var rest = part.substring(1, part.length);
            var word = first + rest;
            words.push(word);
        }
        return words.join(' ');
    };

})(jQuery);

// jQuery no-double-tap-zoom plugin

// Triple-licensed: Public Domain, MIT and WTFPL license - share and enjoy!

(function($) {
  var IS_IOS = /iphone|ipad/i.test(navigator.userAgent);
  $.fn.nodoubletapzoom = function() {
    if (IS_IOS)
      $(this).bind('touchstart', function preventZoom(e) {
        var t2 = e.timeStamp
          , t1 = $(this).data('lastTouch') || t2
          , dt = t2 - t1
          , fingers = e.originalEvent.touches.length;
        $(this).data('lastTouch', t2);
        if (!dt || dt > 500 || fingers > 1) return; // not double-tap
        e.preventDefault(); // double tap - prevent the zoom
        // also synthesize click events we just swallowed up
        $(this).trigger('click').trigger('click');
      });
  };
})(jQuery);

function set_viewport()
{
	// if (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i))
	// {
		posY = getScreenCenterY();
		posX = getScreenCenterX();
	// }
	
	var viewportmeta = document.querySelector('meta[name="viewport"]');
	viewportmeta.content = 'minimal-ui, width=device-width, minimum-scale=1.0, maximum-scale=10.0, initial-scale=1.0, user-scalable=yes';
	set_center_to_capital();
}

function set_center_to_capital()
{
	set_center_to_user(turn);
}

function set_center_to_user(user)
{
	var player = Players[user];
	var capital = player.capital;
	var cap_x = capital[0];
	var cap_y = capital[1];
	set_center(cap_x,cap_y);
}

function set_center(x,y)
{
	var map_width = $("#map svg").width();
	var real_width = 199;
	
	var map_height = $("#map svg").height();
	var real_height = 96;
	
	var w_ratio = map_width/real_width;
	var h_ratio = map_height/real_height;
	
	var ratio = (w_ratio>h_ratio) ? h_ratio : w_ratio;

	var screen_width = screen.width*0.9;
	var screen_height = screen.height*0.9;
	
	var move_x = ((real_x-map_width/2)*(-1));
	var move_y = ((real_y-map_height/2)*(-1));
	
	var attrs = $("#viewport").attr("transform");
	attrs = attrs.replace("matrix","");
	attrs = attrs.replace("(","");
	attrs = attrs.replace(")","");
	attrs = attrs.split(",");
	
	var real_x = win_width/2 - x * attrs[0];
	var real_y = win_height/2 - y * attrs[0];
	
	$("#viewport").attr("transform","matrix("+attrs[0]+",0,0,"+attrs[3]+","+real_x+","+real_y+")");
}

function ipad_events()
{

}

function getScreenCenterY() {
    var y = 0;
    y = getScrollOffset()+(getInnerHeight()/2);
    return(y);
}

function getScreenCenterX() {
    return(document.body.clientWidth/2);
}

function getInnerHeight() {
    var y;
    if (self.innerHeight) // all except Explorer
    {
        y = self.innerHeight;
    }
    else if (document.documentElement && document.documentElement.clientHeight)
    // Explorer 6 Strict Mode
    {
        y = document.documentElement.clientHeight;
    }
    else if (document.body) // other Explorers
    {
        y = document.body.clientHeight;
    }
    return(y);
}

function getScrollOffset() {
    var y;
    if (self.pageYOffset) // all except Explorer
    {
        y = self.pageYOffset;
    }
    else if (document.documentElement &&
document.documentElement.scrollTop) // Explorer 6 Strict
    {
        y = document.documentElement.scrollTop;
    }
    else if (document.body) // all other Explorers
    {
        y = document.body.scrollTop;
    }
    return(y);
}