function PlotManager(canvasElementId, OvenPlot, PlotRenderer)
{
	this.SelectedLamp = { Top :0, Bottom :1 };
	
	this.ovenPlot = OvenPlot;
	this.plotRenderer = plotRenderer;
	this.selectedLamp = this.SelectedLamp.Top;
	this.snapping = true;
	
	this.isDraggingPoint = false;
	this.draggedPoint = null;
	this.dragStartTime = null;
	
	this.maxClickTime = 200;
	this.pointClickRadius = 25;
	
	this.Initialize = function(canvasElementId)
	{
		var canvas = document.getElementById(canvasElementId);
		
		canvas.addEventListener('mousedown', function(evt){ plotManager.BeginDragPoint(evt); }, true);
		canvas.addEventListener('mouseup', function(evt){ plotManager.EndDragPoint(evt); }, true);
		canvas.addEventListener('mousemove', function(evt){ plotManager.DragPoint(evt); }, true);
	}
	
	this.GetActiveInputGroup = function()
	{
		if (this.selectedLamp == this.SelectedLamp.Top)
			return this.ovenPlot.TopLampPlot.userInputGroup;
		else
			return this.ovenPlot.BottomLampPlot.userInputGroup;
	}
		
	this.AddPoint = function(x, y)
	{
		this.GetActiveInputGroup().AddPoint(x, y);
		plotRenderer.UpdateRenderer();
	}
		
	this.Initialize(canvasElementId);
	
	this.BeginDragPoint = function(e)
	{
		this.dragStartTime = new Date().getTime();	
	
		if (e.shiftKey)
			return;
	
		var clickedPoint = Helpers.GetClickCoordinates(e);
		this.draggedPoint = this.GetPointIdAtCoords(clickedPoint);
		
		if (this.draggedPoint.Index != -1)
			this.isDraggingPoint = true;
	}

	this.DragPoint = function(e)
	{
		if (!this.isDraggingPoint)
			return;
	
		var clickedPoint = Helpers.GetClickCoordinates(e);

		var pointGroup = this.draggedPoint.Group;
		
		pointGroup.SetPoint(this.draggedPoint.Index, plotRenderer.ScreenToGridPoint(clickedPoint, this.snapping));
		pointGroup.GetPoint(this.draggedPoint.Index).dragged = true;
		pointGroup.Sort();

		for	(var i=0;i<pointGroup.GetPointCount();i++)
		{
			if (pointGroup.GetPoint(i).dragged)
			{
				this.draggedPoint.Index = i;
				delete pointGroup.GetPoint(i).dragged;
				break;
			}
		}
		
		plotRenderer.UpdateRenderer();
	}
	
	this.EndDragPoint = function(e)
	{			
		this.isDraggingPoint = false;
		var dragEndTime = new Date().getTime();
		
		if ((dragEndTime - this.dragStartTime < this.maxClickTime) && (!this.isDraggingPoint))
			this.CanvasClicked(e);
	}
	
	this.CanvasClicked = function(e)
	{
		var clickedPoint = Helpers.GetClickCoordinates(e);

		if (!e.shiftKey)
		{
			var point = this.plotRenderer.ScreenToGridPoint(clickedPoint, this.snapping);
			this.GetActiveInputGroup().AddPoint(point.X, point.Y);
		}
		else
		{
			var point = this.GetPointIdAtCoords(clickedPoint);

			if (point.Index != -1)
				point.Group.RemovePoint(point.Index);
		}

		plotRenderer.UpdateRenderer();
	}
	
	this.GetPointIdAtCoords = function(coords)
	{
		var topPointGroup = ovenPlot.TopLampPlot.userInputGroup;
		var bottomPointGroup = ovenPlot.BottomLampPlot.userInputGroup;
	
		for (var i=0;i<topPointGroup.GetPointCount();i++)
		{
			if (Helpers.Distance(coords, Helpers.MulVec2(topPointGroup.GetPoint(i), plotRenderer.scale)) <= this.pointClickRadius)
				return { Group: topPointGroup, Index: i };
		}
		
		for (var i=0;i<bottomPointGroup.GetPointCount();i++)
		{
			if (Helpers.Distance(coords, Helpers.MulVec2(bottomPointGroup.GetPoint(i), plotRenderer.scale)) <= this.pointClickRadius)
				return { Group: bottomPointGroup, Index: i };
		}
	
		return { Group: "", Index: -1};
	}
}