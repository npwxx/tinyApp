//stores URL database in object for easier retrieval
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userId: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userId: "user2RandomID" }
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

//Funtion to check if there is already username Cookies
const getUser = function(req) {
  const userId = req.session.userId;
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

//function to filter urlDatabase by user
const urlsForUser = function(id) {
  let shortURLsArr = [];
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userId === id) {
      shortURLsArr.push(shortURL);
    }
  }
  return shortURLsArr;
};

module.exports = { urlDatabase, userDatabase, getUser, getUserByEmail, urlsForUser };