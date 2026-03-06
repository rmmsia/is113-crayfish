const express = require('express');

const server = express();
const port = 3000;
const path = require("path");

server.set("view engine", "ejs")

server.use("/", express.static(path.join(__dirname, "public")));

// remove and replace with DB retrieval once implemented
let posts = [
  {
    id: 1,
    title: "haha so funny",
    imageURL: "https://media.tenor.com/BuSEbkm9aAIAAAAi/hi-otag.gif",
    //redirectURL: "",  -- needed?
    author: "admin",
    upvotes: 4,
    downvotes: 0,
    // tags: ["funny, idk"],  -- if got time to implement tags
    comments: [
      {author: "admin2", body: "haha", datetime: "2026-03-04T09:00:00Z"}, // datetime using ISO 8601 format, with Z at the end indicating UTC timezone
      {author: "admin3", body: "not funny bro", datetime: "2026-03-04T12:00:00Z"} // datetime using ISO 8601 format, with Z at the end indicating UTC timezone
    ],
    datetime: "2026-03-04T05:00:00Z" // datetime using ISO 8601 format, with Z at the end indicating UTC timezone
  },
  {
    id: 2,
    title: "funny",
    imageURL: "https://media1.tenor.com/m/B-uBLzMr9BwAAAAd/low-cortisol.gif",
    //redirectURL: "",  -- needed?
    author: "admin3",
    upvotes: 2,
    downvotes: 3,
    // tags: ["funny, idk"],  -- if got time to implement tags
    comments: [
      {author: "admin2", body: "test", datetime: "2026-03-06T02:00:00Z"} // datetime using ISO 8601 format, with Z at the end indicating UTC timezone
    ],
    datetime: "2026-03-05T07:00:00Z" // datetime using ISO 8601 format, with Z at the end indicating UTC timezone
  }
];


// Route to home page sorted by top posts by default
server.get('/home', (req, res) => {
  // TBD: some function to sort posts before rendering them?

  res.render("home", { posts })
});

server.get('/', (req, res) => {
  res.send(`Hello world!`);
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});