var Btn = document.getElementById('Btn');
var more = document.getElementById('more');
var dots = document.getElementById('dots');

function Readmore(){
    if(more.style.display === "none"){
        more.style.display = 'inline'
    } else {
        more.style.display = "none"
    }
}

Btn.addEventListener('click', Readmore)
