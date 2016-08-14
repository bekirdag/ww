var turn = -1;
var moves_count;
var attack_bool = false;
var attacked_enemy_land = [];
var attacking_force_land = [];
var enemy_selection_started = false;
var is_first_enemy_selected = false;
var is_first_force_selected = false;
var is_enemy_selection_finished = false;
var first_enemy = "";
var is_dock_clicked = false;
var dock_turn = false;
var depart_dock = false;
var arrival_dock = false;
var first_army_to_dock_selected = false;
var ships = [];
var shipment = {};
var conquer_turn = false;

$ = jQuery;
$(document).ready(function(){
	$("#turn_info").hide();
	$("#reset_map_position").hide();
	$("#attack_wrapper").hide();
	select_map();
	
	$("#attack").on(action,function(){
		enemy_selection_started = true;
		$("#turn_moves_wrapper").hide();
		$("#ship_army").hide();
		$("#battle").show();
		$("#attack_text").show();
		attack_bool = true;
		attack();
	});
	
	$("#battle").on(action,function(){
		if(attacked_enemy_land.length!=attacking_force_land.length)
		{
			$("#attack_text").text("Number of attacked lands must match attacking forces!");
			return false;
		}
		set_battle();
	});
	
	$("#map").on(action, "#map_svg rect" ,function(){
		// select attack forces
		if(attack_bool && is_first_force_selected && attacking_force_land.length<attacked_enemy_land.length && $(this).attr("type")!="capital")
		{
			var owner = $(this).attr("owner");
			if(owner== turn)
			{
				var is_force_neighbour = check_neighbours($(this),"attack_force");
				if(is_force_neighbour)
				{
					$(this).attr("style","fill:blue");
					$(this).attr("owner","attack_force");
					var position = [parseInt($(this).attr("x")),parseInt($(this).attr("y"))];
					attacking_force_land.push(position);
					remove_land($(this),turn,"rest force");
				}
			}
		}
		// select first force
		if(attack_bool && !is_first_force_selected)
		{
			var owner = $(this).attr("owner");
			if(owner== turn && $(this).attr("type")!="capital")
			{
				var is_force_neighbour = check_neighbours($(this),"under_attack");
				if(is_force_neighbour)
				{
					$(this).attr("style","fill:blue");
					$(this).attr("owner","attack_force");
					var position = [parseInt($(this).attr("x")),parseInt($(this).attr("y"))];
					attacking_force_land.push(position);
					is_first_force_selected = true;
					remove_land($(this),turn,"first force");
				}
			}
		}
		// select rest enemy
		if(attack_bool && !is_enemy_selection_finished && is_first_enemy_selected)
		{
			var owner = $(this).attr("owner");

			if(owner == first_enemy && typeof owner!=="undefined" && $(this).attr("type")!="capital"  && attacked_enemy_land.length<(Players[turn].land.length-1))
			{
				var is_enemy_neighbour = check_neighbours($(this),"under_attack");
				if(is_enemy_neighbour)
				{
					$(this).attr("style","fill:red");
					$(this).attr("owner","under_attack");
					var position = [parseInt($(this).attr("x")),parseInt($(this).attr("y"))];
					attacked_enemy_land.push(position);
					remove_land($(this),owner,"rest enemy");
				}
			}
			else if(attacked_enemy_land.length==Players[turn].land.length-1)
			{
				// $('rect[owner='+turn+']').each(function(){
				// 	if($(this).attr("type")!="capital")
				// 	{
				// 		$(this).attr("style","fill:blue");
				// 		$(this).attr("owner","attack_force");
				// 		var position = [parseInt($(this).attr("x")),parseInt($(this).attr("y"))];
				// 		attacking_force_land.push(position);
				// 		is_first_force_selected = true;
				// 	}
				// });
			}
		}
		// select first enemy
		if(!is_first_enemy_selected && attack_bool && enemy_selection_started)
		{
			var owner = $(this).attr("owner");

			if(typeof owner!=="undefined" && owner!= turn && $(this).attr("type")!="capital" && attacked_enemy_land.length<(Players[turn].land.length-1))
			{
				var is_enemy_neighbour = check_neighbours($(this),turn);
				if(is_enemy_neighbour)
				{
					$(this).attr("style","fill:red");
					$(this).attr("owner","under_attack");
					var position = [parseInt($(this).attr("x")),parseInt($(this).attr("y"))];
					attacked_enemy_land.push(position);
					is_first_enemy_selected = true;
					first_enemy = owner;
					remove_land($(this),owner,"first enemy");
					return owner;
				}
			}
		}
		// conquer land
		if(!attack_bool && !dock_turn)
		{
			// check ownership
			var owner = $(this).attr("owner");
			// check neighbours
			var is_neighbour = check_neighbours($(this),turn);

			if(typeof owner === 'undefined' && is_neighbour)
			{
				conquer_turn = true;
				$("#attack_wrapper").hide();
				$("#ship_army").hide();
				$(this).attr("style","fill:"+Players[turn].color);
				// Players[turn].land_size++;
				$(this).attr("owner",turn);
				moves_count--;
				$("#turn_moves_count").text(moves_count);
				var land = [parseInt($(this).attr("x")),parseInt($(this).attr("y"))];
				Players[turn].land.push(land);
				if(moves_count==0)
				{
					set_turn("conquer");
				}
			}
		}
		
		if(!is_dock_clicked && !conquer_turn && $(this).attr("owner")==turn)
		{
			// console.log($(this).attr("type"));
			if($(this).attr("type")=="dock")
			{
				is_dock_clicked = true;
				depart_dock = $(this);
				$("#attack_text").text("Select your armies for the shipment. When you are done select another dock to send your armies.");
				// if(ships.length<1)
				// {
				// 	ship_id = 0;
				// }
				// else
				// {
				// 	ship_id = ships.length;
				// }
				ship_id = ships.length;
				shipment = {
					"owner": turn,
					"departure":
					{
						"x":parseInt(depart_dock.attr("x")),
						"y":parseInt(depart_dock.attr("y"))
					},
					"arrival":
					{
						"x":0,
						"y":0
					},
					"id":ship_id,
					"army_size":0,
					"path":[]
				};
			}
		}
		// a dock turn,
		else if(dock_turn && is_dock_clicked && !conquer_turn)
		{
			var owner = $(this).attr("owner");

			if($(this).attr("type")!="capital")
			{
				// if nothing have shipped yet
				if(!first_army_to_dock_selected && $(this).attr("type")!="dock")
				{
					var is_force_dock_neighbour = check_two_neighbours($(this),depart_dock);
					if(is_force_dock_neighbour && owner == turn)
					{
						$(this).attr("owner","shipment");
						$(this).removeAttr("style");
						remove_land($(this),owner,"first army to dock");
						shipment.army_size++;
						first_army_to_dock_selected = true;
					}
				}
				// load the rest of the army
				else 
				{
					if($(this).attr("type")!="dock" && owner == turn)
					{
						var is_neighbour = check_neighbours($(this),"shipment");
						var is_force_dock_neighbour = check_two_neighbours($(this),depart_dock);
						if(is_neighbour || is_force_dock_neighbour)
						{
							$(this).attr("owner","shipment");
							$(this).removeAttr("style");
							remove_land($(this),owner,"rest army to dock");
							shipment.army_size++;
						}
					}
					else if(first_army_to_dock_selected && $(this).attr("type")=="dock" && $(this).attr("x")!=depart_dock.attr("x") && $(this).attr("y")!=depart_dock.attr("y"))
					{
						// shipment is over, set the departure
						shipment.arrival.x = parseInt($(this).attr("x"));
						shipment.arrival.y = parseInt($(this).attr("y"));
						shipment.path = get_ship_path(shipment.departure,shipment.arrival);
						// var shipment_backup = shipment.clone();
						ships.push(shipment);
						// set all the shipment owners to undefined
						$('rect[owner=shipment]').removeAttr("owner");
						// empty shipment object
						create_ships(shipment);
						shipment = {};
						// shipping has ended set the new turn
						drop_cutted_land(turn);
						depart_dock.removeAttr("owner");
						depart_dock.removeAttr("style");
						depart_dock.attr("stroke-width","0.2");
						depart_dock.attr("stroke","pink");
						remove_land(depart_dock,turn,"dock given away");
						
						set_turn("shipment process ended");
					}
				}
			}
		}
	});
	
	$("#ship_army").on(action,function(){
		$("#ship_army").hide();
		dock_turn = true;
		$("#attack").hide();
		$("#attack_text").show();
		$("#attack_text").text("Select your dock");
	});
});

