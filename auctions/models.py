from select import select
from ssl import Options
from statistics import mode
from django.contrib.auth.models import AbstractUser
from django.db import models

categories = [("Electronics","Electronics"), ("Collectibles & Art","Collectibles & Art"), 
("Home & Garden","Home & Garden"), ("Clothing, Shoes & Accessories","Clothing, Shoes & Accessories"), 
("Toys & Hobbies","Toys & Hobbies"), ("Sporting Goods","Sporting Goods"), ("Books, Movies & Music","Books, Movies & Music"), 
("Health & Beauty","Health & Beauty"), ("Business & Industrial","Business & Industrial"), ("Baby Essentials","Baby Essentials"), 
("Pet Supplies","Pet Supplies")]

class User(AbstractUser):
    pass


class Listings(models.Model):
    title = models.CharField(max_length=64)
    imageImg = models.ImageField(blank = True, null=True)
    category = models.CharField(blank = True, max_length=64, choices=categories)
    createDate = models.DateTimeField(auto_now_add=True)
    description = models.CharField(max_length=1024)
    seller = models.ForeignKey(User, on_delete=models.CASCADE)
    closed = models.BooleanField(blank = True, null=True)

    def __str__(self):
        return f"{self.title}"



class Bids(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    listing = models.ForeignKey(Listings, on_delete=models.CASCADE)
    bid = models.DecimalField(decimal_places=2, max_digits=6)

    def __str__(self):
        return f"User: {self.user} Listing:{self.listing} Bid:{self.bid}"

class Comments(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    listing_id = models.ForeignKey(Listings, on_delete=models.CASCADE)
    comment = models.CharField(max_length=1024)

    def __str__(self):
        return f"User: {self.user_id} Listing:{self.listing_id}"

class Watchlist(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    listing_id = models.ForeignKey(Listings, on_delete=models.CASCADE)

    def __str__(self):
        return f"User: {self.user_id} Listing: {self.listing_id}"