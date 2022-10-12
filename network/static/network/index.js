
function App(){   

    const [profile, setProfile] = React.useState(findProf());
    const user_id = JSON.parse(document.getElementById('user_id').textContent);

    function findProf(){
        if (window.location.pathname != '/'){
            console.log(window.location.pathname.split('/').pop())
             return window.location.pathname.split('/').pop();
        } else {
            return 'all'
        }
    }
    
    document.querySelector('#following').addEventListener('click', () => {
        console.log('following set')
        setProfile('following');
        fetchTweets(1);
    })

    function SaveTweet(){
        let tex = document.querySelector('#tweetText').value;
        fetch('/', {
            method: 'POST',
            body: JSON.stringify({
                author: '{{user}}',
                text: tex
            })
        })
        .then(() => {
            document.querySelector('#tweetText').value = '';
            fetchTweets(1)
        })
    };
    
    const [pageTw, setPage] = React.useState(1);

    function fetchTweets(pageN){
        setProfile((state) => {
            fetch(`/tweets/${state}/${pageN}`)
            .then(response => response.json())
            .then(tweetsL => { 
                let tweetsP = JSON.parse(tweetsL);
                setPage(tweetsP)
                if (state != 'all' || state != 'following'){
                    window.history.pushState('Profile', 'user',`http://127.0.0.1:8000/profile/${state}`)
                }
            });
        return state;
        })
    }

    function display_t(){
        React.useEffect(() => {
            fetchTweets(1);
        }, [])
        
        function previous() {
            if (pageTw.has_previous){
                return(
                    <span>
                        <button className='pageButtons' onClick={() => fetchTweets(1)}>First</button>
                        <button className='pageButtons' onClick={() => fetchTweets(pageTw.previous_page_number)}>Previous</button>
                    </span>
                )
            }
        }

        function next() {
            if (pageTw.has_next){
                return(
                    <span>
                        <button className='pageButtons' onClick={() => fetchTweets(pageTw.next_page_number[0])}>Next</button>
                        <button className='pageButtons' onClick={() => fetchTweets( pageTw.num_pages)}>Last</button>
                    </span>
                )
            }
        }

        try {     
            return(
                <div id='feed'>{pageTw.tweets.map((cTweet) => display(cTweet))}
                <div className='pagination'>
                    <span className='step-links'>
                        {previous()}
                        <span>Page {pageTw.number} of {pageTw.num_pages} </span>
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
        let outlineHeart = '';

        function heartClick(){
            if (outlineHeart == 'heart'){
                outlineHeart = 'heartOutline';
                document.querySelector(`#heart${cTweet.id}`).className = 'heartOutline';
                return 'heartOutilne';
            } else if (outlineHeart == 'heartOutline') {
                outlineHeart = 'heart';
                document.querySelector(`#heart${cTweet.id}`).className = 'heart'
                return 'heart';
            } else if (cTweet.likeStatus){

                outlineHeart = 'heartOutline';
                return 'heartOutline';
            } else {
                outlineHeart = 'heart';
                return 'heart';
            }
        }

        function edit(){
            let text = document.querySelector(`#text${cTweet.id}`)
            let edit = document.querySelector(`#edit${cTweet.id}`)
            let textDiv = document.createElement('div');
            let newText = document.createElement('textarea');
            let saveButton =document.createElement('button');
            textDiv.appendChild(newText);
            saveButton.innerHTML = 'Save';
            newText.value = cTweet.text;
            newText.className = 'newText';
            text.parentNode.replaceChild(textDiv, text);
            edit.parentNode.replaceChild(saveButton, edit);
            saveButton.className='saveEdit';
            saveButton.addEventListener('click', () => {
                fetch('/edit', {
                    method: 'POST',
                    body: JSON.stringify({
                        owner: cTweet.author,
                        tweet: cTweet.id,
                        text: newText.value
                    })
                })
            text.innerHTML = newText.value
            saveButton.parentNode.replaceChild(edit, saveButton)
            textDiv.parentNode.replaceChild(text, textDiv);


        })}
        function editBtn(){
            if (cTweet.authorId == user_id){
                return (
                <button className='editBtn' id={`edit${cTweet.id}`} onClick={() => edit()}>Edit</button>
            )}
            else {
                return 
            }
        }

        function handleC() {
            setProfile(cTweet.authorId);
            fetchTweets(1);
          }        
        return (
            <div className='tweet'>
                <button className='author' onClick={() => {handleC()}}>{cTweet.author}</button>
                {editBtn()} 
                <span className='time'>{cTweet.timestamp}</span>
                <div id={`text${cTweet.id}`}>{cTweet.text}</div>
                <span id={`ID${cTweet.id}`}>Likes: {cTweet.likes}</span>
                <button id={`heart${cTweet.id}`} className={heartClick()} onClick={() => {likeF(cTweet.id), heartClick()}}>❤️</button>
            </div>
        )
    }
    
    function follow(){
        console.log(followingStatus)
        fetch('/follow', {
            method: 'POST',
            body: JSON.stringify({
                status: followingStatus,
                followTo: profile
            })
        })
        .then(response => response.json())
        .then(result => {
            setFollowingStatus(result)
        })
        return false;
    }

    function followBtn(){
        if (user_id != profile){
            if (followingStatus == 'notFollowing'){
                return(
                    <button id='followBtn' onClick={() => follow()}>Follow</button>
                )
            } else {
                return(
                    <button id='followBtn' onClick={() => follow()}>Unfollow</button>
                )
            }
        }
        
    }
    const [followers, setFollowers]  = React.useState(0)
    const [following, setFollowing]  = React.useState(0)
    const [followingStatus, setFollowingStatus] = React.useState('notFollowing')
    const [username, setUsername] = React.useState('')

    function getProfile(){
        fetch(`/profilerender/${profile}`)
        .then(response => response.json())
        .then(profile => {
            console.log(`profile: ${profile.followers}`)
            console.log(`Followers: ${profile.followers}`)
            setFollowers(profile.followers);
            setFollowing(profile.following);
            setFollowingStatus(profile.status);
            setUsername(profile.username);
        });
    }
    if (profile == 'all' ){
        return (
            <div>
                <div id='newPost'>
                    <textarea id="tweetText" maxlength="280" type="text" placeholder="What's happening?"></textarea>
                    <input id='submitTweet' type="submit" value="Tweet" onClick={SaveTweet} />
                </div>
                <div className='tweets'>{display_t()}</div>
            </div> 
        );
    } else if (profile == 'following'){
        return (
            <div>
                <div id='newPost'>
                    <textarea id="tweetText" maxlength="280" type="text" placeholder="What's happening?"></textarea>
                    <input type="submit" value="Tweet" onClick={SaveTweet} />
                </div>
                <div className='tweets'>{display_t()}</div>
            </div> 
        );
    } else{
        getProfile('followers');
        
        return (
            <div >
                <div id='userInfo'>
                    <div><span className='userInfoLable'>Username:</span> {username}</div>
                    <div><span className='userInfoLable'>Followers:</span> {followers}</div>
                    <div><span className='userInfoLable'>Following:</span> {following}</div>
                    {followBtn()}
                </div>
                <div className='tweets'>
                    {display_t()} 
                </div>
            </div>
        );
    } 
};
ReactDOM.render(<App />, document.querySelector('#app'));