from winreg import REG_QWORD
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError, models
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, redirect
from django.urls import reverse
import json
from .models import User, Tweet, Like, Follower
from django.views.decorators.csrf import csrf_exempt
import sys
from django.core.paginator import Paginator
from django.db.models import Count, Value
from django.contrib.auth.decorators import login_required

@csrf_exempt
def index(request):
    if request.method == "POST":
        data = json.loads(request.body)
        tweet = Tweet(
            author = request.user,
            text = data.get("text", "")
        )
        if tweet.author and tweet.text:
            tweet.save()
            return JsonResponse(tweet.serialize(), safe=False)
        else:
            return JsonResponse({"message": "Tweet was not sent successfully."}, status=201)
    else:
        return render(request, "network/index.html")

def renderProfile(request, username):
    print(username, file=sys.stdout)
    if username == 'all' or username == 'following':
        print(username, file=sys.stdout)
        return redirect('index')
    profile = User.objects.filter(id = username).annotate(following=Count('follower'))
    followers = Follower.objects.filter(user = profile[0])
    profile = profile.annotate(followers=Value(len(followers), output_field=models.CharField()))
    profile = profile[0]
    if Follower.objects.filter(user = username, follower = request.user):
        status = 'following'
    else: 
        status = 'notFollowing'
    prof = {
        'followers': profile.followers,
        'following': profile.following,
        'status': status,
        'username': profile.username
    }
    return JsonResponse(prof, safe=False)

@csrf_exempt
def profile(request, username):
    return render(request, 'network/index.html')

@login_required
@csrf_exempt
def follow(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        followTo = data.get('followTo')
        status = data.get('status')
        follows = Follower.objects.filter(follower = request.user.id, user = followTo)
        if int(followTo) != int(request.user.id):
            if status == 'notFollowing':
                follow = Follower(
                    user = User.objects.filter(id = followTo)[0],
                    follower = request.user
                )
                follow.save()
                return JsonResponse('following', safe=False)
            else:
                follows.delete()
                return JsonResponse('notFollowing', safe=False)

        else:
            return JsonResponse({'message': 'unsuccessful'})
    else:
        return HttpResponse(status= 401)

@csrf_exempt
@login_required
def like(request):
    if request.method == "POST":
        data = json.loads(request.body)
        liker = request.user
        tweet = data.get('tweet')
        if not Like.objects.filter(liker = liker, tweet = tweet):
            like = Like(
                liker = liker,
                tweet = Tweet.objects.filter(id = tweet)[0]
            )
            like.save()
            number = len(Like.objects.filter(tweet = tweet))
            return JsonResponse(number, safe=False)
        else:
            Like.objects.filter(liker = liker, tweet = tweet).delete()
            number = len(Like.objects.filter(tweet = tweet))
            return JsonResponse(number, safe=False)
    else:
        return JsonResponse({'message': 'Unsuccesful. Must be a post request'})

@csrf_exempt
@login_required
def edit(request):
    if request.method == "POST":
        data = json.loads(request.body)
        owner = data.get('owner')
        tweet = data.get('tweet')
        text = data.get('text')
        if str(request.user) == str(owner):
            tweet = Tweet.objects.get(id = tweet)
            tweet.text = text
            tweet.save()
            return JsonResponse({'message': 'Edit successful'})
        else:
            return JsonResponse({'message': 'Only owner of the tweet can edit'})


def tweets(request, profile, page):
    if profile == 'all':
        tweets = Tweet.objects.all().annotate(likes=Count('like')).order_by('-timestamp')
    elif profile == 'following':
        following = Follower.objects.filter(follower = request.user)
        followingUser = []
        for user in following:
            followingUser.append(user.user)
        tweets = Tweet.objects.filter(author__in = followingUser).annotate(likes=Count('like')).order_by('-timestamp')
    else:
        tweets = Tweet.objects.filter(author=profile).annotate(likes=Count('like')).order_by('-timestamp')
    paginator = Paginator(tweets, 10)
    page_number = page
    
    page_obj = paginator.get_page(page_number)
    tweetList = []
    for tweet in page_obj:
        sTweet = tweet.serialize()
        sTweet['likes'] = tweet.likes
        likeStatus = Like.objects.filter(liker = request.user , tweet = tweet.id)
        if likeStatus:
            sTweet['likeStatus'] = True
        tweetList.append(sTweet)
    data = {
        'tweets':tweetList,
        'has_previous': page_obj.has_previous(),
        'has_next': page_obj.has_next(),
        'number': str(page_obj.number),
        'num_pages': str(page_obj.paginator.num_pages),
    }
    if page_obj.has_previous():
        data['previous_page_number'] = page_obj.previous_page_number()
    if page_obj.has_next():
        data['next_page_number'] = page_obj.next_page_number(),
    data = json.dumps(data)
    return JsonResponse(data, safe=False)

def likes(request, tweetId):
    tweet = Tweet.objects.filter(id = tweetId)
    likes = Like.objects.filter(tweet = tweet[0])
    return JsonResponse(likes.count(), safe=False) 

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
