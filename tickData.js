import { WebSocketV2 } from "smartapi-javascript";
import details from "./details.js";
import { config } from "dotenv";
import fs from 'fs';

config();

export function scheduleExecution() {
  let executionTime = millisecondsTillGivenTime("09:15");
  setTimeout(fetchData, executionTime);
}

function fetchData() {
  let web_socket = new WebSocketV2({
    jwttoken: process.env.JWT_TOKEN,
    apikey: details.apiKey,
    clientcode: details.customer_id,
    feedtype: process.env.FEED_TOKEN,
  });

  web_socket.connect().then((res) => {
    console.log('WebSocket connected:', res);

    let json_req = {
      correlationID: "797",
      action: 1,
      mode: 2,
      exchangeType: 1,
      tokens: ["3045", "26000"],
    };

    web_socket.fetchData(json_req);

    // Schedule WebSocket closure
    const closeTime = millisecondsTillGivenTime("15:30");
    setTimeout(() => {
      web_socket.close();
    }, closeTime);

    // Handle incoming data
    web_socket.on("tick", receiveTick);
    
    // Handle errors
    web_socket.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    // Handle WebSocket closure
    web_socket.on("close", () => {
      console.log("WebSocket closed");
    });

  }).catch((error) => {
    console.error("WebSocket connection error:", error);
  });
}

function receiveTick(data) {
  const last_traded_price = data.last_traded_price / 100;
  const last_traded_quantity = data.last_traded_quantity;
  const volume_traded = data.vol_traded;
  const open = data.open_price_day / 100;
  const high = data.high_price_day / 100;
  const low = data.low_price_day / 100;
  const close = data.close_price / 100;
  let time = new Date(Number(data.exchange_timestamp));
  time = isNaN(time.getTime()) ? "" : formatDate(time);

  let line = `${last_traded_price},${time},${last_traded_quantity},${volume_traded},${open},${close},${high},${low}\n`;
  
  if (data.token === '"26000"') {
    fs.appendFile('NIFTY.txt', line, (err) => {
      if (err) throw err;
    });
  } else if (!isNaN(last_traded_price) && time !== "") {
    fs.appendFile('SBIN.txt', line, (err) => {
      if (err) throw err;
    });
  }
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2); // Months are zero-based
  const day = ('0' + date.getDate()).slice(-2);
  const hours = ('0' + date.getHours()).slice(-2);
  const minutes = ('0' + date.getMinutes()).slice(-2);
  const seconds = ('0' + date.getSeconds()).slice(-2);

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function millisecondsTillGivenTime(timeStr) {
  const now = new Date();

  let [hours, minutes] = timeStr.split(':').map(Number);

  const targetTime = new Date(now);
  targetTime.setHours(hours, minutes, 0, 0);

  const millisecondsDifference = targetTime - now;

  return millisecondsDifference > 0 ? millisecondsDifference : 0;
}