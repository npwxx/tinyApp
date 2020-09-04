const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { generateRandomString } = require('./util');
const { urlDatabase, userDatabase, getUser, getUserByEmail, urlsForUser } = require("./db");
const PORT = 8080;
const app = express();

app.use(cookieSession({ name: 'session', secret: generateRandomString() }));
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

//redirects to index page.
app.get("/", (req, res) => {
  const user = getUser(req);
  if (!user) {
    return res.redirect("/login");
  }
  res.redirect("/urls");
});

//Brings you to the page to create a new URL
app.get("/urls/new", (req, res) => {
  const user = getUser(req);
  if (!user) {
    return res.redirect("/login");
  }
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

//Brings you to the register page
app.get("/register", (req, res) => {
  const templateVars = { user: getUser(req) };
  const user = getUser(req);
  if (user) {
    return res.redirect("/urls");
  }
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
  const hashedPassword = bcrypt.hashSync(password, 10);
  userDatabase[id] = { id: id, email: req.body.email, hashedPassword };
  req.session.userId = id;
  res.redirect("/urls");
});

//renders the login page if not already logged in
app.get("/login", (req, res) => {
  const user = getUser(req);
  if (user) {
    return res.redirect("/urls");
  }
  const templateVars = { user };
  res.render("login", templateVars);
});

//login.
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.hashedPassword)) {
    return res.sendStatus(400);
  }
  req.session.userId = user.id;
  res.redirect("/urls");
});

//renders the index page
app.get("/urls", (req, res) => {
  const user = getUser(req);
  const userUrls = user ? urlsForUser(user.id) : [];
  const templateVars = { urls: urlDatabase, user, userUrls };
  res.render("urls_index", templateVars);
});

//renders a page where you can edit your URL
app.get("/urls/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  const user = getUser(req);
  if (!user || !urlsForUser(user.id).includes(shortURL)) {
    return res.sendStatus(404);
  }
  const templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL].longURL, user };
  res.render("urls_show", templateVars);
});

//creates a new URL & redirects back to main page
app.post("/urls", (req, res) => {
  const { longURL } = req.body;
  const userId = getUser(req).id;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL, userId };
  res.redirect(`/urls/${shortURL}`);
});

//redirects to long URL
app.get("/u/:shortURL", (req, res) => {
  const url = urlDatabase[req.params.shortURL];
  if (!url) {
    return res.sendStatus(404);
  }
  const longURL = url.longURL;
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
  const user = getUser(req);
  if (!user || !urlsForUser(user.id).includes(shortURL)) {
    return res.sendStatus(404);
  }
  urlDatabase[shortURL].longURL = longURL;
  res.redirect("/urls");
});

//deletes a url
app.post("/urls/:shortURL/delete", (req, res) => {
  const { shortURL } = req.params;
  const user = getUser(req);
  if (!user || !urlsForUser(user.id).includes(shortURL)) {
    return res.sendStatus(404);
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//logout deletes the cookie
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//opens a port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
