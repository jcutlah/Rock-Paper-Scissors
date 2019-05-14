# Rock Paper Scissors
A realtime game that allows to players to compete head to head, while others can watch as spectators. The database component (required for the realtime functionality of the game) is Google Firebase

The game includes a chat feed, that allows players and spectators to interact with each during play time. 

In order to play the game, you must be logged in. Login is persisted via storing the username in local storage, as well as in Firebase. 

After logging in, the user will see a modal with options to play or watch the game. Different messages will show above the buttons depending on whether there is already an opponent signed up. If a game is already in session, the game feed is shown to the user so they can see how the game progresses.

When a player clicks 'leave game', the game ends for all players and spectators