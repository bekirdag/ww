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
var ship_arrived = false;
var arrived_ship = null;
var select_castle = false;
var colony_count = 0;
var winner,loser;
var wait_a_sec = false;

$ = jQuery;
$(document).ready(function(){
	$("#turn_info").hide();
	$("#reset_map_position").hide();
	$("#attack_wrapper").hide();
	select_map();
	
	$("#attack").on(action,function(){
		Game.button_actions.attack();
	});
	
	$("#select_castle").on(action,function(){
		select_castle = true;
		ship_arrived = false;
		$("#attack_text").text("Select you castle in newly invaded area");
		$("#select_castle").hide();
		$("#end_turn").show();
	});
	
	$("#end_turn").on(action,function(){
		if(select_castle)
		{
			$("#attack_text").text("You have to select your colony capital before you end your turn!");
			return false;
		}
		Game.button_actions.end_turn();
	});
	
	$("#battle").on(action,function(){
		Game.button_actions.battle();
	});
	
	$("#pass").on(action,function(){
		Game.set_turn();
	});
	
	$("#ship_army").on(action,function(){
		Game.button_actions.ship_army();
	});
	
	$("#map").on(action, "#map_svg rect" ,function(){
		
		if(!wait_a_sec)
		{
			// select attack forces
			var item = $(this);
			if(!select_castle && !ship_arrived && attack_bool && is_first_force_selected && attacking_force_land.length<attacked_enemy_land.length && item.attr("type")!="capital")
			{
				Game.war.select_attack_forces(item);
			}
			// select first force
			if(!select_castle && !ship_arrived && attack_bool && !is_first_force_selected)
			{
				Game.war.select_first_force(item);
			}
			// select rest enemy
			if(!select_castle && !ship_arrived && attack_bool && !is_enemy_selection_finished && is_first_enemy_selected)
			{
				Game.war.select_rest_enemy(item,false);
			}
			// select first enemy
			if(!select_castle && !ship_arrived && !is_first_enemy_selected && attack_bool && enemy_selection_started)
			{
				Game.war.select_first_enemy(item,false);
			}
			// conquer land
			if(!select_castle && !ship_arrived && !attack_bool && !dock_turn)
			{
				Game.conquer(item);
			}

			if(!select_castle && !ship_arrived && !is_dock_clicked && !conquer_turn && item.attr("owner")==turn)
			{
				Game.dock.select_first_dock(item);
			}
			// a dock turn,
			else if(!select_castle && !ship_arrived && dock_turn && is_dock_clicked && !conquer_turn)
			{
				var owner = item.attr("owner");

				if(item.attr("type")!="capital")
				{
					// if nothing have shipped yet
					if(!first_army_to_dock_selected && item.attr("type")!="dock")
					{
						Game.dock.select_first_army(item,owner);
					}
					// load the rest of the army
					else 
					{
						if(item.attr("type")!="dock" && owner == turn)
						{
							Game.dock.select_rest_army(item,owner);
						}
						else if(first_army_to_dock_selected && item.attr("type")=="dock" && item.attr("x")!=depart_dock.attr("x") && item.attr("y")!=depart_dock.attr("y") && item.attr("owner")!= turn)
						{
							Game.dock.send_shipment(item);
						}
					}
				}
			}
			else if(ship_arrived)
			{
				// a ship of user has arrived, unload army or fight if necessary
				Game.ship_arrival.rest(item);
			}
			else if(select_castle)
			{
				// a ship of user has arrived, unload army or fight if necessary
				Game.ship_arrival.select_castle(item);
			}
		}
		
	});
});