function construct_game()
{
	set_capitals();
	set_info_box();
	set_turn("construct");
	refresh_info();
}

function attack()
{
	// start attack procedure
	$("#attack").hide();
	$("#attack_text").text("Select enemy lands and your attacking forces");
}

function set_battle()
{
	var attacker = turn;
	$("#attack_text").hide();
	$("#battle").hide();
	$("#attack").show();
	$("#attack_wrapper").hide();
	var rand = Math.floor((Math.random() * 10) + 1);
	// console.log(rand);
	if(rand>5)
	{
		var winner = first_enemy;
		var loser = attacker;
	}
	else
	{
		var winner = attacker;
		var loser = first_enemy;
	}
	
	attacked_enemy_land.forEach(function(player_land) {
		var item = $('rect[x='+player_land[0]+'][y='+player_land[1]+']');
	    item.attr("owner",winner);
		item.attr("style","fill:"+Players[winner].color);
		change_owner(item,winner,loser);
	});
	
	attacking_force_land.forEach(function(player_land) {
		var item = $('rect[x='+player_land[0]+'][y='+player_land[1]+']');
	    item.attr("owner",winner);
		item.attr("style","fill:"+Players[winner].color);
		
		change_owner(item,winner,loser);
	});
	
	if(attacking_force_land.length>0)
	{
		drop_cutted_land(winner);
		drop_cutted_land(loser,winner);
	}
	
	set_turn("battle");
}

