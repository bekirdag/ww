var Maps = ["world","europe"];
var capitals = [[39,30],[86,28],[45,55],[110,29],[95,40],[129,29],[123,16],[154,27],[184,79],[104,75],[47,83],[22,15],[160,15],[141,48]];
var docks = [[84,30],[102,29],[110,32],[101,35],[78,47],[103,81],[122,49],[129,38],[140,51],[166,35],[177,31],[185,11],[182,59],[166,35],[157,60],[186,80],[94,13],[80,12],[67,14],[43,29],[55,54],[48,94],[36,59],[14,32],[165,16],[120,74]];
var map_x = 0;
var map_y = 0;
var map_w = map_o_w = 0;
var map_h = map_o_h = 0;
var map = "";
var water_grid;
var win_width = $( window ).width()*0.9;
var win_height = $( window ).height();

function select_map()
{
	var select_list = "<select id='maps'></select>";
	
	var html = '<div id="select_map_wrapper">\
		<h2>Select Map</h2>\
		<div id="select_map">\
		'+select_list+'\
		</div>\
		<button type="button" id="finish_map">Done</button>\
	</div>';
	
	$("body").prepend(html);
	
	var option = '';
	for (i=0;i<Maps.length;i++){
	   option += '<option value="'+ Maps[i] + '">' + $.ucfirst(Maps[i]) + '</option>';
	}
	$('#maps').append(option);
	
	$("#finish_map").click(function(){
		var map = $("#maps").val();
		load_map(map);
		$("#select_map_wrapper").remove();
		get_players();
	});
}

function get_map_attributes()
{
	var attrs = map.getAttribute("viewBox").split(" ");
	map_x = parseInt(attrs[0]);
	map_y = parseInt(attrs[1]);
	map_w = parseInt(attrs[2]);
	map_h = parseInt(attrs[3]);
	// if (!navigator.userAgent.match(/iPhone/i) || !navigator.userAgent.match(/iPad/i)) {
		$("#map_svg").removeAttr("viewBox");
		$('svg').svgPan('viewport', true, true, false, 0.2);;
	// }
}

function set_map_attributes(data)
{
	var attrs = data.join(" ");
	map.setAttribute("viewBox",attrs);
}

function load_map(name)
{
	$('#map').load('maps/'+name+'.svg',function(){
		$("#map svg").attr("id","map_svg");
		$("#map_svg").attr("width",win_width);
		$("#map_svg").attr("height",win_height);
		map = document.getElementById("map_svg");
		$("#map svg").nodoubletapzoom();
		get_map_attributes($("#map svg"));
		set_docks($("#map svg"));
		set_water_grid();
		var map_ratio = map_w/map_h;
		var new_w = win_width/map_w;
		var new_h = win_height/map_h;
		if(map_ratio>1)
		{
			new_h = win_width/map_w;
		}
		else
		{
			new_w = win_height/map_h;
		}
		$("#viewport").attr("transform","matrix("+new_w+",0,0,"+new_h+",0,0)");
	});
}

function set_docks(map)
{
	docks.forEach(function(dock) {
		var item = $('rect[x='+dock[0]+'][y='+dock[1]+']');
	    item.attr("type","dock");
		// item.attr("style","fill:"+Players[winner].color);
		item.attr("stroke-width","0.2");
		item.attr("stroke","pink");
		
	});
}

function set_water_grid()
{
	water_grid = new PF.Grid(map_w, map_h);
	$('rect').each(function(){
		water_grid.setWalkableAt(parseInt($(this).attr("x")), parseInt($(this).attr("y")), false); 
	});
	$('rect[type=dock]').each(function(){
		water_grid.setWalkableAt(parseInt($(this).attr("x")), parseInt($(this).attr("y")), true); 
	});
}

























