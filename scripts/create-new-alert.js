const fetch = require('node-fetch');
const fs = require('fs');

const secretFilePath = "scripts/secrets.json";

if (!fs.existsSync(secretFilePath)) {
    fs.writeFileSync(secretFilePath, JSON.stringify({
        alertaUrl: "http://localhost:9999/api",
        alertaToken: "XYZ"
    }));
}

var secretFile = fs.readFileSync(secretFilePath, "utf-8")
var secrets = JSON.parse(secretFile);

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