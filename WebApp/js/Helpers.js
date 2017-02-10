function Helpers()
{
}

Helpers.Initialize = function(canvasElementId)
{
	this.canvas = document.getElementById(canvasElementId);
}

Helpers.TemperatureToADC = function(temp)
{
	return 41943.0 / (5000 * Math.pow(Math.E, -(1580000.0 * (parseFloat(temp) - 25.0)) /
		(5963.0 * (20 * parseFloat(temp) + 5463))) + 41.0);
}

Helpers.ADCToTemperature = function(adc)
{
	return temperature = 1 / ((Math.log((((820 * 1023) / adc) - 820) / 100000) / 3950)
			+ (1 / 298.15)) - 273.15;
}

Helpers.GenerateTempLookup = function()
{
	var out = "{";
	
	for (var i=0;i<1024;i++)
	{
		var temp = ADCToTemperature(i);
		temp *= 100;
		out += temp.toFixed(0) + ", ";
	}
	
	out += " };";
	alert(out + "+End.");
}

Helpers.Distance = function(Vector1, Vector2)
{
	return Math.sqrt(Math.abs((Vector2.X - Vector1.X) * (Vector2.X - Vector1.X) 
			+ (Vector2.Y - Vector1.Y) * (Vector2.Y - Vector1.Y)));
}

Helpers.MulVec2 = function(Vector1, Vector2)
{
	return { X: Vector1.X * Vector2.X, Y: Vector1.Y * Vector2.Y };
}

Helpers.DivVec2 = function(Vector1, Vector2)
{
	return { X: Vector1.X / Vector2.X, Y: Vector1.Y / Vector2.Y };
}

Helpers.GetRandomColor = function()
{
	var letters = '0123456789ABCDEF'.split('');
	var color = '#';
	
	for (var i = 0; i < 6; i++ )
		color += letters[Math.floor(Math.random() * 16)];
	
	return color;
}

Helpers.GetClickCoordinates = function(e)
{
	var x;
	var y;
	
	if (e.pageX || e.pageY)
	{ 
	  x = e.pageX;
	  y = e.pageY;
	}			
	else 
	{ 
	  x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
	  y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
	} 
	
	x -= this.canvas.offsetLeft;
	y -= this.canvas.offsetTop;
	
	return {X: x, Y: y};
}