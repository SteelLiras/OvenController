function PlotRenderer(canvasElementId, OvenPlot)
{
	this.ovenPlot = OvenPlot;
	
	this.backgroundColor = "#555555";
	this.pointRadius = 6;

	this.Initialize = function(canvasElementId)
	{
		this.canvas = document.getElementById(canvasElementId);
		this.ctx = this.canvas.getContext("2d");
		
		window.addEventListener('resize', this.ResizeCanvas, false);

		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
	}
	
	this.ResizeCanvas = function()
	{
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		
		this.UpdateScale(600, 300);
	}
		
	this.ScreenToGridPoint = function(point, snapping)
	{
		var pointCoords = Helpers.DivVec2(point, this.scale);
	
		if (snapping)
			pointCoords = {X: Math.round(pointCoords.X / this.gridCell.X) * this.gridCell.X, Y: Math.round(pointCoords.Y / this.gridCell.Y) * this.gridCell.Y }
			
		return pointCoords;
	}
	
	this.UpdateScale = function(scaleX, scaleY)
	{
		var cellX = Math.pow(10, Math.floor(Math.log10(scaleX)) - 1);
		var cellY = Math.pow(10, Math.floor(Math.log10(scaleY)) - 1);

		this.limitY = scaleY;
		var scaleX = canvas.width / scaleX;
		var scaleY = canvas.height / scaleY;
		
		this.scale = { X: scaleX, Y: scaleY };
		this.gridCell = { X: cellX, Y: cellY };
		
		this.UpdateRenderer();
	}
		
	this.UpdateRenderer = function()
	{
		this.ctx.fillStyle = this.backgroundColor;
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		this.DrawGrid();
		this.ovenPlot.Draw(this.ctx, this.scale, this.pointRadius);
	}
	
	this.DrawGrid = function()
	{
		this.ctx.strokeStyle = "#000000";
		this.ctx.fillStyle="#FFFFFF";
		this.ctx.font = "13px Sans-Serif";
		
		for (var x=0;x<=this.canvas.width / this.scale.X;x++)
		{	
			if ((x % this.gridCell.X == 0) && (x != 0))
				this.ctx.fillText(x, x * this.scale.X + 4, 15);
		
			this.ctx.beginPath();
			this.ctx.moveTo(x * this.scale.X, 0);
			
			if (x % this.gridCell.X == 0)
			{
				var cx = x;
				while (cx > 1)
				{
					var rlx = Math.floor(Math.log(cx) / Math.log(this.gridCell.X));
					var u = Math.pow(this.gridCell.X, rlx);
					
					if (cx%u == 0)
					{
						this.ctx.lineWidth = Math.pow(2, rlx - 1);
						break;
					}
					
					cx = cx%u;
				}

				this.ctx.lineTo(x * this.scale.X, this.canvas.height);
			}
			
			this.ctx.stroke();
		}

		for (var y=0;y<=this.canvas.height / this.scale.Y;y++)
		{
			if (y % this.gridCell.Y == 0)
				this.ctx.fillText(this.limitY - y, 5, y * this.scale.Y - 4);
			
			this.ctx.beginPath();
			this.ctx.moveTo(0, y * this.scale.Y);
			
			if (y % this.gridCell.Y == 0)
			{
				var cy = y;
				while (cy > 1)
				{
					var rly = Math.floor(Math.log(cy) / Math.log(this.gridCell.Y));
					var u = Math.pow(this.gridCell.Y, rly);
					
					if (cy%u == 0)
					{
						this.ctx.lineWidth = Math.pow(2, rly - 1);
						break;
					}
					
					cy = cy%u;
				}

				this.ctx.lineTo(this.canvas.width, y * this.scale.Y);
			}
			
			this.ctx.stroke();
		}
	}
		
	this.Initialize(canvasElementId);
}