"use strict";

function generateCard( longLat, id,title, input, likes) {
    let kortti = document.createElement("div");
    kortti.className = "card";
    kortti.id = id;

    let vari = document.createElement("div");
    vari.id = "vari";
    vari.className = "vari";

    let cardBody = document.createElement("div");
    cardBody.className = "card-body";
    
    let cardTitle = document.createElement("h5");
    cardTitle.className = "card-title";
    cardTitle.innerHTML = title;

    let cardText = document.createElement("p");
    cardText.className = "card-text";
    cardText.innerHTML = input

    let voteButton = document.createElement("a");
    voteButton.href = "#";
    voteButton.className = "btn btn-primary"
    voteButton.innerHTML = "LASKIHOMER"

    cardBody.appendChild(cardTitle);
    cardBody.appendChild(cardText);
    cardBody.appendChild(voteButton);


    kortti.appendChild(vari);
    kortti.appendChild(cardBody);


    document.getElementById("cardContainer").appendChild(kortti);
}
