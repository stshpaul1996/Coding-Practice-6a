const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const dbPath = (__dirname, "covid19India.db");
let db = null;

const initializeDataBaseAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
};
initializeDataBaseAndServer();

//API-1
app.get("/states/", async (request, response) => {
  const getStatesQuery = `
    SELECT state_id AS stateId,
    state_name AS stateName,
    population
    FROM state`;
  const getStates = await db.all(getStatesQuery);
  response.send(getStates);
});

//API-2
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateQuery = `
    SELECT state_id AS stateId,
    state_name AS stateName,
    population
    FROM state
     WHERE state_id = '${stateId}'`;
  const getState = await db.get(getStateQuery);
  response.send(getState);
});

//API-3
app.post("/districts/", async (request, response) => {
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const addDistrictQuery = `
  INSERT INTO district(district_name, state_id, cases, cured, active, deaths)
  VALUES('${districtName}', '${stateId}', '${cases}', '${cured}', 
  '${active}', '${deaths}')`;
  await db.run(addDistrictQuery);

  response.send("District Successfully Added");
});

//API-4
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictQuery = `
    SELECT district_id,
    district_name, 
    state_id, 
    cases,
    active,
    deaths
    FROM district 
    WHERE district_id = '${districtId}'`;
  const getDistrict = await db.get(getDistrictQuery);
  const convertSnakeToCamelCase = (each) => {
    return {
      districtId: each.district_id,
      districtName: each.district_name,
      stateId: each.state_id,
      cases: each.cases,
      active: each.active,
      deaths: each.deaths,
    };
  };
  response.send(convertSnakeToCamelCase(getDistrict));
});

//API-5
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrictQuery = `
    DELETE FROM district WHERE district_id = '${districtId}'`;
  await db.run(deleteDistrictQuery);
  response.send("District Removed");
});

//API-6
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const updateDistrictQuery = `
  UPDATE district
  SET district_name = '${districtName}',
  state_id = '${stateId}',
  cases = '${cases}',
  cured = '${cured}',
  active = '${active}',
  deaths = '${deaths}' WHERE district_id = '${districtId}'`;
  await db.run(updateDistrictQuery);
  response.send("District Details Updated");
});

//API-7
app.get("/states/:stateId/stats", async (request, response) => {
  const { stateId } = request.params;
  const statsStatesQuery = `
    SELECT SUM(cases) AS totalCases, SUM(cured) AS totalCured, 
    SUM(active) AS totalActive, SUM(deaths) AS totalDeaths
    FROM district WHERE state_id = '${stateId}'`;
  const getStatsState = await db.get(statsStatesQuery);
  response.send(getStatsState);
});

//API-8
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictStateQuery = `
    SELECT state_name AS stateName FROM district NATURAL JOIN state 
    WHERE district_id = '${districtId}'`;
  const getDistrictState = await db.get(getDistrictStateQuery);
  response.send(getDistrictState);
});

module.exports = app;
