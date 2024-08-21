import { WebSocketV2 } from "smartapi-javascript";
import details from "./details.js";
import { config } from "dotenv";
import fs from 'fs';

config();

function scheduleExecutuion() {
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
    let json_req = {
      correlationID: "797",
      action: 1,
      mode: 2,
      exchangeType: 1,
      tokens: ["3045", "26000"],
    };

    web_socket.fetchData(json_req);

    setTimeout(function () {
      web_socket.close()
    }, millisecondsTillGivenTime("15:30"));

    web_socket.on("tick", receiveTick);
  });
}

function receiveTick(data) {
  let last_traded_price = data.last_traded_price / 100;
  let last_traded_quantity = data.last_traded_quantity;
  let volume_traded = data.vol_traded;
  let open = data.open_price_day / 100;
  let high = data.high_price_day / 100;
  let low = data.low_price_day / 100;
  let close = data.close_price / 100;
  let time = new Date(Number(data.exchange_timestamp))
  time = isNaN(time.getTime()) ? "" : formatDate(time);

  if (data.token === '"26000"') {
    let line = `${last_traded_price},${time},${last_traded_quantity},${volume_traded},${open},${close},${high},${low}\n`;
    fs.appendFile('NIFTY.txt', line, (err) => {
      if (err) throw err;
    });
  } else if (!isNaN(last_traded_price) && time !== "") {
    let line = `${last_traded_price},${time},${last_traded_quantity},${volume_traded},${open},${close},${high},${low}\n`;
    fs.appendFile('SBIN.txt', line, (err) => {
      if (err) throw err;
    });
  }
}

function formatDate(date) {
  let year = date.getFullYear();
  let month = ('0' + (date.getMonth() + 1)).slice(-2); // Months are zero-based
  let day = ('0' + date.getDate()).slice(-2);
  let hours = ('0' + date.getHours()).slice(-2);
  let minutes = ('0' + date.getMinutes()).slice(-2);
  let seconds = ('0' + date.getSeconds()).slice(-2);

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