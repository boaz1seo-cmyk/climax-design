const fs = require("fs");
const path = require("path");

module.exports = function () {
  const dir = path.join(__dirname, "../../assets/videos");
  let files = [];
  try {
    files = fs
      .readdirSync(dir)
      .filter((f) => /\.(mp4|webm|mov)$/i.test(f))
      .sort();
  } catch (e) {
    files = [];
  }
  return files.map((f) => ({
    filename: f,
    url: "/assets/videos/" + f,
    title: f.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
  }));
};
