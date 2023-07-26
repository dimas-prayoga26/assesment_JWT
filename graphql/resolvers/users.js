const User = require('../../models/User');
const { ApolloError } = require('apollo-server-errors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

module.exports = {
    Mutation: {
        async registerUser(_, {registerInput: {username, email, password} }) {
            // email attempt
            const oldUser = await User.findOne({ email });
            // pengkodisian credentials
            if (oldUser) {
                throw new ApolloError('A user has already been registered with the email' + email, 'USER_ALREADY_EXISTS');
            }
            // encypt password
            var encryptedPassword = await bcrypt.hash(password, 10);
            // mongose model
            const newUser = new User({
                username: username,
                email: email.toLowerCase(),
                password: encryptedPassword
            });        
            // Token JWT Validasi berdasarkan model user
            const token = jwt.sign(
                { user_id: newUser._id, email },
                "UNSAFE_STRING",
                {
                    expiresIn: "2h"
                }
            );

            newUser.token = token;
            // save data ke database mongodb
            const res = await newUser.save();

            return {
                id: res.id,
                ...res._doc
            };
        },
        async loginUser(_, {loginInput: {email, password} }) {
            // lihat apakah ada pengguna dengan email tersebut
            const user = await User.findOne({ email });
            // periksa apakah kata sandi yang dimasukkan sama dengan kata sandi terenkripsi
            if (user && (await bcrypt.compare(password, user.password))) {
                // membuat token baru
                const token = jwt.sign(
                    { user_id: user._id, email },
                    "UNSAFE_STRING",
                    {
                        expiresIn: "2h"
                    }
                );

                user.token = token;

                return {
                    id: user.id,
                    ...user._doc
                }
            } else {
                
                // jika pengguna tidak ada, kembalikan kesalahan
                throw new ApolloError('Incorrect password', 'INCORRECT_PASSWORD');
            }

            // lampirkan token ke model pengguna yang kami temukan di atas

        }
    },
    Query: {
        user: (_, {ID}) => User.findById(ID)
    }
}