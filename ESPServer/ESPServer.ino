#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include <FS.h>
#include <SoftwareSerial.h>

const char* ssid = "REDACTED";
const char* password = "REDACTED";
//const char* host = "esp8266fs";

ESP8266WebServer server(80);
SoftwareSerial softSerial(4, 5); //RX, TX
//holds the current upload
/*File fsUploadFile;
*/
//format bytes
String formatBytes(size_t bytes)
{
  if (bytes < 1024)
    return String(bytes)+"B";
  else if (bytes < (1024 * 1024))
    return String(bytes / 1024.0) + "KB";
  else if (bytes < (1024 * 1024 * 1024))
    return String(bytes / 1024.0 / 1024.0) + "MB";
  else
    return String(bytes / 1024.0 / 1024.0 / 1024.0) + "GB";
}

String getContentType(String filename)
{
  if(server.hasArg("download")) return "application/octet-stream";
  else if(filename.endsWith(".htm")) return "text/html";
  else if(filename.endsWith(".html")) return "text/html";
  else if(filename.endsWith(".css")) return "text/css";
  else if(filename.endsWith(".js")) return "application/javascript";
  else if(filename.endsWith(".png")) return "image/png";
  else if(filename.endsWith(".gif")) return "image/gif";
  else if(filename.endsWith(".jpg")) return "image/jpeg";
  else if(filename.endsWith(".ico")) return "image/x-icon";
  else if(filename.endsWith(".xml")) return "text/xml";
  else if(filename.endsWith(".pdf")) return "application/x-pdf";
  else if(filename.endsWith(".zip")) return "application/x-zip";
  else if(filename.endsWith(".gz")) return "application/x-gzip";
  
  return "text/plain";
}

bool handleFileRead(String path)
{
  Serial.println("handleFileRead: " + path);
  
  if(path.endsWith("/"))
    path += "index.html";
  
  String contentType = getContentType(path);
  String pathWithGz = path + ".gz";
  
  if(SPIFFS.exists(pathWithGz) || SPIFFS.exists(path))
  {
    if(SPIFFS.exists(pathWithGz))
      path += ".gz";
      
    File file = SPIFFS.open(path, "r");
    size_t sent = server.streamFile(file, contentType);
    file.close();
    
    return true;
  }
  
  return false;
}
/*
void handleFileUpload(){
  if(server.uri() != "/edit") return;
  HTTPUpload& upload = server.upload();
  if(upload.status == UPLOAD_FILE_START){
    String filename = upload.filename;
    if(!filename.startsWith("/")) filename = "/"+filename;
    Serial.print("handleFileUpload Name: "); Serial.println(filename);
    fsUploadFile = SPIFFS.open(filename, "w");
    filename = String();
  } else if(upload.status == UPLOAD_FILE_WRITE){
    //Serial.print("handleFileUpload Data: "); Serial.println(upload.currentSize);
    if(fsUploadFile)
      fsUploadFile.write(upload.buf, upload.currentSize);
  } else if(upload.status == UPLOAD_FILE_END){
    if(fsUploadFile)
      fsUploadFile.close();
    Serial.print("handleFileUpload Size: "); Serial.println(upload.totalSize);
  }
}

void handleFileDelete(){
  if(server.args() == 0) return server.send(500, "text/plain", "BAD ARGS");
  String path = server.arg(0);
  Serial.println("handleFileDelete: " + path);
  if(path == "/")
    return server.send(500, "text/plain", "BAD PATH");
  if(!SPIFFS.exists(path))
    return server.send(404, "text/plain", "FileNotFound");
  SPIFFS.remove(path);
  server.send(200, "text/plain", "");
  path = String();
}

void handleFileCreate(){
  if(server.args() == 0)
    return server.send(500, "text/plain", "BAD ARGS");
  String path = server.arg(0);
  Serial.println("handleFileCreate: " + path);
  if(path == "/")
    return server.send(500, "text/plain", "BAD PATH");
  if(SPIFFS.exists(path))
    return server.send(500, "text/plain", "FILE EXISTS");
  File file = SPIFFS.open(path, "w");
  if(file)
    file.close();
  else
    return server.send(500, "text/plain", "CREATE FAILED");
  server.send(200, "text/plain", "");
  path = String();
}

void handleFileList() {
  if(!server.hasArg("dir")) {server.send(500, "text/plain", "BAD ARGS"); return;}
  
  String path = server.arg("dir");
  Serial.println("handleFileList: " + path);
  Dir dir = SPIFFS.openDir(path);
  path = String();

  String output = "[";
  while(dir.next()){
    File entry = dir.openFile("r");
    if (output != "[") output += ',';
    bool isDir = false;
    output += "{\"type\":\"";
    output += (isDir)?"dir":"file";
    output += "\",\"name\":\"";
    output += String(entry.name()).substring(1);
    output += "\"}";
    entry.close();
  }
  
  output += "]";
  server.send(200, "text/json", output);
}*/

