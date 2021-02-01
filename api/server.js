

'use strict';
const axios = require("axios")
require("dotenv").config()
const line = require('@line/bot-sdk');
const express = require('express');

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const youtubeUrl = 'https://www.googleapis.com/youtube/v3/search?'
// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();
app.get("/",(req,res)=>{
    res.send("youtubeのurlを返すLineBot")
})
// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/webhook', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// event handler
const handleEvent=async(event)=> {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  const { data: { items } } = await axios(youtubeUrl, {
    params: {
      maxResults: 2,
      type: "video",
      part: "snippet",
      q: event.message.text,
      key: process.env.YOUTUBE_KEY
    }})

  const urls = items.map(item => `https://www.youtube.com/embed/${item.id.videoId}`)

  // create a echoing text message
  
  // use reply API
  return client.replyMessage(event.replyToken, [{type:"text",text:urls[0]},{type:"text",text:urls[1]}]);
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(` Server running at ${port}`);
});