function PIDPlot(name, visibility, interpolation)
{
	this.name = name;
	this.visibility = visibility;
	this.interpolation = interpolation;
	
	var color = Helpers.GetRandomColor();
	
	this.userInputGroup = new PointGroup(name + "-input", interpolation, color, visibility, false, 100000, true, true);
	this.readoutGroup = new PointGroup(name + "-readoout", InterpolationMode.Linear, color, visibility, true, 100000, true, false);
	
	this.ClearAll = function()
	{
		this.userInputGroup.Clear();
		this.readoutGroup.Clear();
	}
	
	this.ClearReadout = function()
	{
		this.readoutGroup.Clear();
	}
	
	this.AddReadout = function(time, temp)
	{
		this.readoutGroup.AddPoint(time, temp);
	}
	
	this.Draw = function(ctx, scale, radius)
	{
		this.userInputGroup.Draw(ctx, scale, radius);
		this.readoutGroup.Draw(ctx, scale, radius);
	}
}
