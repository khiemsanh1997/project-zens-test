print("Started Adding the Users.");
db = db.getSiblingDB("joke");
db.createUser({
  user: "joke",
  pwd: "joke",
  roles: [{ role: "readWrite", db: "joke" }],
});
print("End Adding the User Roles.");
