const fetch = require("./fetch");
const fs = require("fs");
const path = require("path");

function loadDescription(filename) {
  return fs.readFileSync(path.join(__dirname, "../config", filename), "utf8");
}

function createCollection(name) {
  var template = require("../config/api-collection.json");
  template.collection.info.name = name;
  template.collection.info.description = loadDescription("api-collection.md");
  return fetch({
    url: "/collections",
    method: "POST",
    data: template,
  })
    .then((response) => {
      let uid = response.data.collection.uid;
      console.log("✅ API collection created, uid: " + uid);
      return uid;
    })
    .catch((err) => {
      console.error("❌ Failed to create API collection:", err);
      process.exit(-1);
    });
}

function updateCollection(uid, data, name) {
  return fetch({
    url: "/collections/" + uid,
    method: "PUT",
    data,
  })
    .then(() => {
      console.log("✅ " + name + " updated");
    })
    .catch((err) => {
      console.error("❌ Failed to update " + name + ":", err);
    });
}

function getCollectionId(name) {
  return fetch({
    url: "/collections",
    method: "get",
  })
    .then((response) => {
      let collection = response.data.collections.find(
        (ele) => ele.name === name,
      );
      if (collection == null) {
        console.log("📦 API collection not found, creating: " + name);
        return createCollection(name);
      }
      console.log("📋 API collection found, uid: " + collection.uid);
      return collection.uid;
    })
    .catch((err) => {
      console.error("❌ Failed to get API collection:", err);
      process.exit(-1);
    });
}

function getCollectionDetail(uid) {
  return fetch({
    url: "/collections/" + uid,
    method: "get",
  })
    .then((response) => {
      return response.data;
    })
    .catch((err) => {
      console.error("❌ Failed to get collection detail:", err);
      process.exit(-1);
    });
}

function loadAuthTemplate(name) {
  var template = require("../config/auth-collection.json");
  template.collection.info.name = name;
  template.collection.info.description = loadDescription("auth-collection.md");
  return template;
}

function createAuthCollection(name) {
  return fetch({
    url: "/collections",
    method: "get",
  })
    .then((response) => {
      let collection = response.data.collections.find(
        (ele) => ele.name === name,
      );
      if (collection != null) {
        console.log("📋 Auth collection found, uid: " + collection.uid);
        return getCollectionDetail(collection.uid).then((saved) => {
          var template = loadAuthTemplate(name);
          template.collection.info._postman_id = collection.uid;
          var savedVars = saved.collection.variable || [];
          var savedKeys = new Set(savedVars.map((v) => v.key));
          (template.collection.variable || []).forEach((v) => {
            if (!savedKeys.has(v.key)) {
              savedVars.push(v);
            }
          });
          template.collection.variable = savedVars;
          return updateCollection(
            collection.uid,
            template,
            "Auth collection",
          ).then(() => collection.uid);
        });
      }
      console.log("📦 Auth collection not found, creating: " + name);
      var template = loadAuthTemplate(name);
      return fetch({
        url: "/collections",
        method: "POST",
        data: template,
      }).then((response) => {
        let uid = response.data.collection.uid;
        console.log("✅ Auth collection created, uid: " + uid);
        return uid;
      });
    })
    .catch((err) => {
      console.error("❌ Failed to create auth collection:", err);
      process.exit(-1);
    });
}

function loadApiTemplate(name) {
  var template = require("../config/api-collection.json");
  template.collection.info.name = name;
  template.collection.info.description = loadDescription("api-collection.md");
  return template;
}

module.exports = {
  updateCollection,
  getCollectionId,
  getCollectionDetail,
  createAuthCollection,
  loadApiTemplate,
};
