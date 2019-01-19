// Initialize Firebase
var config = {
    apiKey: "AIzaSyC5C0SfrL_4xvBtgveKhsVkC-Ed9iPSBTg",
    authDomain: "testprj-75652.firebaseapp.com",
    databaseURL: "https://testprj-75652.firebaseio.com",
    projectId: "testprj-75652",
    storageBucket: "testprj-75652.appspot.com",
    messagingSenderId: "10060697007"
};
firebase.initializeApp(config);

// Get a reference to the database service
var database = firebase.database();


// initial values
var currRound = -1;
var totalRounds = 3;
var sessionID = Math.random().toString(36).substr(2, 6);
var gameInstance = {
    "userid": 1,
    "session": {
        "sessionID": sessionID,
        "currRound": -1,
        "palyer1Name": "",
        "palyer2Name": "",
        "player1Wins": 0,
        "player2Wins": 0,
        "ties": 0,
        "round1": {
            "player1Pick": "",
            "player2Pick": "",
        },
        "round2": {
            "player1Pick": "",
            "player2Pick": "",
        },
        "round3": {
            "player1Pick": "",
            "player2Pick": "",
        }
    },

    // decide who wins the current round
    fight: function (p1, p2) {
        var round = "round" + gameInstance["session"]["currRound"];
        var p1 = this["session"][round]["player1Pick"];
        var p2 = this["session"][round]["player2Pick"];
        var winner = 0;
        if (this.session["currRound"] > 3) {
            console.log("game over");
            return winner;
        }
        if (p1 === "" || p2 === "") {
            console.log("wait for another user's pick");
            return -1;
        } else if (p1 === p2) {
            this.session["ties"] += 1;
        } else {
            this.session["round" + this.session["currRound"]]["player1Pick"] = p1;
            this.session["round" + this.session["currRound"]]["player2Pick"] = p2;
            switch (p1 + p2) {
                case "scissiorpaper":
                case "rockscissior":
                case "paperrock":
                    this.session["round" + this.session["currRound"]]["player1Wins"] += 1;
                    winner = 1;
                    console.log(p1 + " vs " + p2 + " -- player1 wins");
                    break;
                case "paperscissior":
                case "scissiorrock":
                case "paperrock":
                    this.session["round" + this.session["currRound"]]["player1Wins"] += 1;
                    winner = 2;
                    console.log(p1 + " vs " + p2 + " -- player2 wins");
                    break;
            }
            this.session["currRound"] += 1;
        }
        return winner;
    },

    startGame: function () {
        // check if there is any player waiting
        // if none, create new session and be the first player
        // else, retrieve session id and be the second player
        var self = this;
        console.log(self);
        console.log("hehe")
        database.ref("rps/openSessionID").once('value', function (snapshot) {
            var openSessionID = snapshot.val();
            console.log("opensession=" + openSessionID);
            if (openSessionID == null || openSessionID == "" ) { // create new session
                console.log(self);
                database.ref("rps/openSessionID").set(self["session"]["sessionID"]);
                self["session"]["currRound"] = 1;
                // create a session
                database.ref("rps/sessions/" + self["session"]["sessionID"]).update(self["session"]);
                console.log("initialize remote");
                console.log("ready player 1, with session:");
                console.log(self["session"])
                return self["session"]["sessionID"];
            } else { // join existing session
                // gameInstance["session"]["sessionID"] = openSessionID;
                self["userid"] = 2;
                // retrieve a session
                database.ref("rps/sessions/" + openSessionID).once('value', function (snap2) {
                    self["session"] = snap2.val();
                    console.log("retrieve game session from remote");
                });
                database.ref("rps/openSessionID").set("");
                console.log("ready player 2, with session:");
                console.log(self["session"])
                return self["session"]["sessionID"];
            }
        });
    },

    endGame: function () {
        database.ref("rps/sessions/" + this["session"]["sessionID"]).remove();
    },
}
console.log("sessionID=" + gameInstance["session"]["sessionID"]);


// // check if there is any player waiting
// // if none, create new session and be the first player
// // else, retrieve session id and be the second player
// database.ref("rps/openSessionID").once('value', function (snapshot) {
//     var openSessionID = snapshot.val();
//     console.log("opensession=" + openSessionID);
//     if (openSessionID == null || openSessionID === "") {
//         database.ref("rps/openSessionID").set(gameInstance["session"]["sessionID"]);
//         gameInstance["session"]["currRound"] = 1;
//         // create a session
//         database.ref("rps/sessions/" + gameInstance["session"]["sessionID"]).update(gameInstance["session"]);
//         console.log("initialize remote");
//         console.log("ready player 1");
//     } else {
//         // gameInstance["session"]["sessionID"] = openSessionID;
//         gameInstance["userid"] = 2;
//         // retrieve a session
//         database.ref("rps/sessions/" + gameInstance["session"]["sessionID"]).once('value', function (snap2) {
//             gameInstance["session"] = snap2.val();
//             console.log("retrieve game session from remote");
//         });
//         database.ref("rps/openSessionID").set("");
//         console.log("ready player 2");
//     }
// });
var sid = gameInstance.startGame();
console.log("game started with sid=" + sid);

// // first retrieval of data
// database.ref("rps/sessions/" + gameInstance["session"]["sessionID"]).once('value', function (snapshot) {
//     if (snapshot.child("currRound").val() >= 1) {
//         gameInstance["session"] = snapshot.val();
//         console.log("retrieve game instance from remote");
//     } else {
//         gameInstance["session"]["currRound"] = 1;
//         database.ref("rps/sessions/" + gameInstance["session"]["sessionID"]).update(gameInstance["session"]);
//         console.log("initialize remote");
//     }
// });


// real time update
// database.ref("rps/sessions" + gameInstance["session"]["sessionID"]).on("value",
//     function (snapshot) {
//         console.log("snapshot child currround=" + snapshot.child("currRound").val());
//         if (snapshot.child("currRound").val() >= 1) {
//             $("#player1Pick").text(snapshot.child("round1/player1Pick").val());
//             $("#player2Pick").text(snapshot.child("round1/player2Pick").val());
//         } else {
//             console.log("no player picked. snapshot=" + snapshot.val());
//         }
//     }, function (errorObject) {
//         console.log("The read failed: " + errorObject)
//     });

console.log("instance=");
console.log(gameInstance);

// button cliced
$(".btn-pick").on("click", function () {
    console.log("clicked instance=");
    console.log(gameInstance);
    var round = "round" + gameInstance["session"]["currRound"];
    var playerpick = "player" + gameInstance["userid"] + "Pick";
    if (gameInstance["session"][round][playerpick] == "") {
        console.log("you just picked: " + $(this).data("pick"));
        gameInstance["session"][round][playerpick] = $(this).data("pick");
        // update remote
        var updates = {};
        updates[round + "/" + playerpick] = gameInstance["session"][round][playerpick];
        database.ref("rps/sessions").update(updates);
    } else {
        console.log("you already picked " + gameInstance["session"][round][playerpick]);
    }
    gameInstance.fight();
});


