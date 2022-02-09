const launchesDatabase = require('./launches.mongo')
const planets = require('./planets.mongo')


let DEFAULT_FLIGTH_NUMBER = 100

const launch = {
    flightNumber: 100,
    mission: 'Kepler Exploration X',
    rocket: 'Explorer IS1',
    launchDate: new Date('December 27, 2030'),
    target: 'Kepler-442 b',
    customer: ['ZTM', 'NASA'],
    upcoming: true,
    success: true,
}
saveLaunch(launch)
// the code below is the old code for getting our launch
//launches.set(launch.flightNumber, launch);

async function existsLaunchWithId(launchId){
    return await launchesDatabase.findOne({
      flightNumber: launchId,
    })
}

async function getLatestFlighNumber(){
  const latestLaunch = await launchesDatabase
  .findOne()
  .sort('-flightNumber');

  if(!latestLaunch){
    return DEFAULT_FLIGTH_NUMBER;
  }

  return latestLaunch.flightNumber;
}

async function getAllLaunches(){
    return await launchesDatabase.find({},{
        '_id': 0, '__v': 0,
      })
}
async function saveLaunch(launch){
  const planet = await planets.findOne({
    keplerName: launch.target,
  });

  if (!planet) {
    throw new Error('No matching planet found');
  }


    await launchesDatabase.findOneAndUpdate({
        flightNumber: launch.flightNumber,
    }, launch, {
        upsert: true,
    })
}

async function scheduleNewLaunch(launch) {

  const newFlightNumber = await getLatestFlighNumber() + 1;

  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customer: ['Zero to Mastery', 'NASA'],
    flightNumber: newFlightNumber,
  });

  await saveLaunch(newLaunch)
}

// function addNewLaunch(launch){
//     latestFlightNumber++;
//     launches.set(latestFlightNumber, Object.assign(launch, {
//         success: true,
//         upcoming: true,
//         customer: ['Zero to Mastery', 'NASA'],
//         flightNumber: latestFlightNumber,
//     }))
// }

async function abortLaunchById(launchId) {
  const aborted = await launchesDatabase.updateOne({
    flightNumber: launchId,
  }, {
    upcoming: false,
    success: false,
  });

  return aborted.modifiedCount === 1;
  //  const aborted = launches.get(launchId);
  //  aborted.upcoming = false;
  //  aborted.success = false 
  //  return aborted
}
module.exports = {
    existsLaunchWithId,
    getAllLaunches,
    scheduleNewLaunch,
    abortLaunchById
}