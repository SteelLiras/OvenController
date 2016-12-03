function PIDPlot(name, visibility, interpolation)
{
	this.name = name;
	this.visibility = visibility;
	this.interpolation = interpolation;
	
	this.userInputGroup = new PointGroup(name + "-input", interpolation, Helpers.GetRandomColor(), visibility, false, 100000, true);
	this.readoutGroup = new PointGroup(name + "-readoout", InterpolationMode.Linear, Helpers.GetRandomColor(), visibility, true, 100000, true);
	
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
