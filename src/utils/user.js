const { session } = require("electron");
const config = require("./../config.json");
const fetch = require("electron-fetch").default;

async function loadUser() {
  let res = await fetch(`${config.gatewayURL}/api/v1/user`, {
    session: session.defaultSession,
    useSessionCookies: true,
    method: "GET",
  })

  let user = await res.json();
  console.log(user);
  return user;
}

exports.loadUser = () => loadUser();