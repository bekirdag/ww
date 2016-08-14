var move_per_turn = 5;
function get_ship_path(departure,arrival)
{
	var water_gridBackup = water_grid.clone();
	var finder = new PF.AStarFinder();
	var path = finder.findPath(departure.x,departure.y,arrival.x,arrival.y,water_gridBackup);
	return path;
}

function create_ships(ship)
{
	ship_shapes(ship,true);
}

function move_ships()
{
	ships.forEach(function(ship) {
		if(ship.owner==turn)
		{
			if(ship.path.length>move_per_turn)
			{
				$("#ship_"+ship.id).remove();
				$("#path_of_"+ship.id).remove();
				for (var i=0; i < move_per_turn; i++) {
					ship.path.shift();
				};
				ship_shapes(ship);
				if(ship.path.length<=1)
				{
					ship.arrived = true;
				}
			}
			else
			{
				ship.arrived = true;
			}
		}
	});
}

function ship_shapes(ship,first)
{
	var add = (first===true) ? 0.45 : 0;
	var circle= makeSVG('circle', {cx: (ship.path[0][0]+add), cy: (ship.path[0][1]+add), r:0.5, fill: Players[ship.owner].color, type:"ship",id:"ship_"+ship.id});
	document.getElementById('viewport').appendChild(circle);

	var path_str = "M"+ship.path[0][0]+" "+ship.path[0][1];

	var milestone = 0;
	ship.path.forEach(function(point) {
		path_str += " L"+point[0]+" "+point[1];
		milestone++;
		if(milestone==move_per_turn)
		{
			path_str += " L"+(point[0]+0.5)+" "+(point[1]+0.5);
			path_str += " L"+point[0]+" "+point[1];
			milestone = 0;
		}
	});
	var path = makeSVG('path',{d: path_str,fill:"none","stroke-width":0.06,stroke:Players[ship.owner].color,"stroke-opacity":"0.3",type:"ship_path",id:"path_of_"+ship.id});
	// console.log(path);
	document.getElementById('viewport').appendChild(path);
}

function makeSVG(tag, attrs) {
	var el= document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs)
        el.setAttribute(k, attrs[k]);
    return el;
}