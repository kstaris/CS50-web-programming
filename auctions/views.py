from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, redirect
from django.urls import reverse
from django.contrib.auth.decorators import login_required
import sys
from .models import Bids, User, Listings, Watchlist, Comments
from .forms import ListingForm, BidForm, CommentForm
from django.db.models.aggregates import Max
from .util import currency

def index(request):
    listings = Listings.objects.all().filter(closed=None)
    return render(request, "auctions/index.html", {
        'listings': listings,
    })


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
            return render(request, "auctions/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "auctions/login.html")


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
            return render(request, "auctions/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "auctions/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/register.html")

@login_required
def create(request):
    if request.method == "POST":
        lform = ListingForm(request.POST, request.FILES)
        bform = BidForm(request.POST)
        if lform.is_valid() and bform.is_valid():
            listing = lform.save(commit=False)
            listing.seller = request.user
            listing.save()
            bid = bform.save(commit=False)
            bid.user = request.user
            bid.listing = listing
            bid.save()
        return redirect("index")
    else:
        listingForm = ListingForm()
        bidForm = BidForm()
        return render(request, "auctions/create.html", {
            'lform':listingForm,
            'bform':bidForm
        })

def listing(request, listing_id, title):
    listing = Listings.objects.get(pk=listing_id)
    try:
        Watchlist.objects.filter(user_id=request.user, listing_id = listing_id)[0]
        watchlist = True
    except:
        watchlist = False
    if listing.seller == request.user and not listing.closed:
        close = True
    else:
        close = False
    bid = Bids.objects.filter(listing_id=listing_id)
    bid = bid.aggregate(Max('bid'))
    winner = Bids.objects.get(listing_id=listing_id, bid=bid['bid__max'])
    if winner.user_id == request.user.id:
        won = True
    else:
        won = False
    comments = Comments.objects.filter(listing_id=listing_id)
    return render(request, "auctions/listing.html",{
        'listing': listing,
        'bid': currency(bid['bid__max']),
        'bidForm': BidForm(),
        'watchlist': watchlist,
        'close': close,
        'won': won,
        'comment': CommentForm(),
        'comments': comments
    })

@login_required(login_url='login')
def bid(request, listing_id):
    listing = Listings.objects.get(pk=listing_id)
    if request.method == 'POST':
        bform = BidForm(request.POST)
        if bform.is_valid():
            bid = bform.save(commit=False)
            bid.user = request.user
            bid.listing = Listings.objects.get(pk=listing_id)
            if bid.bid > Bids.objects.filter(listing_id=listing_id).aggregate(Max('bid'))['bid__max']:
                bid.save()
            else:
                try:
                    Watchlist.objects.filter(user_id=request.user, listing_id = listing_id)[0]
                    watchlist = True
                except:
                    watchlist = False
                listing = Listings.objects.get(pk=listing_id)
                bid = Bids.objects.filter(listing_id=listing_id)
                bid = bid.aggregate(Max('bid'))
                return render(request, "auctions/listing.html",{
                    'listing': listing,
                    'bid': currency(bid['bid__max']),
                    'bidForm': BidForm(),
                    'error': "Invalid Bid",
                    'watchlist': watchlist
                })
    return redirect(f'/listing/{listing_id}/{Listings.objects.get(pk = listing_id).title}')

@login_required(login_url='login')
def watchlist(request, listing_id=None):
    if request.method == 'POST':
        if not Watchlist.objects.filter(user_id=request.user, listing_id = listing_id):
            watchlist = Watchlist.objects.create(user_id=request.user, listing_id = Listings.objects.get(pk = listing_id))
            watchlist.save
        else:
            Watchlist.objects.get(user_id=request.user, listing_id = Listings.objects.get(pk = listing_id)).delete()
        return redirect(f'/listing/{listing_id}/{Listings.objects.get(pk = listing_id).title}')
    else:
        watchlist = Watchlist.objects.filter(user_id = request.user)
        print(f'Watchlist: {watchlist}', file=sys.stdout)
        return render(request, "auctions/watchlist.html", {
            'watchlist': watchlist
        })


@login_required(login_url='login')
def close(request, listing_id):
    listing = Listings.objects.get(pk=listing_id)
    if request.method == 'POST' and listing.seller == request.user:
        c = Listings.objects.get(pk=listing_id)
        c.closed = True
        c.save()   
    return redirect('index')

@login_required(login_url='login')
def comment(request, listing_id):
    if request.method == 'POST':
        listing = Listings.objects.get(pk=listing_id)
        if CommentForm(request.POST).is_valid():
            comment = CommentForm(request.POST).save(commit=False)
            comment.user_id = request.user
            comment.listing_id = listing
            comment.save()
            return redirect(f'/listing/{listing_id}/{Listings.objects.get(pk = listing_id).title}')

    else:
        return redirect(f'/listing/{listing_id}/{Listings.objects.get(pk = listing_id).title}')


def categories(request, category=None):
    if not category:
        categories = Listings.objects.all().values('category').distinct()
        print(f'Categories: {categories}', file=sys.stdout)
        return render(request, "auctions/categories.html", {
            'categories': categories
        })
    else:
        listings = Listings.objects.filter(category=category)
        return render(request, "auctions/categories.html", {
            'listings': listings
        })
