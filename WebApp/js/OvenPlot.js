function OvenPlot()
{
	this.TopLampPlot = new PIDPlot("Top Lamp", true, InterpolationMode.Digital);
	this.BottomLampPlot = new PIDPlot("Bottom Lamp", true, InterpolationMode.Digital);
	
	this.ClearAll = function()
	{
		this.TopLampPlot.ClearAll();
		this.BottomLampPlot.ClearAll();
	}
	
	this.ClearReadout = function()
	{
		this.TopLampPlot.ClearReadout();
		this.BottomLampPlot.ClearReadout();
	}
	
	this.AddReadout = function(time, tempTop, tempBottom)
	{
		this.TopLampPlot.AddReadout(time, tempTop);
		this.BottomLampPlot.AddReadout(time, tempBottom);
	}
	
	this.Draw = function(ctx, scale, radius)
	{
		this.TopLampPlot.Draw(ctx, scale, radius);
		this.BottomLampPlot.Draw(ctx, scale, radius);
	}
}