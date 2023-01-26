const TelegramBot = require("node-telegram-bot-api");
const request = require("request");
require("dotenv").config();
const token = process.env.TOKEN;
const Weather_token = process.env.WEATHER_API_TOKEN;
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Welcome " + msg.from.first_name);
  bot.sendMessage(msg.chat.id, "\nNeed /help ?");
});
bot.onText(/\/help/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "These are the commands :\n\n/Location-Gives Location using Pincode\n/Geolocation-Gives Geolocation using CityName"
  );
});
bot.onText(/\/Location/, (msg) => {
  bot.sendMessage(msg.chat.id, "Please Enter Pin Code :");
});
bot.onText(/\/Geolocation/, (msg) => {
  bot.sendMessage(msg.chat.id, "Please Enter City Name :");
});
bot.on("message", (msg) => {
  var bye = "bye";
  if (
    msg.text !== "/start" &&
    msg.text !== "/help" &&
    msg.text !== "/Location" &&
    msg.text !== "/Geolocation" &&
    msg.text != bye
  ) {
    if (!isNaN(msg.text)) {
      request(
        `http://www.postalpincode.in/api/pincode/${msg.text}`,
        function (error, response, body) {
          const data = JSON.parse(body);
          if (data.Message !== "No records found") {
            let taluk = data.PostOffice[0].Division;
            let state = data.PostOffice[0].State;
            let country = data.PostOffice[0].Country;
            bot.sendMessage(msg.chat.id, taluk);
            bot.sendMessage(msg.chat.id, state);
            bot.sendMessage(msg.chat.id, country);
          } else if (data.Message === "No records found") {
            bot.sendMessage(msg.chat.id, "Invalid Pin-Code");
            bot.sendMessage(msg.chat.id, "Please Enter valid Pin Code");
          }
        }
      );
    }
    if (isNaN(msg.text)) {
      request(
        `https://api.openweathermap.org/data/2.5/weather?q=${msg.text}&appid=${Weather_token}`,
        function (err, res, bo) {
          const val = JSON.parse(bo);
          console.log(val);
          if (val.message !== "city not found") {
            bot.sendMessage(msg.chat.id, `Geolocation Of the ${msg.text} :`);
            bot.sendLocation(msg.chat.id, val.coord.lat, val.coord.lon);
          } else if (val.message === "city not found") {
            bot.sendMessage(msg.chat.id, "Please Enter Valid City Name");
          }
        }
      );
    }
  }
  if (msg.text.toString().toLowerCase().includes(bye)) {
    bot.sendMessage(
      msg.chat.id,
      "Hope to see you around again " + msg.from.first_name + ", Bye"
    );
  }
});
