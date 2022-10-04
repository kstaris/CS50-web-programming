
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("tweets/<str:profile>/<int:page>", views.tweets, name="tweets"),
    path("likes/<int:tweetId>", views.likes, name="likes"),
    path("profile/<str:username>", views.profile, name="profile"),
    path("follow", views.follow, name="follow"),
    path("like", views.like, name="like"),
    path("edit", views.edit, name="edit")
]
