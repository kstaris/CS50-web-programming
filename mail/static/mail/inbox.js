document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').onsubmit = () => send_email();
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  //Load emails
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(data => {
    let emails = data;
    console.log(`Emails in load: ${emails}`);
    emails.forEach(emaill => {
      let block = document.createElement('div');
      let sender = document.createElement('span');
      let subject = document.createElement('span');
      let time = document.createElement('span');
      let button = document.createElement('button');

      button.className = 'emailButton';
      button.value = emaill.id;
      block.className = 'email';
      sender.innerHTML = emaill.sender;
      sender.className = 'sender';
      subject.innerHTML = emaill.subject;
      subject.className = 'subject';
      time.innerHTML = emaill.timestamp;
      time.className = 'time';
      if (emaill.read){
        block.style.backgroundColor = 'lightgray';
      } else {
        block.style.backgroundColor= "white";
      }
      document.querySelector('#emails-view').appendChild(button);
      button.appendChild(block);
      block.appendChild(sender);
      block.appendChild(subject);
      block.appendChild(time);
      button.addEventListener('click', () => view_email(emaill.id));
    });
  })

  
}

  //Send email
function send_email() {
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result);
  }).then (() => {
    load_mailbox('sent')});
  return false;
  } 

  //View email
function view_email(email_id) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  
  //Set email to read
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
  //Find email data
  fetch(`emails/${email_id}`)
  .then(response => response.json())
  .then(data => {
    let email = data;

    let sender = document.querySelector('#from')
    let recipients = document.querySelector('#to');
    let subject = document.querySelector('#subject');
    let timestamp = document.querySelector('#timestamp');
    let body = document.querySelector('#body');
    let archive = document.querySelector('#archive');

    sender.innerHTML = `<b>From:</b> ${email.sender}`;
    recipients.innerHTML = '<b>To:</b> ';
    email.recipients.forEach(recipient => {
      recipients.innerHTML = recipients.innerHTML + recipient + ' ';
    });
    subject.innerHTML = `<b>Subject:</b> ${email.subject}`;
    timestamp.innerHTML = `<b>Timestamp:</b> ${email.timestamp}`;
    body.innerHTML = email.body;
    //Archive button
    if (email.sender != document.querySelector('h2').innerHTML){
      archive.style.display = 'block';
      if (email.archived) {
        archive.innerHTML = 'Unarchive';
      } else {
        archive.innerHTML = 'Archive';
      }
      // Handle clicking Archive button
      archive.onclick = function() {
        if (email.archived == false){
          fetch(`/emails/${email_id}`, {
            method: 'PUT',
            body: JSON.stringify({
              archived: true
            })
          }).then( () => load_mailbox('inbox')) ;
        } else {
          fetch(`/emails/${email_id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: false
              })
            }).then( () => load_mailbox('inbox')) ;
        } 
      }
    }
    else{
      archive.style.display = 'none';
    }
    //Reply click
    document.querySelector('#reply').onclick = () => {
      compose_email();
      document.querySelector('#compose-recipients').value = email.sender;
      document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
      document.querySelector('#compose-body').value = `"On ${email.timestamp} ${email.sender} wrote: ${email.body}"`;
      
    }
  })
  }

  