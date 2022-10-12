
const user_id = JSON.parse(document.getElementById('user_id').textContent);

function display_t(profile, page){
    function fetchTweets(pageN){
        fetch(`/tweets/${profile}/${pageN}`)
        .then(response => response.json())
        .then(tweetsL => { 
            let tweetsP = JSON.parse(tweetsL);
            setPage(tweetsP)
    })}

    const [pageTw, setPage] = React.useState('');
    React.useEffect(() => {
        fetchTweets(1);
    }, [])
    
    function previous() {
        if (pageTw.has_previous){
            console.log(pageTw.next_page_number)
            return(
                <span>
                    <button onClick={() => fetchTweets(1)}>First</button>
                    <button onClick={() => fetchTweets(pageTw.previous_page_number)}>Previous</button>
                </span>
            )
        }
    }

    function next() {
        if (pageTw.has_next){
            return(
                <span>
                    <button onClick={() => fetchTweets(pageTw.next_page_number[0])}>Next</button>
                    <button onClick={() => fetchTweets( pageTw.num_pages)}>Last</button>
                </span>
            )
        }
    }

    try {
        return(
            <div>{pageTw.tweets.map((cTweet) => display(cTweet))}
            <div className='pagination'>
                <span className='step-links'>
                    {previous()}
                    <span>Page {pageTw.number} of {pageTw.num_pages}</span>
                    {next()}
                </span>
            </div>
            </div>
        )
    }
    catch(err) {
        console.log('unsucessful')
    }
} 
    
function likeF(tweet){
    fetch('/like', {
        method: 'POST',
        body: JSON.stringify({
            tweet: tweet
        })
    })
    .then(response => response.json())
    .then(number => {
        document.querySelector(`#ID${tweet}`).innerHTML = `Likes: ${number}`
    })
    
}


function display(cTweet){
    
    function edit(){
        return(
            <div></div>
        )
    }
    function editBtn(){
        if (cTweet.authorId == user_id){
            return (
            <button onClick={edit()}>Edit</button>
        )}
        else {
            return 
        }
    }
    return (
        <div>
            <a href={`/profile/${cTweet.author}`}>{cTweet.author}</a>
            <span>{cTweet.timestamp}</span>
            <div>{`text${cTweet.id}`}</div>
            <span id={`ID${cTweet.id}`}>Likes: {cTweet.likes}</span>
            <button onClick={() => likeF(cTweet.id)}>Like</button>
            {editBtn()}  
        </div>
    )
}
function display_tweet(cTweet, profile){
    let tweet = document.createElement('div');
    let author = document.createElement('a');
    let text = document.createElement('div');
    let date = document.createElement('span');
    let likes = document.createElement('span');
    let like = document.createElement('button');
    if (cTweet.authorId == profile){
        var edit = document.createElement('button');
        edit.innerHTML = 'Edit';
    }
    tweet.id = cTweet.id
    text.id = `text${cTweet.id}`
    author.innerHTML = cTweet.author;
    author.href = `/profile/${cTweet.author}`
    text.innerHTML = cTweet.text;
    date.innerHTML = cTweet.timestamp;
    like.innerHTML = 'Like'
    likes.id = `ID${cTweet.id}`;
    like.addEventListener('click', () => {
        likeF(cTweet.id);
    
    })
    document.querySelector('#tweets').appendChild(tweet, document.querySelector('#tweets').firstChild);
    tweet.appendChild(author);
    tweet.appendChild(date);
    tweet.appendChild(text);
    fetch(`/likes/${cTweet.id}`)
    .then(response => response.json())
    .then(likeNum => {
        likes.innerHTML = `Likes: ${likeNum}`;
        tweet.appendChild(likes);
        tweet.appendChild(like);
        if (edit){
            tweet.appendChild(edit);
            edit.addEventListener('click', () => {
                console.log('te')
                let textDiv = document.createElement('div');
                let newText = document.createElement('textarea');
                let saveButton =document.createElement('button');
                textDiv.appendChild(newText);
                saveButton.innerHTML = 'Save';
                newText.value = text.innerHTML;
                text.parentNode.replaceChild(textDiv, text);
                edit.parentNode.replaceChild(saveButton, edit);
                saveButton.addEventListener('click', () => {
                    fetch('/edit', {
                        method: 'POST',
                        body: JSON.stringify({
                            owner: cTweet.author,
                            tweet: cTweet.id,
                            text: newText.value
                        })
                    })
                    .then(response => response.json())
                    .then(result => {
                        // Print result
                        text.innerHTML = newText.value
                        saveButton.parentNode.replaceChild(edit, saveButton)
                        textDiv.parentNode.replaceChild(text, textDiv);
            
                    });
                    
                })
            })
        }

    })
    
    
}