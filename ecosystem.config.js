module.exports = {
  apps : [{
    name   : "care_why_api",
    script : "./src/server.js",
    watch: true,
    ignore_watch: ["uploads"],
  }],
}
