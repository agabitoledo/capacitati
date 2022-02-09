const db = require('../../db');

//Create User
exports.post = (req, res, next) => {
   const body = req.body;
   db("users").insert(body).then((data => {
      console.log("body", body);
      console.log("data", data);
      return (
         res.status(200).send({
            ...body,
            id: data,
         })
      )
   }))
}

//Update User
exports.put = (req, res, next) => {
   let id = req.params.id;
   res.status(201).send(`Rota PUT com ID! --> ${id}`);
};

//Delete User
exports.delete = (req, res, next) => {
   let id = req.params.id;
   res.status(200).send(`Rota DELETE com ID! --> ${id}`);
};

//Get User list
exports.get = (req, res, next) => {
   db.select().table("users").then(data => {
      console.log(data)
      return (
         res.status(200).send(JSON.stringify(data))
      )
   })
};

//Get User by Id
exports.getById = (req, res, next) => {
   let id = req.params.id;
   res.status(200).send(`Rota GET com ID! ${id}`);
};