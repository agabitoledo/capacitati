const db = require('../../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const transporter = require('../../config/transporter');

//Login
exports.login = async (req, res, next) => {
   const { email, password } = req.body;
   if (!email || !password) return res.status(400).send({ msg: 'Campos inválidos' })
   const user = await db('users').select('password').where('email', email).first();
   //TODO:Transformar a validação de senha e usuário com uma só mensagem para que haja mais segurança e o usuário não saiba quais dos dois foi o incorreto
   if (!user) return res.status(404).res.send({ error: 'user not found' });
   if (!await bcrypt.compareSync(password, user.password)) {
      return res.status(404).res.send({ msg: 'Invalid password' })
   }
   const loggedUser = await db('users').select('*').where('email', email).first();
   delete loggedUser.password //para que não fique salvo
   //TODO: Criar .env
   const token = jwt.sign(
      { user: loggedUser.id },
      "segredo", {
      expiresIn: 500
   }
   );
   return res.status(200).send({ user: { ...loggedUser }, token });
}

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
   db('users').del().where({ idUsers: id }).then(() => {
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
   db.select().table('users').where({ idUsers: id })
      .then((data) => {
         if (data.length === 0) {
            return res.status(404).json({
               error: 'User does not exist'
            });
         } else {
            res.status(200).send(data);
         }
      })
};

const usePasswordHashToMakeToken = ({ password: passwordHash, id }) => {
   const secret = `${passwordHash}-${id}`;
   const token = jwt.sign(
       { id },
       secret,
       { expiresIn: 3600 } // 1 hour
   );

   return token;
};

// Enviando o email com o reset de senha
exports.sendPasswordResetEmail = async (req, res) => {
   const { email } = req.params;
   let user;
   try {
      user = await db('users')
         .select('*')
         .where('email', email)
         .first();
   } catch (error) {
      res.status(404).json('No user with that email');
   }
   //
   const token = usePasswordHashToMakeToken(user);
   const mailOptions = {
      to: email,
      subject: 'Recuperação de senha',
      text: `Seu link de recuperação de senha https://www.url.com/reset/${user.id}/${token}`,
   }
   const sendEmail = () => {
      transporter.sendMail(mailOptions, (err, data) => {
         if (err) {
            console.log(`Error ${err}`);
            res.status(400).json('failed');
         } else {
            console.log('Email sent successfully', data.response);
            res.status(200).json('sent')
         }
      })
   }

   sendEmail();
}

exports.receiveNewPassword = async (req, res) => {
   const { id, token } = req.params;
   const { password } = req.body;

   const user = await db('users')
      .select()
      .where('idUsers', id)
      .first();

   const secret = `${user.password}-${id}`;
   const payload = jwt.decode(token, secret);
   if (payload.id === user.id) {
      const hash = await bcrypt.hashSync(password, 10);
      db('users').update({ password: hash }).where({ 'idUsers': id }).then(() => res.status(202).json('Password changed accepted'))
   } else {
      res.status(404).json('Invalid user')
   }
}