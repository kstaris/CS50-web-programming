function display_tweets(profile, page){ 
    document.querySelector('#tweets').innerHTML='';
    document.querySelector('.step-links').innerHTML='';
    fetch(`/tweets/${profile}/${page}`)
    .then(response => response.json())
    .then(tweets => {
        let tweetsP = JSON.parse(tweets);
        tweetsP['tweets'].forEach( function(cTweet) {
            const user_id = JSON.parse(document.getElementById('user_id').textContent);
            display_tweet(cTweet, user_id)
        }); 
        if (tweetsP['has_previous']){
            let first = document.createElement('button');
            let previous = document.createElement('button');
            first.innerHTML = "first";
            first.id = 'first';
            previous.innerHTML = "previous";
            previous.id = 'previous';
            document.querySelector('.step-links').appendChild(first);
            document.querySelector('.step-links').appendChild(previous);
            previous = document.querySelector('#previous');
            previous.addEventListener('click', () => display_tweets('all', tweetsP.previous_page_number));
            first = document.querySelector('#first');
            first.addEventListener('click', () => display_tweets('all', 1));
        }
          
        let current = document.createElement('span');
        current.innerHTML = `Page ${ tweetsP.number } of ${ tweetsP.num_pages }.`;
        document.querySelector('.step-links').appendChild(current);
        if (tweetsP['has_next']){
            let next = document.createElement('button');
            let last = document.createElement('button');
            next.innerHTML = 'next';
            next.id ='next';
            last.innerHTML = 'last';
            last.id = 'last';
            document.querySelector('.step-links').appendChild(next);
            document.querySelector('.step-links').appendChild(last);
            next = document.querySelector('#next');
            next.addEventListener('click', () => display_tweets('all', tweetsP.next_page_number));
            last = document.querySelector('#last');
            last.addEventListener('click', () => display_tweets('all', tweetsP.num_pages));   
        }
        return false;
    })  
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