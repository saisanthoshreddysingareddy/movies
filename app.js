const express = require("express");
const app = express();
const { open } = require("sqlite");
const path = require("path");
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");
const sqlite3 = require("sqlite3");
let db = null;
const intializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Starting at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};
intializeDbAndServer();
const changingNames = (everyObject) => {
  return {
    movieId: everyObject.movie_id,
    directorId: everyObject.director_id,
    movieName: everyObject.movie_name,
    leadActor: everyObject.lead_actor,
  };
};
const changingDirectorNames = (everyDirector) => {
  return {
    directorId: everyDirector.director_id,
    directorName: everyDirector.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getQuery = `
    SELECT movie_name FROM movie`;
  const getResponse = await db.all(getQuery);
  response.send(getResponse.map((eachObject) => changingNames(eachObject)));
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postQuery = `
    INSERT INTO 
        movie(director_id,movie_name,lead_actor)
    VALUES
        (${directorId},'${movieName}','${leadActor}');`;
  const postResponse = await db.run(postQuery);
  response.send("Movie Successfully Added");
});
app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const getSingle = `
    SELECT *
    FROM movie
    WHERE movie_id=${movieId};`;
  const getResponse = await db.get(getSingle);
  response.send(getResponse.map((eachMovie) => changingNames(eachMovie)));
});
app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const putQuery = `
    UPDATE movie
    SET director_id=${directorId},movie_name='${movieName}',lead_actor='${leadActor}
    WHERE movie_id=${movieId};'`;
  const putResponse = await db.run(putQuery);
  response.send("Movie Details Updated");
});
app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
    DELETE FROM movie
    WHERE movie_id=${movieId}`;
  const deleteResponse = await db.run(deleteQuery);
  response.send("Movie Removed");
});
app.get("/directors/", async (request, response) => {
  const getDirectors = `
    SELECT *
    FROM director;`;
  const getDirectorResponse = await db.all(getDirectors);
  response.send(
    getDirectorResponse.map((eachDirector) =>
      changingDirectorNames(eachDirector)
    )
  );
});
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie
    WHERE
      director_id='${directorId}';`;
  const moviesArray = await db.all(getDirectorMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});
