
// node scripts/create-new-alert.js '{ "resource":"BDD", "event":"Bdd is down" }'
// node scripts/create-new-alert.js '{ "resource":"API", "event":"Slowness detected" }'
// node scripts/create-new-alert.js '{ "resource":"WebAPI", "event":"Release in progress ...", "severity":"warning" }'


const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const secretFilePath = "scripts/secrets.json";

if (!fs.existsSync(secretFilePath)) {
    fs.writeFileSync(secretFilePath, JSON.stringify({
        alertaUrl: "http://localhost:9999/api",
        alertaToken: "XYZ"
    }));
}

var secretFile = fs.readFileSync(secretFilePath, "utf-8")
var secrets = JSON.parse(secretFile);
const patch = process.argv.slice(2)?.length > 0 ? JSON.parse(process.argv.slice(2)[0]) : {};

const body = {
    resource: "webapi",
    event: "HttpServerError",
    environment: "Production",
    service: ["myservice.com"],
    severity: "major",
    status: "open",
    text: "Outage in progress ...",
    group:"test",
    ...patch
};

console.log(body)

fetch(`${secrets.alertaUrl}/alert`, {
    method: 'post',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json', "Authorization": secrets.alertaToken },
})
    .then(res => res.json())
    .then(json => console.log(json));