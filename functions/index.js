const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });
const admin = require('firebase-admin');

admin.initializeApp();

const users_db = admin.database().ref('/users');
const games_db = admin.database().ref('/games');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.helloWorld = functions.https.onRequest((req, res) => {
    res.send("Hello from a Serverless Database!");
});

const getUsersFromDB = (res) => {
    let users = [];

    return users_db.on('value', (snapshot) => {
        snapshot.forEach((user) => {
            users.push({
                id: user.key,
                name: user.val().name,
                password: user.val().password,
                email: user.val().email
            });
        });
    
        res.status(200).json(users);
    }, (error) => {
        res.status(error.code).json({
            message: `Something went wrong. ${error.message}`
        });
    });
};

const getGamesFromDB = (res) => {
    let games = [];

    return games_db.on('value', (snapshot) => {
        snapshot.forEach((game) => {
            games.push({
                id: game.key,
                name: game.val().name,
                thumbnail: game.val().thumbnail
            });
        });

        res.status(200).json(games)
    }, (error) => {
        res.status(error.code).json({
            message: `Something went wrong. ${error.message}`
        })
    });
};

exports.getUsers = functions.https.onRequest((req, res) => {
    return cors(req, res, () => {
        if(req.method !== 'GET') {
            return res.status(404).json({
                message: 'Not allowed'
            })
        }

        getUsersFromDB(res);
    })
})

exports.addUser = functions.https.onRequest((req, res) => {
    return cors(req, res, () => {
        if (req.method !== 'POST') {
            return res.status(401).json({
                message: 'Not allowed'
            })
        }
        
        const user = req.body;

        users_db.push({ 
            name: req.body.name,
            password: req.body.password
        });

        let users = [];

        getUsersFromDB(res);
    })
})

exports.addGame = functions.https.onRequest((req, res) => {
    return cors(req, res, () => {
        if (req.method !== 'POST') {
            return res.status(401).json({
                message: 'Not allowed'
            })
        }
        
        const game = req.body;

        games_db.push({ 
            name: req.body.name
        });

        getGamesFromDB(res);
    })
})

exports.getGames = functions.https.onRequest((req, res) => {
    return cors(req, res, () => {
        if(req.method !== 'GET') {
            return res.status(404).json({
                message: 'Not allowed'
            })
        }

        getGamesFromDB(res);
    })
})

exports.getGameDetails = functions.https.onRequest((req, res) => {
    return cors(req, res, () => {
        if(req.method !== 'GET') {
            return res.status(404).json({
                message: 'Not allowed'
            })
        }
        
        const originalUrl = req.originalUrl.split('/');
        const id = originalUrl[1];
        const game_details_db = admin.database().ref(`/games/${id}`);
        
        let games = [];

        return game_details_db.on('value', (snapshot) => {
            games.push({
                id: snapshot.key,
                name: snapshot.val().name,
                thumbnail: snapshot.val().thumbnail,
                description: snapshot.val().description,
                background: snapshot.val().background,
                publisher: snapshot.val().publisher,
                genre: snapshot.val().genre,
                review: snapshot.val().review
            });

            res.status(200).json(games)
        }, (error) => {
            res.status(error.code).json({
                message: `Something went wrong. ${error.message}`
            })
        });
    });
})