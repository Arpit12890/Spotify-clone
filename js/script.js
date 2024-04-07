console.log('lets write js');
let currentsong=new Audio();
let songs;
let currfolder;

//ye function convert kr dega seconds to minutes m.
function convertSecondsToMinutes(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds%60);

    // Use padStart to add leading zero if needed
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder){
    currfolder=folder;
    let a= await fetch(`/${folder}/`)
    let response = await a.text();
    let div= document.createElement("div")
    div.innerHTML=response;
    let as=div.getElementsByTagName("a")
    songs=[]
    
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            // /songs/ ke baad ka tha vo le liya jayega split k
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
     //show all the song in the playlist
     let songul=document.querySelector(".songlist").getElementsByTagName("ul")[0]
     songul.innerHTML=""
     for (const song of songs) {
        songul.innerHTML=songul.innerHTML + `<li>
        <img class ="invert"src="img/music.svg">
        <div class="info">
            <div>${song.replaceAll("%20"," ")} </div>
            <div></div>
        </div>
        <div class="playnow">
            <span>Play now</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
        </div>
    </li>`;

     }

     //attach an event listner to each song
     Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click",element=>{
            console.log(e.querySelector(".info").firstElementChild.innerHTML)

            playMusic(e.querySelector(".info").firstElementChild.innerHTML)
        })
     })
     return songs
}

const playMusic=(track,pause=false)=>{
    currentsong.src=`/${currfolder}/` + track
    if(!pause){
        currentsong.play()
        play.src="img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML=decodeURI(track)

    document.querySelector(".songtime").innerHTML= "00:00/00:00"

}
async function displayalbums(){
    let a= await fetch(`/songs/`)
    let response = await a.text();
    let div= document.createElement("div")
    div.innerHTML=response;
    console.log(div);
    
    
    let anchors = div.getElementsByTagName("a")
    let cardcontainer = document.querySelector(".cardcontainer")
    let array = Array.from(anchors)
    for (let index = 3; index < array.length; index++) {
        const e = array[index]; 
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
            console.log(folder);
            
    
            //get the metadata of the folder
    let a= await fetch(`/songs/${folder}/info.json`)
    let response=await a.json();
    console.log(response);
    cardcontainer.innerHTML=cardcontainer.innerHTML + `<div data-folder="${folder}" class="card border">
    <div class="play">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none">
            <circle cx="11" cy="12" r="11" fill="#00FF00"/>
            <polygon points="8 6 16 12 8 18 8 6" fill="black"/>
          </svg>
    </div>
    <img src="/songs/${folder}/cover.jpeg">
    <h3>${response.title}</h3>
    <p>${response.description}</p>
    </div>` 
        }
    }
    
     //load the playlist whenever card is clicked
     Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click",async item=>{
            //currentTarget se ye hoga ki jb hm log card ko click krege tb pura card select hoga na ki photo ya text.
        songs= await getSongs(`songs/${item.currentTarget.dataset.folder}`)
        playMusic(songs[0])
        
        })
     })
    }

async function main(){
    //get the list of all songs
    await getSongs("songs/ncs")
    playMusic(songs[0],true)

    //display all the albums on the page
    await displayalbums();

     //attach an event listner to play ,next and previous
     play.addEventListener("click",()=>{
        if(currentsong.paused){
            currentsong.play()
            play.src="img/pause.svg"

        }
        else{
            currentsong.pause()
            play.src="img/play.svg"
        }
     })

     //listen for timeupdate event

     currentsong.addEventListener("timeupdate",()=>{
        console.log(currentsong.currentTime,currentsong.duration);
        document.querySelector(".songtime").innerHTML=`${convertSecondsToMinutes(currentsong.currentTime)}/${convertSecondsToMinutes(currentsong.duration)}`

        //for moving seekbar circle
        document.querySelector(".circle").style.left=(currentsong.currentTime/currentsong.duration)*100 + "%";
     })

     //add an event listner to seekbar

     document.querySelector(".seekbar").addEventListener("click",e=>{

        let percent=(e.offsetX/e.target.getBoundingClientRect().width)*100;
        document.querySelector(".circle").style.left= percent+ "%";

        //for changing the duration also when we move circle
        currentsong.currentTime=((currentsong.duration)*percent)/100
     })

     //add an event listner for hamburger

     document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left="0"
     })

     //add an event listner for close button

     document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left="-120%"
     })

     //add an event listner to previous and next

     previous.addEventListener("click",()=>{
        
        currentsong.pause()
        let index=songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if((index-1)>=0){
            playMusic(songs[index-1])
        }
     })
     
    //add an event listener to next
     next.addEventListener("click",()=>{
        currentsong.pause()
        console.log('next clicked');

        let index=songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if((index+1)<songs.length){
            playMusic(songs[index+1])
        }
     })

     //add an event to volume
     document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        console.log('settting volume to',e.target.value,"/ 100");
        currentsong.volume=parseInt(e.target.value)/100
        if(currentsong.volume>0){
            document.querySelector(".volume>img").src=document.querySelector(".volume>img").src.replace("mute.svg","volume.svg")
        }
     })

     //add event listner to mute the track
     document.querySelector(".volume>img").addEventListener("click",e=>{
        console.log(e.target)
        console.log("changing",e.target.src);
        if(e.target.src.includes("volume.svg")){
            e.target.src=e.target.src.replace("volume.svg","mute.svg")
            currentsong.volume=0;
            document.querySelector(".range").getElementsByTagName("input")[0].value=0
        }
        else{
            e.target.src=e.target.src.replace("mute.svg","volume.svg")
            currentsong.volume=.10;
            document.querySelector(".range").getElementsByTagName("input")[0].value=10

        }
        
        
        
        
    })
}
main()