function change_owner(item,winner,loser)
{
	var x = parseInt(item.attr("x"));
	var y = parseInt(item.attr("y"));
	var lost_land = [x,y];
	Players[winner].land.push(lost_land);
	// Players[winner].land_size++;
	
	remove_land(item,loser,"change_owner");
}

function remove_land(item,loser,caller)
{
	// console.log(caller);
	var x = parseInt(item.attr("x"));
	var y = parseInt(item.attr("y"));
	var lost_land = [x,y];
	land_found = false;
	
	var land_index = "";
	$.each(Players[loser].land, function( index, player_land ) {
		// console.log("player land:");
		// console.log(player_land);
		// console.log("lost land:");
		// console.log(lost_land);
		
	  if(player_land[0]==x && player_land[1]==y)
	  {
		land_found = true;
		// console.log("land removed: "+player_land);
		land_index = index;
	  }
	});
	
	if(land_found)
	{
		Players[loser].land.splice(land_index,1);
		// Players[loser].land_size--;
	}
}

function drop_cutted_land(loser,winner)
{
	// console.log("sting player "+loser);
	// if(loser =="" || loser == " " || loser == "undefined")
	// {
	// 	console.log("false happened");
	// 	return false;
	// }
	var grid = new PF.Grid(map_w, map_h);
	var matrix = [];
	
	// set map unwalkable first
	for (i = 0; i < map_w; i++) { 
	    for (j = 0; j < map_h; j++) { 
		    grid.setWalkableAt(i, j, false); 
			// console.log("passed for unwalkable");
			// console.log(i+" "+j);
		}
	}
	// then set walkable player owned land
	Players[loser].land.forEach(function(player_land) {
	    var x = player_land[0];
		var y = player_land[1];
		grid.setWalkableAt(x, y, true); 
	});
	
	// var gridBackup = grid.clone();
	
	// get capital of the player
	var capital = $("#capital_"+loser);
	var cap_x = parseInt(capital.attr("x"));
	var cap_y = parseInt(capital.attr("y"));
	// grid.setWalkableAt(cap_x, cap_y, true); 
	// console.log("capital:",cap_x+","+cap_y);
	
	// check each land piece to find a path to the capital
	// console.log("Player land first");
	// console.log(Players[loser].land);
	var remove_items = [];
	Players[loser].land.forEach(function(player_land2) {
		var gridBackup = grid.clone();
	    var x = player_land2[0];
		var y = player_land2[1];
		var finder = new PF.AStarFinder();
		var path = finder.findPath(x, y, cap_x, cap_y, gridBackup);
		// console.log("path for "+x+","+y+" is:");
		// console.log(path);

		if(!path || path.length==0)
		{
			var item = $('rect[x='+x+'][y='+y+']');
			item.removeAttr("owner");
			item.removeAttr("style");
			remove_items.push(item);
			// console.log("no path:"+x+","+y);
		}
		else
		{
			// console.log("path for "+x+","+y+" is:");
			// console.log(path);
		}
	});
	if(remove_items.length>0)
	{
		remove_items.forEach(function(item) {
		    remove_land(item,loser,"drop_cutted_land");
		});
	}
	// remove user if only capital left
	if(Players[loser].land.length==1)
	{
		var item = $('rect[x='+Players[loser].capital[0]+'][y='+Players[loser].capital[1]+']');
		item.removeAttr("id");
		item.removeAttr("type");
		item.removeAttr("stroke-width");
		item.removeAttr("stroke");
		item.attr("owner",winner);
		item.attr("style","fill:"+Players[winner].color);
		// Players[loser].land_size--;
		// $("#player_info_"+loser).remove();
		// Players.splice(loser,1);
		change_owner(item,winner,loser);
		if(Players.length==1)
		{
			$("#turn_info").text(Player[winner].name + " has showed you how to play this game!");
		}
	}
	// console.log("Player land last");
	// console.log(Players[loser].land);
}