Game = {
	construct_game : function()
	{
		Game.set_capitals();
		Game.set_info_box();
		Game.set_turn("construct");
		Game.refresh_info();
	},
	attack : function()
	{
		// start attack procedure
		$("#attack").hide();
		$("#attack_text").text("Select enemy lands and your attacking forces");
	},
	set_battle : function(caller)
	{
		var attacker = turn;
		$("#attack_text").hide();
		$("#battle").hide();
		$("#attack").show();
		// $("#attack_wrapper").hide();
		var rand = Math.floor((Math.random() * 10) + 1);
		if(rand>5)
		{
			winner = first_enemy;
			loser = attacker;
		}
		else
		{
			winner = attacker;
			loser = first_enemy;
		}
		
		var attack_colony = $("rect[owner=attack_force]").attr("colony");
		var defense_colony = $("rect[owner=under_attack]").attr("colony");


		attacked_enemy_land.forEach(function(player_land) {
			var item = $('rect[x='+player_land[0]+'][y='+player_land[1]+']');
			console.log("type: "+item.attr("type")+" owner: "+item.attr("owner")+" loser:"+loser+" turn:"+turn);
			if((item.attr("owner")=="under_attack" && winner==turn && item.attr("type")=="colony_capital") || (item.attr("owner")=="attack_force" && loser==turn && item.attr("type")=="colony_capital"))
			{
				item.removeAttr("colony_capital");
				item.removeAttr("stroke");
				item.removeAttr("stroke-width");
			}
			
			// if the lost/caught land is a member of a colony, then mark the gathered item as a colony member
			if(winner==attacker)
			{
				if(typeof attack_colony!="undefined")
				{
					console.log("1");
					var colony = attack_colony;
					item.attr("colony",colony);
				}
				else
				{
					console.log("2");
					item.removeAttr("colony");
				}
			}

			if(winner==first_enemy)
			{
				if(typeof defense_colony!="undefined")
				{
					console.log("3");
					var colony = defense_colony;
					item.attr("colony",colony);
				}
				else
				{
					console.log("4");
					item.removeAttr("colony");
				}
			}
			
			
		    item.attr("owner",winner);
			item.attr("style","fill:"+Players[winner].color);
			
			Game.change_owner(item,winner,loser);
			
			if(ship_arrived && winner == turn)
			{
				item.attr("possible_castle",turn);
				item.attr("colony","player_"+turn+"_"+colony_count);
			}
		});

		attacking_force_land.forEach(function(player_land) {
			var item = $('rect[x='+player_land[0]+'][y='+player_land[1]+']');
			console.log("type: "+item.attr("type")+" owner: "+item.attr("owner")+" loser:"+loser+" turn:"+turn);
			if((item.attr("owner")=="under_attack" && winner==turn && item.attr("type")=="colony_capital") || (item.attr("owner")=="attack_force" && loser==turn && item.attr("type")=="colony_capital"))
			{
				item.removeAttr("colony_capital");
				item.removeAttr("stroke");
				item.removeAttr("stroke-width");
			}
			
			// if the lost/caught land is a member of a colony, then mark the gathered item as a colony member
			if(winner==attacker)
			{
				if(typeof attack_colony!="undefined")
				{
					console.log("5");
					var colony = attack_colony;
					item.attr("colony",colony);
				}
				else
				{
					console.log("6");
					item.removeAttr("colony");
				}
			}

			if(winner==first_enemy)
			{
				if(typeof defense_colony!="undefined")
				{
					console.log("7");
					var colony = defense_colony;
					item.attr("colony",colony);
				}
				else
				{
					console.log("8");
					item.removeAttr("colony");
				}
			}
			
		    item.attr("owner",winner);
			item.attr("style","fill:"+Players[winner].color);

			Game.change_owner(item,winner,loser);
			
			if(ship_arrived && winner == turn)
			{
				item.attr("possible_castle",turn);
				item.attr("colony","player_"+turn+"_"+colony_count);
			}
			
		});
		

		if(ship_arrived)
		{
			Game.ship_arrival.over();
		}

		// ship deploy battle happened
		if(ship_arrived && winner == turn)
		{
			$("#attack_text").text("Invaders won! Select your castle and end your turn");
			select_castle = true;
			// $("#select_castle").show();
			$("#select_castle").show();
			// $("#attack_text").text("Click on set castle button before you end your turn end set your castle");
		}
		else
		{
			if(attacked_enemy_land.length>0)
			{
				Game.drop_cutted_land(winner);
				Game.drop_cutted_land(loser,winner);
			}
			Game.set_turn("battle");
		}
		
	},
	change_owner : function(item,winner,loser)
	{
		var x = parseInt(item.attr("x"));
		var y = parseInt(item.attr("y"));
		var lost_land = [x,y];
		Players[winner].land.push(lost_land);
		// Players[winner].land_size++;
		if(loser!=="")
		{
			Game.remove_land(item,loser,"change_owner");
		}
	},
	remove_land : function(item,loser,caller)
	{
		var x = parseInt(item.attr("x"));
		var y = parseInt(item.attr("y"));
		var lost_land = [x,y];
		land_found = false;

		var land_index = "";
		$.each(Players[loser].land, function( index, player_land ) {

		  if(player_land[0]==x && player_land[1]==y)
		  {
			land_found = true;
			land_index = index;
		  }
		});

		if(land_found)
		{
			Players[loser].land.splice(land_index,1);
			// Players[loser].land_size--;
		}
	},
	drop_cutted_land : function(loser,winner)
	{
		var grid = new PF.Grid(map_w, map_h);
		var matrix = [];

		// set map unwalkable first
		for (i = 0; i < map_w; i++) { 
		    for (j = 0; j < map_h; j++) { 
			    grid.setWalkableAt(i, j, false); 
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

		// check each land piece to find a path to the capital
		var remove_items = [];
		Players[loser].land.forEach(function(player_land2) {
			var gridBackup = grid.clone();
		    var x = player_land2[0];
			var y = player_land2[1];
			var finder = new PF.AStarFinder();
			var path = finder.findPath(x, y, cap_x, cap_y, gridBackup);
			var item = $('rect[x='+x+'][y='+y+']');
			
			if((!path || path.length==0) && item.length && typeof item.attr("colony") == "undefined") // don't remove if it's a colony item
			{
				item.removeAttr("owner");
				item.removeAttr("style");
				remove_items.push(item);
			}
			else if(typeof item.attr("colony") != "undefined")
			{
				var colony_data = item.attr("colony");
				colony_data = colony_data.replace("player_","");
				var colony_capital_name = "colony_capital_" + colony_data;
				var cap_x_colony = $("#"+colony_capital_name).attr("x");
				var cap_y_colony = $("#"+colony_capital_name).attr("y");
				
				
				var gridBackup = grid.clone();
				var finder = new PF.AStarFinder();
				var path = finder.findPath(x, y, cap_x_colony, cap_y_colony, gridBackup);
				
				if((!path || path.length==0) && item.length)
				{
					item.removeAttr("owner");
					item.removeAttr("style");
					item.removeAttr("colony");
					remove_items.push(item);
					
					// if it's a colony capital, remove all the colony members
					if(item.attr("type")=="colony_capital")
					{
						item.removeAttr("type");
						item.removeAttr("stroke");
						item.removeAttr("stroke-width");
						$("rect[colony=player_"+colony_data+"]").each(function(){
							$(this).removeAttr("style");
							$(this).removeAttr("owner");
							item.removeAttr("colony");
							remove_items.push(item);
						});
					}
				}
			}
		});
		if(remove_items.length>0)
		{
			remove_items.forEach(function(item) {
			    Game.remove_land(item,loser,"drop_cutted_land");
			});
		}
		// remove user if only capital left
		if(Players[loser].land.length==1 && !is_dock_clicked)
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
			Game.change_owner(item,winner,loser);
			if(Players.length==1)
			{
				$("#turn_info").text(Player[winner].name + " has showed you how to play this game!");
			}
		}
		
	},
	flush_war_vars : function()
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
		$("#end_turn").hide();
		$("#select_castle").hide();
		arrived_ship = null;
		ship_arrived = false;
		select_castle = false;
		// winner = "";
		// loser = "";
	},
	refresh_info : function()
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
	},
	set_capitals : function()
	{
		Players.forEach(function(player) {
		    $('rect[x='+player.capital[0]+'][y='+player.capital[1]+']').attr("style","fill:"+player.color);
			$('rect[x='+player.capital[0]+'][y='+player.capital[1]+']').attr("stroke-width","0.2");
			$('rect[x='+player.capital[0]+'][y='+player.capital[1]+']').attr("stroke","black");
			$('rect[x='+player.capital[0]+'][y='+player.capital[1]+']').attr("id","capital_"+player.id);
			$('rect[x='+player.capital[0]+'][y='+player.capital[1]+']').attr("type","capital");
			$('rect[x='+player.capital[0]+'][y='+player.capital[1]+']').attr("owner",player.id);
		});
	},
	set_info_box : function()
	{
		var html = "<div id='players_info'>";

		Players.forEach(function(player) {
			html += "<div id='player_info_"+player.id+"' player='"+player.id+"' land_size = '"+player.land.length+"' class='player_info'>\
			<div style='width:10px;height:10px;background-color:"+player.color+"' class='player_color'></div>\
			<div class='player_name' player='"+player.id+"'>"+player.name+" | </div>\
			<div class='player_land'>"+player.land.length+"</div>\
			</div>";
		});

		html += "</div>";

		$("#attack_wrapper").after(html);
		
		$(".player_info").on(action,function(){
			set_center_to_user(parseInt($(this).attr("player")));
		});
		
	},
	set_turn : function(caller)
	{
		wait_a_sec = true;
		turn++;
		if(turn==Players.length)
		{
			turn = 0;
		}
		if(Players[turn].land.length<1)
		{
			return Game.set_turn("self");
		}

		Game.flush_war_vars();
		Game.capital_colony_touch_control(turn);
		
		if(ships.length>0)
		{
			move_ships();
		}
		
		setTimeout("Game.set_clickable()",300);
		
		ships.forEach(function(ship) {
			if(ship.owner==turn && ship.arrived && !ship_arrived)
			{
				ship_arrived = true;
				$("#attack_text").show();
				$("#attack_text").text(Players[turn].name+"'s ship has arrived. Please take action!");
				arrived_ship = ship;
				dock_x = arrived_ship.arrival.x;
				dock_y = arrived_ship.arrival.y;
				set_center(dock_x,dock_y);
				var dock = $('rect[x='+dock_x+'][y='+dock_y+']');
				Game.ship_arrival.dock_set(dock);
			}
		});
		
		if(ship_arrived)
		{
			return false;
		}
		
		
		Game.refresh_info();
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
	},
	check_neighbours : function(item,owner)
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
		
		if(up_owner == owner)
		{
			if(typeof $('rect[x='+x+'][y='+ym+']').attr("colony") != "undefined")
			{
				result = $('rect[x='+x+'][y='+ym+']').attr("colony");
			}
			else
			{
				result = "no_colony";
			}
		}
		
		if(down_owner == owner)
		{
			if(typeof $('rect[x='+x+'][y='+yp+']').attr("colony") != "undefined")
			{
				result = $('rect[x='+x+'][y='+yp+']').attr("colony");
			}
			else
			{
				result = "no_colony";
			}
		}
		
		if(left_owner == owner)
		{
			if(typeof $('rect[x='+xm+'][y='+y+']').attr("colony") != "undefined")
			{
				result = $('rect[x='+xm+'][y='+y+']').attr("colony");
			}
			else
			{
				result = "no_colony";
			}
		}
		
		if(right_owner == owner)
		{
			if(typeof $('rect[x='+xp+'][y='+y+']').attr("colony") != "undefined")
			{
				result = $('rect[x='+xp+'][y='+y+']').attr("colony");
			}
			else
			{
				result = "no_colony";
			}
		}
		
		return result;
	},
	check_colony_neighbours : function(item,owner)
	{
		var result = false;
		var x = item.attr("x");
		var y = item.attr("y");
		var xp = parseInt(x)+1;
		var xm = parseInt(x)-1;
		var yp = parseInt(y)+1;
		var ym = parseInt(y)-1;

		var up_owner = $('rect[x='+x+'][y='+ym+']').attr("colony");
		var down_owner = $('rect[x='+x+'][y='+yp+']').attr("colony");
		var left_owner = $('rect[x='+xm+'][y='+y+']').attr("colony");
		var right_owner = $('rect[x='+xp+'][y='+y+']').attr("colony");

		if(up_owner == owner || down_owner == owner || left_owner == owner || right_owner == owner)
		{
			result = true;
		}
		return result;
	},
	check_two_neighbours : function(item1,item2)
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
	},
	war : {
		select_attack_forces : function(item)
		{
			var owner = item.attr("owner");
			if(owner== turn)
			{
				var is_force_neighbour = Game.check_neighbours(item,"attack_force");
				if(is_force_neighbour)
				{
					item.attr("style","fill:blue");
					item.attr("owner","attack_force");
					var position = [parseInt(item.attr("x")),parseInt(item.attr("y"))];
					attacking_force_land.push(position);
					Game.remove_land(item,turn,"rest force");
				}
			}
		},
		select_first_force : function(item)
		{
			var owner = item.attr("owner");
			if(owner== turn && item.attr("type")!="capital")
			{
				var is_force_neighbour = Game.check_neighbours(item,"under_attack");
				if(is_force_neighbour)
				{
					item.attr("style","fill:blue");
					item.attr("owner","attack_force");
					var position = [parseInt(item.attr("x")),parseInt(item.attr("y"))];
					attacking_force_land.push(position);
					is_first_force_selected = true;
					Game.remove_land(item,turn,"first force");
				}
			}
		},
		select_rest_enemy : function(item,dock)
		{
			var owner = item.attr("owner");
			var army_size_check = (dock) ? (attacked_enemy_land.length<=arrived_ship.army_size) : (attacked_enemy_land.length<(Players[turn].land.length-1));
			if(owner == first_enemy && typeof owner!=="undefined" && item.attr("type")!="capital"  && army_size_check)
			{
				var is_enemy_neighbour = Game.check_neighbours(item,"under_attack");
				if(is_enemy_neighbour)
				{
					item.attr("style","fill:red");
					item.attr("owner","under_attack");
					var position = [parseInt(item.attr("x")),parseInt(item.attr("y"))];
					attacked_enemy_land.push(position);
					Game.remove_land(item,owner,"rest enemy");
				}
			}
			else if(attacked_enemy_land.length==Players[turn].land.length-1)
			{
				// $('rect[owner='+turn+']').each(function(){
				// 	if(item.attr("type")!="capital")
				// 	{
				// 		item.attr("style","fill:blue");
				// 		item.attr("owner","attack_force");
				// 		var position = [parseInt(item.attr("x")),parseInt(item.attr("y"))];
				// 		attacking_force_land.push(position);
				// 		is_first_force_selected = true;
				// 	}
				// });
			}
		},
		select_first_enemy : function(item,dock)
		{
			var owner = item.attr("owner");
			var army_size_check = (dock) ? (attacked_enemy_land.length<=arrived_ship.army_size) : (attacked_enemy_land.length<(Players[turn].land.length-1));
			if(typeof owner!=="undefined" && owner!= turn && item.attr("type")!="capital" && army_size_check)
			{
				var is_enemy_neighbour = Game.check_neighbours(item,turn);
				if(is_enemy_neighbour || dock)
				{
					item.attr("style","fill:red");
					item.attr("owner","under_attack");
					var position = [parseInt(item.attr("x")),parseInt(item.attr("y"))];
					attacked_enemy_land.push(position);
					is_first_enemy_selected = true;
					first_enemy = parseInt(owner);
					Game.remove_land(item,owner,"first enemy");
					return owner;
				}
			}
		}
	},
	conquer : function(item)
	{
		// check ownership
		var owner = item.attr("owner");
		// check neighbours
		var is_neighbour = Game.check_neighbours(item,turn);

		if(typeof owner === 'undefined' && is_neighbour)
		{
			conquer_turn = true;
			$("#attack").hide();
			$("#ship_army").hide();
			item.attr("style","fill:"+Players[turn].color);
			item.attr("owner",turn);
			
			if(is_neighbour!="no_colony")
			{
				item.attr("colony",is_neighbour);
			}
			
			moves_count--;
			$("#turn_moves_count").text(moves_count);
			var land = [parseInt(item.attr("x")),parseInt(item.attr("y"))];
			Players[turn].land.push(land);
			if(moves_count==0)
			{
				Game.set_turn("conquer");
			}
		}
	},
	conquer_colony: function(item,colony)
	{
		$("#select_castle").show();
		// check ownership
		var owner = item.attr("owner");
		// check neighbours
		var is_neighbour = Game.check_colony_neighbours(item,colony);
		if(typeof owner === 'undefined' && is_neighbour)
		{
			conquer_turn = true;
			// $("#attack_wrapper").hide();
			$("#ship_army").hide();
			item.attr("style","fill:"+Players[turn].color);
			// Players[turn].land_size++;
			item.attr("owner",turn);
			item.attr("colony",colony);
			item.attr("possible_castle",turn);
			moves_count--;
			$("#turn_moves_count").text(moves_count);
			var land = [parseInt(item.attr("x")),parseInt(item.attr("y"))];
			Players[turn].land.push(land);
			if(moves_count==0)
			{
				// Game.set_turn("conquer");
			}
		}
	},
	dock : {
		select_first_dock : function(item)
		{
			if(item.attr("type")=="dock")
			{
				is_dock_clicked = true;
				depart_dock = item;
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
					"path":[],
					"arrived":false
				};
			}
		},
		select_first_army : function(item,owner)
		{
			var is_force_dock_neighbour = Game.check_two_neighbours(item,depart_dock);
			if(is_force_dock_neighbour && owner == turn)
			{
				item.attr("owner","shipment");
				item.removeAttr("style");
				Game.remove_land(item,owner,"first army to dock");
				shipment.army_size++;
				first_army_to_dock_selected = true;
			}
		},
		select_rest_army : function(item,owner)
		{
			var is_neighbour = Game.check_neighbours(item,"shipment");
			var is_force_dock_neighbour = Game.check_two_neighbours(item,depart_dock);
			if(is_neighbour || is_force_dock_neighbour)
			{
				item.attr("owner","shipment");
				item.removeAttr("style");
				Game.remove_land(item,owner,"rest army to dock");
				shipment.army_size++;
			}
		},
		send_shipment : function(item)
		{
			// shipment is over, set the departure
			shipment.arrival.x = parseInt(item.attr("x"));
			shipment.arrival.y = parseInt(item.attr("y"));
			shipment.path = get_ship_path(shipment.departure,shipment.arrival);
			// var shipment_backup = shipment.clone();
			ships.push(shipment);
			// set all the shipment owners to undefined
			$('rect[owner=shipment]').removeAttr("owner");
			// empty shipment object
			create_ships(shipment);
			shipment = {};
			// shipping has ended set the new turn
			Game.drop_cutted_land(turn);
			depart_dock.removeAttr("owner");
			depart_dock.removeAttr("style");
			depart_dock.attr("stroke-width","0.2");
			depart_dock.attr("stroke","pink");
			Game.remove_land(depart_dock,turn,"dock given away");
			
			Game.set_turn("shipment process ended");
		}
	},
	button_actions : {
		attack : function()
		{
			enemy_selection_started = true;
			$("#turn_moves_wrapper").hide();
			$("#ship_army").hide();
			$("#battle").show();
			$("#attack_text").show();
			attack_bool = true;
			Game.attack();
		},
		battle : function()
		{
			if(!ship_arrived)
			{
				if(attacked_enemy_land.length!=attacking_force_land.length)
				{
					$("#attack_text").text("Number of attacked lands must match attacking forces!");
					return false;
				}
				Game.set_battle("battle button");
			}
			else 
			{
				Game.set_battle("battle button");
			}
			
		},
		ship_army : function()
		{
			$("#ship_army").hide();
			dock_turn = true;
			$("#attack").hide();
			$("#attack_text").show();
			$("#attack_text").text("Select your dock");
		},
		end_turn : function()
		{
			// Game.set_battle("end turn button");
		}
	},
	ship_arrival : 
	{
		dock_set: function(dock)
		{
			$("#attack_wrapper").show();
			$("#attack").hide();
			$("#end_turn").show();
			moves_count = arrived_ship.army_size;
			
			$("#turn_moves_count").text(arrived_ship.army_size);
			if(typeof dock.attr("owner") != "undefined")
			{
				if(dock.attr("owner")!=turn)
				{
					Game.war.select_first_enemy(dock,true);
					$("#end_turn").hide();
					$("#battle").show();
				}
			}
			else
			{
				dock.attr("owner",turn);
				dock.attr("style","fill:"+Players[turn].color);
				Game.change_owner(dock,turn,"");
				// var colony = {owner:turn,capital:[arrived_ship.arrival.x,arrived_ship.arrival.y]};
				// Players[turn].colonies.push(colony);
				var colony_id = colony_count;
				dock.attr("colony","player_"+turn+"_"+colony_id);
				
				// dock.attr("colony","player_"+turn+"_"+colony_id);
				if(moves_count==0)
				{
					Game.ship_arrival.over();
					turn--;
					// Game.set_turn("ship deployed");
				}
			}
		},
		rest : function(item)
		{
			if(moves_count>0)
			{
				if(typeof item.attr("owner") != "undefined")
				{
					if(item.attr("owner") != turn)
					{
						Game.war.select_rest_enemy(item,true);
					}
				}
				else
				{
					// select_castle = true;
					Game.ship_arrival.over();
					var colony_id = colony_count;
					Game.conquer_colony(item,"player_"+turn+"_"+colony_id);
				}
			}
			else
			{
				Game.ship_arrival.over();
				// Game.set_battle();
			}
		},
		over : function()
		{
			var index = ships.indexOf(arrived_ship);
			if (index > -1) {
			    ships.splice(index, 1);
			}
			// $("circle[cx="+arrived_ship.arrival.x+"][cy="+arrived_ship.arrival.y+"]").remove();
			$("#ship_"+arrived_ship.id).remove();
			$("#path_of_"+arrived_ship.id).remove();
		},
		select_castle : function(item)
		{
			if(item.attr("owner")==turn && item.attr("possible_castle")==turn && item.attr("type")!="dock")
			{
				Game.set_colony_capital(item);
				
				if(attacked_enemy_land.length>0)
				{
					Game.drop_cutted_land(winner);
					Game.drop_cutted_land(loser,winner);
				}
				colony_count++;
				Game.set_turn("select castle");
			}
		}
	},
	set_colony_capital : function(item)
	{
		select_castle = false;
		item.attr("style","fill:"+Players[turn].color);
		item.attr("stroke-width","0.1");
		item.attr("stroke","black");
		item.attr("id","colony_capital_"+Players[turn].id+"_"+colony_count);
		item.attr("type","colony_capital");
		item.attr("owner",Players[turn].id);
		$('rect[possible_castle]').removeAttr("possible_castle");
		// var colony = {capital:[item.attr("x"),item.attr("x")]};
		var colony_id = colony_count;
		// Players[turn].colonies.capital = [item.attr("x"),item.attr("y")];
		
	},
	capital_colony_touch_control : function(player)
	{
		var grid = new PF.Grid(map_w, map_h);
		var matrix = [];

		// set map unwalkable first
		for (i = 0; i < map_w; i++) { 
		    for (j = 0; j < map_h; j++) { 
			    grid.setWalkableAt(i, j, false); 
			}
		}
		// then set walkable player owned land
		Players[player].land.forEach(function(player_land) {
		    var x = player_land[0];
			var y = player_land[1];
			grid.setWalkableAt(x, y, true); 
		});
		
		var capital = $("#capital_"+player);
		var cap_x = parseInt(capital.attr("x"));
		var cap_y = parseInt(capital.attr("y"));
		
		$("rect[type=colony_capital]").each(function(){
			
			var cap_x_colony = $(this).attr("x");
			var cap_y_colony = $(this).attr("y");
			
			var gridBackup = grid.clone();
			var finder = new PF.AStarFinder();
			var path = finder.findPath(cap_x, cap_y, cap_x_colony, cap_y_colony, gridBackup);	
			
			if(path.length>0)
			{
				var colony_name = $(this).attr("colony");
				// remove colony capital and it's members, tide it to the capital
				$(this).removeAttr("type");
				$(this).removeAttr("id");
				$(this).removeAttr("stroke");
				$(this).removeAttr("stroke-width");
				
				$("rect[colony="+colony_name+"]").removeAttr("colony");
			}
		});
	},
	set_clickable : function()
	{
		wait_a_sec = false;
	}
};