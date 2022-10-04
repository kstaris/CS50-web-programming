//import {display_tweets} from 'static/network/display_tweets.js';

function App(){    
      
    function SaveTweet(){
        let tex = document.querySelector('#tweetText').value;
        fetch('', {
            method: 'POST',
            body: JSON.stringify({
                author: '{{user}}',
                text: tex
            })
        })
        .then(response => response.json())
        .then(result => {
            // Print result
            console.log(result);
            location.reload();

        });
        
    };
    
    display_tweets(document.querySelector('#tweets').dataset.user,1);  

    return (
        <div>
            <div id='newPost'>
                <textarea id="tweetText" maxlength="280" type="text" placeholder="What's happening?"></textarea>
                <input type="submit" value="Tweet" onClick={SaveTweet} />
            </div>
            
        </div>
    );
};
ReactDOM.render(<App />, document.querySelector('#app'));