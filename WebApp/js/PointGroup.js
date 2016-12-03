var InterpolationMode = { Linear : 0, Digital : 1 };

//TODO: Point parsing, Read-only functionality, floating point check, digital interpolation
function PointGroup(name, interpolation, color, visibility, readonly, limit, floatingPoint)
{
	this.name = name;
	this.points = [];
	this.interpolation = interpolation;
	this.color = color;
	this.visibility = visibility;
	this.readonly = readonly;
	this.limit = limit;
	this.floatingPoint = floatingPoint;
	
	this.AddPoint = function(x, y)
	{
		this.points.push({X:x, Y:y});
		this.points.sort(function(a, b){return a.X - b.X});
	}
	
	this.Clear = function()
	{
		this.points = [];
	}
	
	this.RemovePoint = function(index)
	{
		if (index != -1)
			this.points.splice(index, 1);
	}
	
	this.GetPoint = function(index)
	{
		return this.points[index];
	}
	
	this.SetPoint = function(index, point)
	{
		this.points[index] = point;
		this.points.sort(function(a, b){return a.X - b.X});
	}
	
	this.GetPointCount = function()
	{
		return this.points.length;
	}
	
	this.Draw = function(ctx, scale, radius)
	{
		if (!this.visibility)
			return;

		for (var i=0;i<this.GetPointCount();i++)
		{
			ctx.beginPath();
			ctx.arc(this.points[i].X * scale.X, this.points[i].Y * scale.Y, radius - 2, 0, 2 * Math.PI, false);
			ctx.fillStyle = this.color;
			ctx.fill();
			ctx.lineWidth = 2;
			ctx.strokeStyle = '#000000';
			ctx.stroke();
			
			if (i != this.GetPointCount() - 1)
			{
				ctx.beginPath();
				ctx.moveTo(this.points[i].X * scale.X, this.points[i].Y * scale.Y);
				ctx.lineTo(this.points[i + 1].X * scale.X, this.points[i + 1].Y * scale.Y);
				ctx.stroke();
			}
		}
	}
}