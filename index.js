const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");

app.use(express.json());
app.use(cors());
app.use(express.static("dist"));

// LOGGING ---------------------------
morgan.token("content", function (req, res, method) {
  if (method === "POST") return JSON.stringify(req.body);
  return "";
});
const logger = morgan(function (tokens, req, res) {
  const method = tokens.method(req, res);

  const format = [
    method,
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, "content-length"),
    "-",
    tokens["response-time"](req, res),
    "ms",
    tokens.content(req, res, method),
  ];
  return format.join(" ");
});
app.use(logger);

// DATA --------------------------------
let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

// PAGES ----------------------------------
app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

app.get("/info", (request, response) => {
  const summary = `Phonebook has info for ${persons.length} people`;
  const date = new Date();
  response.send(`<p>${summary}</p><p>${date.toString()}</p>`);
});

// GET ------------------------------------
app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);

  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

// POST ------------------------------------
app.post("/api/persons", (request, response) => {
  const body = request.body;

  const name = body.name;
  if (!name) {
    return response.status(400).json({
      error: "name must be defined",
    });
  }

  const number = body.number;
  if (!number) {
    return response.status(400).json({
      error: "number must be defined",
    });
  }

  if (persons.map((p) => p.name).includes(name)) {
    return response.status(409).json({
      error: "name already exists in phonebook",
    });
  }

  const person = {
    id: Math.floor(Math.random() * 1000),
    name,
    number,
  };

  persons = persons.concat(person);

  response.json(person);
});

// DELETE ----------------------------------
app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((note) => note.id !== id);

  response.status(204).end();
});

// DEV -------------------------------------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
