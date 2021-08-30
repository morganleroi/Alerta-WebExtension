const fetch = require('node-fetch');
const fs = require('fs');

var secrets = JSON.parse(fs.readFileSync("scripts/secrets.json", "utf-8"));

console.log("lets create a new alert", secrets);

const body = {
    resource: "webapi",
    event: "HttpServerError",
    environment: "Production",
    service: ["myservice.com"],
    severity: "major",
    status: "open",
    text: "Oups, something seems down ..."
};

fetch(`${secrets.alertaUrl}/alert`, {
    method: 'post',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json', "Authorization": secrets.alertaToken },
})
    .then(res => res.json())
    .then(json => console.log(json));