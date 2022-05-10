// node scripts/create-new-alert.js '{ "resource":"BDD", "event":"Bdd is down" }'
// node scripts/create-new-alert.js '{ "resource":"API", "event":"Slowness detected" }'
// node scripts/create-new-alert.js '{ "resource":"WebAPI", "event":"Release in progress ...", "severity":"warning" }'
// node scripts/create-new-alert.js '{ "environment":"Development" }'
// node scripts/create-new-alert.js '{ "environment":"Development" }' 3

const fetch = require('node-fetch');
const fs = require('fs');
const crypto = require('crypto');

const secretFilePath = 'scripts/secrets.json';

if (!fs.existsSync(secretFilePath)) {
  fs.writeFileSync(
    secretFilePath,
    JSON.stringify({
      alertaUrl: 'http://localhost:8080/api',
      alertaToken: 'XX',
    }),
  );
}

const secretFile = fs.readFileSync(secretFilePath, 'utf-8');
const secrets = JSON.parse(secretFile);
const patch = process.argv.slice(2)?.length > 0 ? JSON.parse(process.argv.slice(2)[0]) : {};
const alertCount = process.argv.slice(3)?.length > 0 ? JSON.parse(process.argv.slice(3)[0]) : 1;

const body = {
  resource: 'webapi',
  event: 'HttpServerError',
  environment: 'Production',
  service: ['myservice.com'],
  severity: 'major',
  status: 'open',
  text: 'Outage in progress ...',
  group: 'test',
  ...patch,
};

Promise.all(
  [...Array(alertCount).keys()].map(i => {
    let newAlert = { ...body };
    if (alertCount > 1) {
      newAlert.event = `${newAlert.event}-${crypto.randomUUID()}`;
    }
    console.log('-------------------');
    console.log(`Create alert N°${i + 1}`);
    console.log(newAlert);

    return fetch(`${secrets.alertaUrl}/alert`, {
      method: 'post',
      body: JSON.stringify(newAlert),
      headers: { 'Content-Type': 'application/json', Authorization: `Key ${secrets.alertaToken}` },
    });
  }),
)
  .then(console.log)
  .catch(err => console.log('Something went wrong when calling Alerta API', err));
