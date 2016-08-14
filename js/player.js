var Players = [];
var colors = ["#a39cb8","#bf3faa","#8cbfd9","#8bae85","#8bd8e3","#ba9cca","#d07777","#c99be3","#c5ab3d","#ecdd83","#7d89df","#ecaae2","#557979","#9c7375"];
var num_of_players = 0;

function get_players()
{
	var player_input = player_add_html(num_of_players);
	num_of_players++;
	var html = '<div id="get_players">\
		<h2>Add players</h2>\
		<div id="add_players_wrapper">\
		'+player_input+'\
		</div>\
		<button type="button" id="add_new_player">Add new player</button>\
		<button type="button" id="finish_adding_players">Done</button>\
	</div>';
	
	$("body").prepend(html);
	
	$("#add_new_player").click(function(){
		if(num_of_players<capitals.length)
		{
			var player_input = player_add_html(num_of_players);
			$("#add_players_wrapper").append(player_input);
			$( "#player_"+num_of_players+" .player" ).focus();
			num_of_players++;
		}
	});
	
	$("#finish_adding_players").click(function(){
		$(".add_player").each(function(){
			var id = $(this).attr("num");
			create_players(id);
		});
		$("#get_players").remove();
		Game.construct_game();
	});
}

function create_players(id)
{
	var name = $("#player_"+id+" .player").val();
	var element = {};
	element.id = id;
	
	var rand_color_index = Math.floor(Math.random() * colors.length);
	var rand_color = colors[rand_color_index];
	colors.splice(rand_color_index,1);
	
	element.color = rand_color;
	element.name = name;
	// element.colonies = [];
	element.land_size = 1;
	
	var rand_capital_index = Math.floor(Math.random() * capitals.length);
	var rand_capital = capitals[rand_capital_index];
	capitals.splice(rand_capital_index,1);
	
	element.capital = rand_capital;
	element.land = [element.capital]; // don't add capital to the land
	// element.land = [];
	
	Players.push(element);
}

function player_add_html(id)
{
	return '<div class="add_player" id="player_'+id+'" num="'+id+'"><input type="text" class="player" /></div>';
}