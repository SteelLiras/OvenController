function Server(ip)
{
	this.serverAddress = ip;
	this.maxPoints = 0;
	this.floatSupport = false;
	this.isOvenRunning = false;

	this.SendConfig = function(enforceSlope, callback)
	{
		if (this.isOvenRunning)
		{
			console.log("Tried SendConfig while oven is running!");
			return;
		}
		
		console.log("Send config...");
		console.log("Enforce Slope: " + ((enforceSlope) ? "1" : "0"));
		
		$.get(this.serverAddress + "/sendConfig?fs=" + ((enforceSlope) ? "1" : "0"), 
			function(data, status) { if (data == "OK") callback(); })
			.fail(function() { console.log("Send Config failed."); });
	}
	
	this.GetVersionInfo = function()
	{
		console.log("Get Version Info...");
		$.get(this.serverAddress + "/versionInfo", function(data) { server.SetHardwareConfig(data); })
		.fail(function() { console.log("Get Version failed."); });
	}
	
	this.GetTemperature = function(callback)
	{
		if (!this.isOvenRunning)
		{
			console.log("Tried GetTemp while oven is not running!");
			return;
		}
		
		$.get(this.serverAddress + "/getTemp", 
			function(data, status)
			{
				var time = parseFloat(data.split(';')[0]);
				var adcTop = parseFloat(data.split(';')[1]);
				var adcBottom = parseFloat(data.split(';')[2]);
				
				console.log("Get Temperature: Time: " + time + " ADC Top: " + adcTop + " ADC Bottom: " + adcBottom);
				
				if ((adcTop < 0) || (adcBottom < 0) || (time < 0) || isNaN(adcTop) || isNaN(adcBottom) || isNaN(time))
				{
					console.log("Get Temperature failed: One of the pooled values is negative or NaN.");
					return;
				}
				
				var resultTime = time / 1000;
				/*var resultTemperatureTop = Helpers.ADCToTemperature(adcTop);
				var resultTemperatureBottom = Helpers.ADCToTemperature(adcBottom);*/
				
				callback(resultTime, adcTop, adcBottom);
			}).fail(function() { console.log("Get Temp failed."); });
	}

	this.SendData = function(pointGroupTop, pointGroupBottom, callback)
	{
		if (this.isOvenRunning)
		{
			console.log("Tried SendData while oven is running!");
			return;
		}
		
		console.log("Send data...");
		
		var dataStringTop = this.CreateDataString(pointGroupTop);
		var dataStringBottom = this.CreateDataString(pointGroupBottom);
		var dataString = "2;" + dataStringTop + dataStringBottom;
		
		console.log("Data String:" + dataString);
		
		$.get(this.serverAddress + "/start?data=" + dataString, 
			function(data, status) 
			{
				if (data == "OK")
				{
					server.isOvenRunning = true;
					callback();
				}
				
			}).fail(function() { console.log("Send Data failed."); });
	}
			
	this.Stop = function()
	{
		console.log("Stopping...");
		$.get(this.serverAddress + "/stop", function (data)
		{
			server.isOvenRunning = false;
		}).fail(function() { console.log("There is no stopping."); });
	}
	
	this.CreateDataString = function(pointGroup)
	{
		var dataString = pointGroup.GetPointCount() + ";";
			
		for (var i=0;i<pointGroup.GetPointCount();i++)
		{
			var point = pointGroup.GetPoint(i);
			var temp = plotRenderer.limitY - point.Y;
			
			//Temperature is converted to int!!!
			dataString += ((point.X * 1000) | 0) + ";" + (temp | 0) + ";";
		}
		
		return dataString;
	}
	
	this.SetHardwareConfig = function(versionInfoData)
	{
		var dataSplit = versionInfoData.split(";");
		
		this.maxPoints = parseInt(dataSplit[0]);
		this.floatSupport = (dataSplit[1] == "1");
		
		console.log("Set hardware config: maxPoints=" + this.maxPoints + " floatSupport=" + this.floatSupport + ".");
	}	
	
	this.GetVersionInfo();
}