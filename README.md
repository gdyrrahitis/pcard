# BNC, Agile poker planning real-time application

A real-time application for teams to make estimations using the agile poker planning technique.
Poker planning is all about estimation, so a poker planning session is about describing an agile story to team, with each individual (estimator), making estimations about this story.
Estimation is done through poker planning cards with values 0, 1, 2, 3, 5, 8, 13, 20, 40 and 100 (mountain goat), each representing the number of story points in units that the team has agreed on. All estimations are revealed the same time.
If all estimators choose the same value this becomes the estimate. If estimates are different, they are discussed among the team with the highest and lowest giving their reasons. 
If needed, they reselect cards, making estimations again.

In this application a user can join rooms where other participates are awaiting to start poker planning sessions. The procedure descibed before is taking place, having the creator of the room as the moderator, essentially dictating the planning session, as well as managing connected participators.

Application is build with NodeJS, Express, Socket.io, AngularJS and SASS. 

*Development is still in progress*

## Examples
*Examples pending*

## Motivation

I really wanted to test `Socket.io` library and this was my chance. My initial thought was to build a chat application, but I quickly understand that this won't actually make me get deeper with `Socket.io`. Examples like that exist everywhere in web these days.
I was really strugling to think of a good, more complex scenario to build.
After a Poker Planning session in office I had an "eureka moment".
This application solves the team frustration on agile poker planning by having a virtual deck, shared among the team members online. It is a lightweight, fast application, suitable for teams to hop on and make estimations on their projects. 

## Installation

Clone or download project to desktop.
You need to have nodeJS installed as well as NPM package manager.
Check for them with the following commands:

`node -v`

`npm -v`

Go to the root directory of the application and run the following command on a CMD window:
`npm start`

Open a browser and navigate to `http://localhost:54879`

Want to test out the real-time features of the app? Open another browser and paste the same address. Use the application, join same rooms with the other browser window.

## Tests
*Tests description pending*

## License
Apache License, Version 2.0