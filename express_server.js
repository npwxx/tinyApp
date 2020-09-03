const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

//stores URL database in object for easier retrieval
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//stores user login &password info
const userDatabase = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

//redirects to index(/home?) page.
app.get("/", (req, res) => {
  res.redirect("/urls");
});

//Brings you to the page to create a new URL
app.get("/urls/new", (req, res) => {
  let templateVars = { user: getUser(req) };
  res.render("urls_new", templateVars);
  //console.log(getUsername(req));
});

//Brings you to the register page
app.get("/register", (req, res) => {
  let templateVars = { user: getUser(req) };
  res.render("register", templateVars);
});

//saves new user registration to userDatabase
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const { email, password } = req.body;
  if (email === "" || password === "") {
    return res.sendStatus(400);
  }
  if (getUserByEmail(email)) {
    return res.sendStatus(400);
  }
  userDatabase[id] = { id: id, email: req.body.email, password: req.body.password };
  //console.log(userDatabase);
  res.cookie("userId", id);
  res.redirect("/urls");
});

//
app.get("/login", (req, res) => {
  let templateVars = { user: getUser(req), };
  res.render("login", templateVars);
});

//login.
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  //console.log(username);
  const user = getUserByEmail(email);
  if (!user || password !== user.password) {
    return res.sendStatus(400);
  }
  res.cookie("userId", user.id);
  res.redirect("/urls");
});

//renders the index page
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user: getUser(req) };
  res.render("urls_index", templateVars);
});

//renders a page where you can edit the URL
app.get("/urls/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  let templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL], user: getUser(req) };
  res.render("urls_show", templateVars);
});

//creates a new URL & redirects back to main page
app.post("/urls", (req, res) => {
  const { longURL } = req.body;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

//redirects to long URL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//shows the database
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//edits a url
app.post("/urls/:shortURL", (req, res) => {
  const { longURL } = req.body;
  const { shortURL } = req.params;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

//deletes a url
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


//logout deletes the username cookie
app.post("/logout", (req, res) => {
  res.clearCookie("userId");
  res.redirect("/urls");
});

//opens a port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

/*** Helper Functions ***/

//Funtion used to create a random short URL string
const generateRandomString = function() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters[Math.floor(Math.random() * charactersLength)];
  }
  return result;
};

//Funtion to check if there is already username Cookies
const getUser = function(req) {
  const userId = req.cookies ? req.cookies['userId'] : undefined;
  return userDatabase[userId];
};

//function to check is email is already used
const getUserByEmail = function(email) {
  for (const userId in userDatabase) {
    if (email === userDatabase[userId].email) {
      return userDatabase[userId];
    }
  }
  return undefined;
};