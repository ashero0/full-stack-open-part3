const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");
require("dotenv").config();

const Person = require("./models/person");

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

// PAGES ----------------------------------
app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

app.get("/info", (request, response) => {
  Person.find({}).then((persons) => {
    const summary = `Phonebook has info for ${persons.length} people`;
    const date = new Date();
    response.send(`<p>${summary}</p><p>${date.toString()}</p>`);
  });
});

// GET ------------------------------------
app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
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

  // if (persons.map((p) => p.name).includes(name)) {
  //   return response.status(409).json({
  //     error: "name already exists in phonebook",
  //   });
  // }

  const person = new Person({
    name,
    number,
  });

  person.save().then((savedPerson) => {
    response.json(savedPerson);
  });
});

// UPDATE ----------------------------------
app.put("/api/persons/:id", (request, response, next) => {
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

  const person = { name, number };

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

// DELETE ----------------------------------
app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

// ERROR HANDLING --------------------------
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);
app.use(errorHandler);

// DEV -------------------------------------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