void handleGetTemperature()
{
  while (softSerial.available() > 0)
    softSerial.read();
    
  softSerial.print('T');

  String currentTime = softSerial.readStringUntil(';');
  String temperature = softSerial.readStringUntil(';');
  String calculatedTime = softSerial.readStringUntil(';');
  
  server.send(200, "text/plain", currentTime + ";" + temperature + ";" + calculatedTime);
}

void handleStart()
{
  if(!server.hasArg("data"))
  {
    server.send(500, "text/plain", "BAD ARGS");
    return;
  }

  String data = server.arg("data");

  softSerial.print('Q');
  softSerial.print(data);
  
  server.send(200, "text/plain", "OK");
}

void handleStop()
{
  softSerial.print('S');
  server.send(200, "text/plain", "OK");
}

void handleVersionInfo()
{
  while (softSerial.available() > 0)
    softSerial.read();
    
  softSerial.print('V');
  
  String maxPoints = softSerial.readStringUntil(';');
  String floatSupport = softSerial.readStringUntil(';');

  server.send(200, "text/plain", maxPoints + ";" + floatSupport);
}

void handleSendConfig()
{
  if(!server.hasArg("fs"))
  {
    server.send(500, "text/plain", "BAD ARGS");
    return;
  }

  softSerial.print('C' + server.arg("fs") + ';');
  server.send(200, "text/plain", "OK");
}

void setup(void)
{
  Serial.begin(115200);
  softSerial.begin(115200);

  SPIFFS.begin();

  //WIFI INIT
  //Serial.printf("Connecting to %s\n", ssid);
  
  if (String(WiFi.SSID()) != String(ssid))
    WiFi.begin(ssid, password);
 // WiFi.softAP(ssid, password);

  /*IPAddress myIP = WiFi.softAPIP();
  Serial.print("AP IP address: ");
  Serial.println(myIP);*/
  
 /* while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
  }*/
  
  Dir dir = SPIFFS.openDir("/");
  while (dir.next()) 
  {    
    String fileName = dir.fileName();
    size_t fileSize = dir.fileSize();
    Serial.printf("FS File: %s, size: %s\n", fileName.c_str(), formatBytes(fileSize).c_str());
  }

  //Serial.print("Connected! IP address: ");
 // Serial.println(WiFi.localIP());

 // MDNS.begin(host);
  //Serial.print("Open http://");
  //Serial.print(host);
  //Serial.println(".local/edit to see the file browser");
  
  
  //SERVER INIT
  //list directory
//  server.on("/list", HTTP_GET, handleFileList);
  //load editor
 // server.on("/edit", HTTP_GET, [](){
  //  if(!handleFileRead("/edit.htm")) server.send(404, "text/plain", "FileNotFound");
 // });
  //create file
//  server.on("/edit", HTTP_PUT, handleFileCreate);
  //delete file
 // server.on("/edit", HTTP_DELETE, handleFileDelete);
  //first callback is called after the request has ended with all parsed arguments
  //second callback handles file uploads at that location
  //server.on("/edit", HTTP_POST, [](){ server.send(200, "text/plain", ""); }, handleFileUpload);

  server.on("/versionInfo", HTTP_GET, handleVersionInfo);
  server.on("/sendConfig", HTTP_GET, handleSendConfig);
  server.on("/getTemp", HTTP_GET, handleGetTemperature);
  server.on("/start", HTTP_GET, handleStart);
  server.on("/stop", HTTP_GET, handleStop);
  server.on("/app", HTTP_GET, [](){
      if(!handleFileRead("/index.html")) 
        server.send(404, "text/plain", "FileNotFound");
    });

  //called when the url is not defined here
  //use it to load content from SPIFFS
  server.onNotFound([](){
    if(!handleFileRead(server.uri()))
      server.send(404, "text/plain", "Unknown operation.");
  });

// server.onNotFound([](){ server.send(404, "text/plain", "Unknown operation."); });

  //get heap status, analog input value and all GPIO statuses in one json call
/*  server.on("/all", HTTP_GET, [](){
    String json = "{";
    json += "\"heap\":"+String(ESP.getFreeHeap());
    json += ", \"analog\":"+String(analogRead(A0));
    json += ", \"gpio\":"+String((uint32_t)(((GPI | GPO) & 0xFFFF) | ((GP16I & 0x01) << 16)));
    json += "}";
    server.send(200, "text/json", json);
    json = String();
  });*/
  
  server.begin();
}

void loop(void)
{
  server.handleClient();
}
