const db = require('../../db');
const bcrypt = require('bcrypt');

//Create User
exports.post = async (req, res, next) => {
   const { body } = req;
   const hash = await bcrypt.hashSync(body.password, 10)
   const userData = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      cpf: body.cpf,
      password: hash,
   }
   // const result = await bcrypt.compareSync(body.password, hash);
   // const resultFalse = await bcrypt.compareSync("fsdfsdf", hash);
   db("users").insert(userData).then((data) => {
      res.status(201).send({
         ...userData,
         id: data[0],
      });
   })
}

//Update User
exports.put = async (req, res, next) => {
   const { body } = req;
   const id = req.params.id;
   let userData = {
     ...body,
   }
   if (body.password) {
     const hash = await bcrypt.hashSync(body.password, 10)
     userData.password = hash;
   }
   await db('users').update(userData).where({ id: id });
   const updatedUser = await db('users').where({ id: id });
   return res.status(200).json(...updatedUser);
};

//Delete User
exports.delete = (req, res, next) => {
   const id = req.params.id;
   db('users').del().where({ idUsers : id}).then(() => {
   res.status(200).json({ message: "Deleted" });
   })
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
   const id = req.params.id;
   db.select().table('users').where({ idUsers : id})
   .then((data) => {
     if(data.length === 0) {
       return res.status(404).json({
         error: 'User does not exist'
       });
     }else {
       res.status(200).send(data);
     }
   })
};