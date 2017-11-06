"use strict";

const request = require("request");
const parseString = require("xml2js").parseString;
const stripPrefix = require("xml2js").processors.stripPrefix;
const fs = require("fs");
const path = require("path");
////twit
const twit = require("twit");
const config = require("./config.js");

var registered = [];
var lastTitle = "";
var twitErab = "";

/////////////////twitter konfigurazioa
const Twitter = new twit(config);

//////// ea azkena.txt badagoen

const AZKENA_FILE = process.env.DB_PATH
  ? path.join(process.env.DB_PATH, "azkena.txt")
  : "azkena.txt";

///////irakurri piztean azken titulua
var lastTitle = fs.readFileSync(AZKENA_FILE).toString();

/////////////

setInterval(() => {
  console.log("setInterval begiratu berririk baden:");
    request("http://etzi.pm/feed/", (err, res, body) => {
      parseString(body, { tagNameProcessors: [stripPrefix] }, (err, result) => {
            console.log("setIntervalItem: "+result.rss.channel[0].item[0]);
        let newest = result.rss.channel[0].item[0];
        if (lastTitle === newest.title[0]) {
          console.log("Ez dago albiste berririk: " + lastTitle);
          return;
        }
        //
        fs.unlinkSync(AZKENA_FILE);
          console.log('azkena gorde'+newest.title[0]);
        fs.appendFileSync(AZKENA_FILE, newest.title[0]);
        //

        lastTitle = newest.title[0];
        twitErab = newest.creator;

        // twit
        Twitter.post(
          "statuses/update",
          {
            status: twitErab + " - " + lastTitle + ": " + newest.link + " #etziBot"
          },
          function(err, data, response) {
            if (err) {
              console.log("Error in tweeting azken posta");
            } else {
              console.log("Azken posta shown successfully");
            }
          }
        );
      });
    });
}, 1000 * 60 * 10);
