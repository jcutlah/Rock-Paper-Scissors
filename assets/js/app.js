$(document).ready(function(){

// Firebase data: Create a game object
// GameStatus - gameInProgress (bool), players (list of 2 player objects each w/ name, gamerName, wins, losses), stage (newRound, firstThrown, outcome)
// Choices - list of objects with information on each (name, beatsWhat)
// Player data (activePlayer (bool), whose turn, how many wins/losses, current pick, pickHistory, current taunt, allTaunts)

// Your web app's Firebase configuration
    var firebaseConfig = {
        apiKey: "AIzaSyDL5S0AKo9tHK4IHSL1_e04t_2WqSNcK4Q",
        authDomain: "rock-paper-scissors-6e066.firebaseapp.com",
        databaseURL: "https://rock-paper-scissors-6e066.firebaseio.com",
        projectId: "rock-paper-scissors-6e066",
        storageBucket: "rock-paper-scissors-6e066.appspot.com",
        messagingSenderId: "656182711016",
        appId: "1:656182711016:web:f094257f9026728f"
    };
    var game;
    var players;
    var users;
    var user;
    var usernames = [];
    var gameLog;
    var playerKey;
    var player1;
    var player2;
    var winnerWins;
    var winnerLosses;
    
  // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    var database = firebase.database();

    var numPlayers;
    var playerList;
    var username;
    var isPlayer = false;

    function addUserToFirebase(userInfo){
        return database.ref('users').push(userInfo).key;
    }
    function checkChoices(){
        database.ref('game/players').once('value').then(function(snapshot){
            players = snapshot.val();
            delete players.recentUserAdded;
            counter = 1;
            for (var key in players){
                if (counter === 1){
                    player1 = players[key].player
                } else {
                    player2 = players[key].player
                }
                counter ++;
            }
            console.log(player1, player2);
            if (player1.choice && player2.choice){
                console.log('both players have chosen');
                if (player1.choice.beats === player2.choice.name) {
                    //player 1 wins
                    console.log(player1.name + " wins!");
                    endGame(player1.name, player2.name);
                } else if (player2.choice.beats === player1.choice.name) {
                    //player 2 wins
                    console.log(player2.name + " wins!")
                    endGame(player2.name, player1.name);
                } else {
                    //tie score
                    console.log('tie score');
                    endGame(null, null);
                }
            }
        });
    }
    function clearFeed(){
        $('#game-feed').html('');
        database.ref('gameLog').once('value').then(function(snapshot){
            gameLog = snapshot.val();
            for(var chat in gameLog){
                // console.log(chat);
                if (chat !== "initEntry"){
                    console.log(chat);
                    database.ref('gameLog/'+chat).remove()
                }
            }
            console.log(gameLog);
        });
    }
    function endGame(winnerName, loserName){
        $('body').removeClass('player-chosen');
        console.log('clearing users\' choices')
        // add it to the feed
        // remove users from the active players
        if (!winnerName){
            // tie score
            printToFeed('Tie score!');
        } else {
            // increment user's wins
            incrementPlayerStats(winnerName,loserName);
            database.ref('users').once('value').then(function(snapshot){
                users = snapshot.val();
                for (var key in users){
                    if (users[key].name === winnerName){
                        winnerWins = users[key].wins;
                        winnerLosses = users[key].losses
                        printToFeed(winnerName + " wins! ("+winnerWins+" wins, "+winnerLosses+" losses)");;
                    }
                }
            });
        }
        database.ref('game/players').once('value').then(function(snapshot){
            players = snapshot.val();
            delete players.recentUserAdded;
            console.log(players);
            for (var key in players){
                console.log(players[key])
                delete players[key].player.choice
                database.ref('game/players/'+key).set(players[key]);
            }
        });
    }
    function getNumPlayers(snapshot){
        // console.log(snapshot);
        playerList = Object.keys(snapshot);
        playerList.pop('recentUserAdded');
        if (playerList.length === 0){
            numPlayers = 0;
        } else if (playerList.length === 1) {
            numPlayers = 1
        } else if (playerList.length === 2) {
            numPlayers = 2;
        }
        // });
    }
    function getGameReady(){
        // console.log(isAlreadyPlayer());
        // isPlaying = isAlreadyPlayer();
        console.log(numPlayers);;
        if (numPlayers === 1 && username){
            // debugger;
            $('body').addClass('player-waiting');
            $('body').removeClass('live-game');
            $('body').removeClass('new-game');
            if (!isPlayer){
                showModal('#play-game-modal', "#in-progress-message", "Looks like someone's waiting to play. You want to play or you wanna leave 'em hanging?");
            } else {
                $('body').addClass('active-player');
                // showModal('#waiting-modal', "#waiting-message", "Waiting for a challenger...");
            }
        } else if (numPlayers === 2 && username) {
            $('body').addClass('live-game');
            for (var key in players){
                console.log(players);
                delete players.recentUserAdded;
                console.log(key);
                console.log(players[key].player.name);
                if (players[key].player.name === username && players[key].player.choice){
                    $('body').addClass('player-chosen');
                    break;
                } else {
                    $('body').removeClass('player-chosen');
                }
            }
            $('body').removeClass('player-waiting');
            $('body').removeClass('new-game');
            database.ref('game/isActiveGame').set(true);
            console.log('we\'re ready for a game here!');
            hideModal('#play-game-modal');
        } else if (numPlayers === 0 && username) {
            $('body').addClass('new-game');
            $('body').removeClass('player-waiting');
            $('body').removeClass('player-chosen');
            $('body').removeClass('live-game');
            $('body').removeClass('active-player');
            clearFeed();
            showModal('#play-game-modal', "#in-progress-message", "Looks like we're ready for a new game! You want to play?");
        } else {
            // console.log(numPlayers);
            $('#game-feed').hide();
        }
        
    }
    function hideModal(modalTarget){
        $(modalTarget).hide();
    }
    function incrementPlayerStats(winner, loser){
        database.ref('users').once('value').then(function(snapshot){
            console.log(snapshot.val());
            users = snapshot.val();
            console.log(users);
            delete users.testky;
            for (var key in users){
                if (users[key].name === winner){
                    user = users[key];
                    user.wins++;
                    console.log('incrementing '+winner+'\'s wins to '+user.wins);
                    database.ref('users/'+key+'/wins').set(user.wins);
                } else if (users[key].name === loser) {
                    console.log('decrementing '+loser+'\'s losses');
                    user = users[key];
                    user.losses++;
                    database.ref('users/'+key+'/losses').set(user.losses);
                }
            }
        });
    }
    function printToFeed(message){
        database.ref('gameLog').push({
            message
        });
    }
    function showModal(modalTarget, messageTarget, newPrompt){
        $(modalTarget).show();
        $(messageTarget).text(newPrompt);
    }

// ################ CODE EXECUTION BELOW ################## //

    if (localStorage.getItem('rpsUsername') === null){
        console.log('no username');
        showModal('#signup-modal');
    } else {
        username = localStorage.getItem('rpsUsername');
    }

// ################# CLICK EVENT LISTENERS ################ //

    $('#signup-button').on('click',function(e){
        e.preventDefault();
        $('#game-feed').show();
        username = $('#signup-user').val();
        userInfo = {
            name: username,
            dateAdded: firebase.database.ServerValue.TIMESTAMP,
            wins: 0,
            losses: 0
        }
        database.ref('users').once('value').then(function(snapshot){
            // checks to see if already a registered user
            users = snapshot.val();
            isUser = false;
            
            for (var user in users){
                if (users[user].name === username){
                    console.log('already in database');
                    isUser = true;
                    break;
                } else {
                    console.log('not a match');
                }
            }
            if (!isUser){
                addUserToFirebase(userInfo);
            }
            database.ref('game/players/recentUserAdded').set(firebase.database.ServerValue.TIMESTAMP);
        });
        
        localStorage.setItem('rpsUsername', $('#signup-user').val());
        $('#signup-modal').hide();
    });
    $('#play-game').on('click',function(){
        $('body').addClass('active-player');
        database.ref('game/players').once('value').then(function(snapshot){
            console.log(typeof snapshot.val());
            players = snapshot.val();
            console.log(players);
        });
        printToFeed(username + " has joined the game.");
    
        database.ref('game/players').push({
            player: {
                name: username
            }
        });
        // console.log(numPlayers, playerKey)
        hideModal('#play-game-modal');
        // console.log(database.ref('game/players'));
    });
    $('#leave-game').on('click',function(){
        isPlayer = false;
        database.ref('game/isActiveGame').set(false);
        $('body').removeClass('active-player');
        printToFeed(username + " has left the game");
        database.ref('game/players').set({
            recentUserAdded: firebase.database.ServerValue.TIMESTAMP
        });
    });
    $('#watch-game').on('click',function(){
        $('#game-feed').show();
        printToFeed(username+" joined as a spectator");
        $('body').addClass('spectator');
    });
    $('#chat-field button').on('click',function(e){
        e.preventDefault();
        var message = $('#chat').val().trim();
        printToFeed(username+": "+message);
        $('#chat').val('');
    });
    $('#rock').on('click',function(){
        printToFeed(username+" has made their choice.");
        $('body').addClass('player-chosen');
        // console.log('game/players/'+playerKey+'/player');
        database.ref('game/players/'+playerKey+'/player').set({
            choice: {
                name: 'rock',
                beats: 'scissors'
            },
            name: username
        })
        checkChoices();
    });
    $('#paper').on('click',function(){
        printToFeed(username+" has made their choice.");
        $('body').addClass('player-chosen');
        // console.log('game/players/'+playerKey+'/player');
        database.ref('game/players/'+playerKey+'/player').set({
            choice: {
                name: 'paper',
                beats: 'rock'
            },
            name: username
        })
        checkChoices();
    });
    $('#scissors').on('click',function(){
        printToFeed(username+" has made their choice.");
        $('body').addClass('player-chosen');
        // console.log('game/players/'+playerKey+'/player');
        database.ref('game/players/'+playerKey+'/player').set({
            choice: {
                name: 'scissors',
                beats: 'paper'
            },
            name: username
        })
        checkChoices();
    });

// ################### FIREBASE EVENT LISTENERS ################# //
// Once at page load, then on every update that triggers the event ##############
    database.ref('gameLog').on('child_added', function(snapshot){
        var feedItem = $('<p>');
        feedItem.text(snapshot.val().message);
        $('#game-feed').prepend(feedItem);
    });
    database.ref('game/players').on('child_removed', function(snapshot){
        getGameReady(isPlayer);
    });
    database.ref('game').on('value',function(snapshot){
        getNumPlayers(snapshot.val().players);
    });
    database.ref('game/players').on('value', function(snapshot){
        // debugger;

        // console.log(snapshot.val());
        getNumPlayers(snapshot.val());
        // isPlaying = isAlreadyPlayer();
        roster = snapshot.val();
        delete roster.recentUserAdded;
        players = roster;
        for (var key in roster) {
            // console.log(roster[key].player.name);
            // console.log(key);
            if (roster[key].player.name === username){
                isPlayer = true;
                database.ref('game/isActiveGame').once('value').then(function(snapshot){
                    // console.log(snapshot.val());
                    if (snapshot.val()){
                        $('body').addClass('active-player');
                    }
                });
                
                playerKey = key;
            }
        }

        getGameReady(isPlayer);        
    });


    database.ref('users').on('child_added',function(snapshot){
        
    });


});