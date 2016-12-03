function PIDPlot(name, visibility, interpolation, color1, color2)
{
	this.name = name;
	this.visibility = visibility;
	this.interpolation = interpolation;

	this.userInputGroup = new PointGroup(name + "-input", interpolation, color1, visibility, false, 100000, true, true);
	this.readoutGroup = new PointGroup(name + "-readoout", InterpolationMode.Linear, color2, visibility, true, 100000, true, false);
	
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
