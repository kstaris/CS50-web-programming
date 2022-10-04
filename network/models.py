from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Tweet(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.CharField(max_length=280)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.author}: {self.text}"

    def serialize(self):
        return{
            "id":self.id,
            "authorId":self.author.id,
            "author":self.author.username,
            "text":self.text,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
        }

class Like(models.Model):
    liker = models.ForeignKey(User, on_delete=models.CASCADE)
    tweet = models.ForeignKey(Tweet, on_delete=models.CASCADE)
    class Meta:
        unique_together = ['liker', 'tweet']

    def __str__(self):
        return f"{self.liker} likes {self.post}"

class Follower(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user')
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='follower')
    class Meta:
        unique_together = ['user', 'follower']

    def __str__(self):
        return f"{self.follower} follows {self.user}"