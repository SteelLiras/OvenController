function Server(ip, statusChangedCallback)
{
	this.Status = { NotConnected: "Disconnected", Connecting : "Connecting...", Ready : "Ready", Failed : "Failed"  };
	
	this.serverAddress = ip;
	this.maxPoints = 0;
	this.floatSupport = false;
	this.isOvenRunning = false;
	this.webSocket;
	this.tempCallback = null;
	this.serverStatus = this.Status.NotConnected;
	this.statusChangedCallback = statusChangedCallback;

	this.Connect = function()
	{
		this.webSocket = new WebSocket(this.serverAddress);
		
		this.serverStatus = this.Status.Connecting;
		this.statusChangedCallback(null);
		
		this.webSocket.onopen = function(evt) { server.OnOpen(evt) };
		this.webSocket.onmessage = function(evt) { server.OnMessage(evt); };
		this.webSocket.onclose = function(evt) { server.OnClose(evt); };
	}
	
	this.SendMessage = function(msg)
	{
		if (this.webSocket)
			this.webSocket.send(msg);
	}
	
	this.OnClose = function(evt)
	{
		if (evt.code == 1000)
			this.serverStatus = this.Status.NotConnected;
		else
			this.serverStatus = this.Status.Failed;
		
		this.statusChangedCallback(evt);
	}
	
	this.OnMessage = function(evt)
	{
		var msg = evt.data;

		if (msg[0] == "V")
			server.SetHardwareConfig(msg);
		else if (msg[0] == "C")
			server.SendData(this.pointGroupTop, this.pointGroupBottom);
		else if (msg[0] == "Q")
		{
			this.isOvenRunning = true;
			this.callback();
		}
		else if (msg[0] == "T")
		{
			var temps = this.GetTemperature(msg);
			PlotTemp(temps.Time, temps.Top, temps.Bottom);
		}
		else if (msg[0] == "S")
		{
			isOvenRunning = false;
			alert("Oven stopped");
		}
	}
	
	this.OnOpen = function(evt)
	{
		this.serverStatus = this.Status.Ready;
		this.statusChangedCallback(evt);
		
		this.GetVersionInfo();
	}
	
	this.Start = function(enforceSlope, topGroup, bottomGroup, callback)
	{
		alert("oven starting");
		this.pointGroupTop = topGroup;
		this.pointGroupBottom = bottomGroup;
		this.callback = callback;
	
		this.SendConfig(enforceSlope);
	}
	
	this.SendConfig = function(enforceSlope)
	{
		if (this.isOvenRunning)
		{
			console.log("Tried SendConfig while oven is running!");
			return;
		}
		
		console.log("Send config...");
		console.log("Enforce Slope: " + ((enforceSlope) ? "1" : "0"));

		this.SendMessage("C:" + ((enforceSlope) ? "1" : "0") + ":");
	}
	
	this.GetVersionInfo = function()
	{
		console.log("Get Version Info...");
		this.SendMessage("V:");
	}
	
	this.GetTemperature = function(data)
	{
		if (!this.isOvenRunning)
		{
			console.log("Tried GetTemp while oven is not running!");
			return;
		}
		
		var time = parseFloat(data.split(':')[1]);
		var adcTop = parseFloat(data.split(':')[2]);
		var adcBottom = parseFloat(data.split(':')[3]);
		
		console.log("Get Temperature: Time: " + time + " ADC Top: " + adcTop + " ADC Bottom: " + adcBottom);
		
		if ((adcTop < 0) || (adcBottom < 0) || (time < 0) || isNaN(adcTop) || isNaN(adcBottom) || isNaN(time))
		{
			console.log("Get Temperature failed: One of the pooled values is negative or NaN.");
			return;
		}
		
		var resultTime = time / 1000;

		return { Time: resultTime, Top: adcTop, Bottom: adcBottom };
	}

	this.pointGroupTop = null;
	this.pointGroupBottom = null;
	this.callback = null;
	
	this.SendData = function(pointGroupTop, pointGroupBottom)
	{
		if (this.isOvenRunning)
		{
			console.log("Tried SendData while oven is running!");
			return;
		}
		
		console.log("Send data...");

		var dataStringTop = this.CreateDataString(pointGroupTop);
		var dataStringBottom = this.CreateDataString(pointGroupBottom);
		var dataString = "2:" + dataStringTop + dataStringBottom;
		
		console.log("Data String:" + dataString);
		
		this.SendMessage("Q:" + dataString);
	}
			
	this.Stop = function()
	{
		console.log("Stopping...");
		this.SendMessage("S:");
	}
	
	this.CreateDataString = function(pointGroup)
	{
		var dataString = pointGroup.GetPointCount() + ":";
			
		for (var i=0;i<pointGroup.GetPointCount();i++)
		{
			var point = pointGroup.GetPoint(i);
			var temp = plotRenderer.limitY - point.Y;
			
			//Temperature is converted to int!!!
			dataString += ((point.X * 1000) | 0) + ":" + (temp | 0) + ":";
		}
		
		return dataString;
	}
	
	this.SetHardwareConfig = function(versionInfoData)
	{
		var dataSplit = versionInfoData.split(":");

		this.maxPoints = parseInt(dataSplit[1]);
		this.floatSupport = (dataSplit[2] == "1");
		
		console.log("Set hardware config: maxPoints=" + this.maxPoints + " floatSupport=" + this.floatSupport + ".");
	}	
}