$(document).ready(function() {
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
var sessionID = parseInt(moment().format("x")).toString(36); // use parseInt(sessionID, 36) to reverse this conversion
var gameInstance = {
    "userid": 1,
    "session": {
        "sessionID": sessionID,
        "palyer1Name": "",
        "palyer2Name": "",
        "player1Wins": 0,
        "player2Wins": 0,
        "ties": 0,
        "currRound": {
            "player1Pick": "",
            "player2Pick": "",
        }
    },

    // decide who wins the current round
    fight: function (p1, p2) {
        var p1 = this["session"]["currRound"]["player1Pick"];
        var p2 = this["session"]["currRound"]["player2Pick"];
        var winner = 0; // winner id, 1 or 2. returns 0 if it's a tie.
        if (p1 === "" || p2 === "") {
            console.log("wait for another user's pick");
            return -1;
        } else if (p1 === p2) {
            this.session["ties"] += 1;
        } else {
            this.session["currRound"]["player1Pick"] = p1;
            this.session["currRound"]["player2Pick"] = p2;
            switch (p1 + p2) {
                case "scissiorpaper":
                case "rockscissior":
                case "paperrock":
                case "rocklizard":
                case "lizardspock":
                case "spockscissior":
                case "lizardpaper":
                case "spockrock":
                case "scissiorlizard":
                case "paperspock":
                    this.session["player1Wins"] += 1;
                    winner = 1;
                    console.log(p1 + " vs " + p2 + " -- player1 wins");
                    break;
                case "paperscissior":
                case "scissiorrock":
                case "paperrock":
                case "lizardrock":
                case "spocklizard":
                case "scissiorspock":
                case "paperlizard":
                case "rockspock":
                case "lizardscissior":
                case "spockpaper":
                    this.session["player2Wins"] += 1;
                    winner = 2;
                    console.log(p1 + " vs " + p2 + " -- player2 wins");
                    break;
            }
        }
        return winner;
    },

    startGame: function () {
        // check if there is any player waiting
        // if none, create new session and be the first player
        // else, retrieve session id and be the second player
        var self = this;
        console.log(self);
        database.ref("rps/openSessionID").once('value', function (snapshot) {
            var openSessionID = snapshot.val();
            console.log("opensession=" + openSessionID);
            if (openSessionID == null || openSessionID == "" ) { // create new session
                console.log(self);
                database.ref("rps/openSessionID").set(self["session"]["sessionID"]);
                // create a session
                database.ref("rps/sessions/" + self["session"]["sessionID"]).update(self["session"]);
                $("#sessionID").text(self["session"]["sessionID"]);
                console.log("initialize remote");
                console.log("ready player 1, with session:");
                console.log(self["session"]);
                return self["session"]["sessionID"];
            } else { // join existing session
                // gameInstance["session"]["sessionID"] = openSessionID;
                self["userid"] = 2;
                // retrieve a session
                database.ref("rps/sessions/" + openSessionID).once('value', function (snap2) {
                    self["session"] = snap2.val();
                    $("#sessionID").text(self["session"]["sessionID"]);
                    console.log("retrieve game session from remote");
                    database.ref("rps/openSessionID").set("");
                    console.log("ready player 2, with session:");
                    console.log(self["session"])
                });
                
                return self["session"]["sessionID"];
            }
        });
    },

    endGame: function () {
        var self = this;
        // remove session stats
        database.ref("rps/sessions/" + this["session"]["sessionID"]).remove();
        // remove opensessionid
        database.ref("rps/openSessionID").once('value', function (snapshot) {
            if (snapshot.val() == self["session"]["sessionID"]) {
                database.ref("rps/openSessionID").set("");
            }
        });
        return self["session"]["sessionID"];
    },
}
console.log("sessionID=" + gameInstance["session"]["sessionID"]);


$("#btn-start").on("click", function(){
    var sid = gameInstance.startGame();
    console.log("game started with sid=" + sid);
    $(this).prop("disabled", true);
    $("#btn-end").prop("disabled", false);
    $("#playground").show();

    // real time update // not working FIXME
    console.log(gameInstance["session"]["sessionID"] + "xxxxxxxxx");
    database.ref("rps/sessions" + gameInstance["session"]["sessionID"]).on("value",
        function (snapshot) {
            console.log("value changed 222222222 snapshot child currRound=" + snapshot.child("currRound/player1Pick").val());
            $("#player1Pick").text(snapshot.child("currRound/player1Pick").val());
            $("#player2Pick").text(snapshot.child("currRound/player2Pick").val());
            if (snapshot.child("currRound/player1Pick").val() != "" || snapshot.child("currRound/player2Pick").val() !="") {
                $("#player1Pick").text(snapshot.child("currRound/player1Pick").val());
                $("#player2Pick").text(snapshot.child("currRound/player2Pick").val());
            } else {
                console.log("no player picked. snapshot=" + snapshot.val());
            }
        }, function (errorObject) {
            console.log("The read failed: " + errorObject)
    });

    console.log("instance=");
    console.log(gameInstance);
});

$("#btn-end").on("click", function(){
    var sid = gameInstance.endGame();
    console.log("game ended sid=" + sid);
    $(this).prop("disabled", true);
    $("#btn-start").prop("disabled", false);
    $("#playground").hide();
});




// button cliced
$(".btn-pick").on("click", function () {
    console.log("clicked instance=");
    console.log(gameInstance);
    var playerpick = "player" + gameInstance["userid"] + "Pick";
    if (gameInstance["session"]["currRound"][playerpick] == "") {
        console.log("you just picked: " + $(this).data("pick"));
        gameInstance["session"]["currRound"][playerpick] = $(this).data("pick");
        // update remote
        var updates = {};
        updates["currRound/" + playerpick] = gameInstance["session"]["currRound"][playerpick];
        database.ref("rps/sessions/" + gameInstance["session"]["sessionID"]).update(updates);
        console.log("clicked and updated 1111111111 local game instance/session/currRound:");
        console.log(gameInstance["session"]["currRound"]);
    } else {
        console.log("you already picked " + gameInstance["session"]["currRound"][playerpick]);
    }
    gameInstance.fight();
});

});