function flush_war_vars()
{
	 attack_bool = false;
	 attacked_enemy_land = [];
	 attacking_force_land = [];
	 is_first_enemy_selected = false;
	 is_first_force_selected = false;
	 is_enemy_selection_finished = false;
	 first_enemy = "";
	enemy_selection_started = false;
	is_dock_clicked = false;
	dock_turn = false;
	first_army_to_dock_selected = false;
	conquer_turn = false;
	$("#ship_army").hide();
	$("#attack_text").hide();
}

function refresh_info()
{
	var i = 0;
	var dumpPlayers = Players;
	dumpPlayers.sort(function(a, b){return b.land.length-a.land.length});
	dumpPlayers.forEach(function(player) {
	    $("#player_info_"+player.id+" .player_land").text(player.land.length);
		$("#player_info_"+player.id).css("margin-top",i*20);
		i++;
	});
	$("#players_info").height(i*20);
	dumpPlayers.sort(function(a, b){return a.id-b.id});
}

function set_capitals()
{
	Players.forEach(function(player) {
	    $('rect[x='+player.capital[0]+'][y='+player.capital[1]+']').attr("style","fill:"+player.color);
		$('rect[x='+player.capital[0]+'][y='+player.capital[1]+']').attr("stroke-width","0.2");
		$('rect[x='+player.capital[0]+'][y='+player.capital[1]+']').attr("stroke","black");
		$('rect[x='+player.capital[0]+'][y='+player.capital[1]+']').attr("id","capital_"+player.id);
		$('rect[x='+player.capital[0]+'][y='+player.capital[1]+']').attr("type","capital");
		$('rect[x='+player.capital[0]+'][y='+player.capital[1]+']').attr("owner",player.id);
	});
}

function set_info_box()
{
	var html = "<div id='players_info'>";
	
	Players.forEach(function(player) {
		html += "<div id='player_info_"+player.id+"' land_size = '"+player.land.length+"' class='player_info'>\
		<div style='width:10px;height:10px;background-color:"+player.color+"' class='player_color'></div>\
		<div class='player_name'>"+player.name+" | </div>\
		<div class='player_land'>"+player.land.length+"</div>\
		</div>";
	});
	
	html += "</div>";
	
	$("#attack_wrapper").after(html);
}

function set_turn(caller)
{
	turn++;
	if(turn==Players.length)
	{
		turn = 0;
	}
	if(Players[turn].land.length<1)
	{
		return set_turn();
	}
	
	flush_war_vars();
	if(ships.length>0)
	{
		move_ships();
	}
	refresh_info();
	$("#attack").show();
	var player_docks = $('rect[type=dock][owner='+turn+']');
	if(player_docks.length>0)
	{
		$("#ship_army").show();
	}
	
	$("#turn_moves_wrapper").show();
	set_viewport();
	$("#turn_info").show();
	$("#reset_map_position").show();
	$("#attack_wrapper").show();
	
	$(".player_info").removeClass("active");
	var moves = Math.floor((Math.random() * 10) + 1);
	moves_count = moves;
	$("#turn_player_name").text(Players[turn].name);
	$("#turn_moves_count").text(moves);
	$("#player_info_"+turn).addClass("active");
}

function check_neighbours(item,owner)
{
	var result = false;
	var x = item.attr("x");
	var y = item.attr("y");
	var xp = parseInt(x)+1;
	var xm = parseInt(x)-1;
	var yp = parseInt(y)+1;
	var ym = parseInt(y)-1;
	
	var up_owner = $('rect[x='+x+'][y='+ym+']').attr("owner");
	var down_owner = $('rect[x='+x+'][y='+yp+']').attr("owner");
	var left_owner = $('rect[x='+xm+'][y='+y+']').attr("owner");
	var right_owner = $('rect[x='+xp+'][y='+y+']').attr("owner");
	
	if(up_owner == owner || down_owner == owner || left_owner == owner || right_owner == owner)
	{
		result = true;
	}
	return result;
}

function check_two_neighbours(item1,item2)
{
	var result = false;
	var x1 = parseInt(item1.attr("x"));
	var y1 = parseInt(item1.attr("y"));
	var x2 = parseInt(item2.attr("x"));
	var y2 = parseInt(item2.attr("y"));
	var xp = parseInt(x1)+1;
	var xm = parseInt(x1)-1;
	var yp = parseInt(y1)+1;
	var ym = parseInt(y1)-1;
	
	if((x1==x2 && (y2==yp || y2==ym)) || (y1==y2 && (x2==xp || x2==xm)))
	{
		result = true;
	}
	return result;
}